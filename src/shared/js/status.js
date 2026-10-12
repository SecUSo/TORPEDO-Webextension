/**
 * Resolves referrers and redirects for ``urlObj`` first, then evaluates the security status of the FINAL url.
 * @returns {Promise<{status: string, urlObj: URL, domain: string, redirectPending: boolean, redirectFailed: boolean}>}
 */
async function getSecurityStatus(targetElement, urlObj, storage, { forceRedirect = false } = {}) {
    const resolved = await resolveTarget(urlObj, storage, forceRedirect);
    const domain = Torpedo.extractDomain(resolved.urlObj.hostname);

    let status;
    let checks = {};

    if (resolved.redirectPending) {
        status = storage.privacyModeActivated ? "URLnachErmittelnButton2" : "URLnachErmittelnButtonPrivacyMode";
    } else {
        ({ status, checks } = evaluateDomain(targetElement, domain, resolved.referrerHops, storage));
    }

    debugLog("Security Evaluation Complete:", {
        finalUrl: resolved.urlObj.href,
        status,
        referrerHops: resolved.referrerHops,
        redirectPending: resolved.redirectPending,
        redirectFailed: resolved.redirectFailed,
        ...checks
    });

    return {
        status,
        urlObj: resolved.urlObj,
        domain,
        redirectPending: resolved.redirectPending,
        redirectFailed: resolved.redirectFailed
    };
}


/**
 * Follows referrers and redirects services until a final URL is reached. Referrers are resolved locally;
 * redirect services are resolved via the background script, unless privacy mode is active (then only
 * when ``forceRedirect`` is set).
 * @returns {Promise<{urlObj: URL, referrerHops: number, redirectPending: boolean, redirectFailed: boolean}>}
 */
async function resolveTarget(startUrlObj, storage, forceRedirect) {
    let urlObj = startUrlObj;
    let referrerHops = 0;
    const done = (redirectPending, redirectFailed) => ({ urlObj, referrerHops, redirectPending, redirectFailed });

    let keepResolving = true;
    while (keepResolving) {
        // Check for referrer
        const referrerRaw = matchReferrer(urlObj.href, storage);
        if (referrerRaw !== "<NO_RESOLVED_REFERRER>") {
            let next = null;
            try {
                next = new URL(referrerRaw);
            } catch (e) { }

            if (next) {
                urlObj = next;
                referrerHops++;
                continue;
            }
        }

        // return if no referrer, nor redirect
        if (!(await isRedirect(Torpedo.extractDomain(urlObj.hostname)))) {
            return done(false, false);
        }

        // from here on, we have a redirect
        if (storage.privacyModeActivated && !forceRedirect) {
            return done(true, false);
        }

        let next = null;
        try {
            const redirectResult = await browser.runtime.sendMessage({ name: "redirect", url: urlObj.href });
            next = new URL(redirectResult);
        } catch (e) { }
        if (!next) {
            return done(true, true);
        }

        urlObj = next;
    }
}


/**
 * Pure evaluation of an already resolved domain.
 * @returns {{status: string, checks: Object}}
 */
function evaluateDomain(targetElement, domain, referrerHops, storage) {
    if (storage.trustedListActivated && storage.trustedDomains.includes(domain)) {
        return { status: "T1", checks: {} };
    }
    if (storage.userDefinedDomains.includes(domain)) {
        return { status: "T2", checks: {} };
    }

    let tooltipWarning = false;
    const titleAttr = targetElement.getAttribute("title");
    if (titleAttr) {
        try {
            const externalUrlObj = new URL(titleAttr);
            tooltipWarning = !(domain === Torpedo.extractDomain(externalUrlObj.hostname));

        } catch (e) { }
    }
    const checks = {
        tooltipWarning: tooltipWarning,
        mixedScript: isMixedScript(domain),
        invisibleChar: hasInvisibleChar(domain),
        isIp: isIPv4(domain)
    };

    if (Object.values(checks).some(Boolean)) {
        return { status: "T32", checks };
    }

    checks.visualMismatch = isVisualMismatch(domain, targetElement);

    // Redirected links are only safe if the user allows it and the visible text does not contradict the target.
    const redirectsOk = referrerHops === 0 || storage.redirectModeActivated;
    return { status: !checks.visualMismatch && redirectsOk ? "T31" : "T32", checks };
}


/**
 * Checks for a visual mismatch between the underlying domain and the text displayed to the user.
 * @returns {boolean} - True if there is a deceptive mismatch, false otherwise.
 */
function isVisualMismatch(domain, targetElement) {
    try {
        const urlObject = new URL(targetElement.innerText);
        return Torpedo.extractDomain(urlObject.hostname) !== domain;

    } catch (e) {
        return false;
    }
}


/**
 * Inspects a domain name for hodden or invisible Unicode characters.
 * @returns {boolean} - True if invisible formatiing characters are found.
 */
function hasInvisibleChar(domain) {
    try {
        domain = decodeURIComponent(domain);
    } catch (e) { }

    return /[\p{Cf}\p{Cc}\p{Co}\p{Cn}]/u.test(domain);
}


/**
 * Checks if the domain mixes multiple writing scripts (e.g. Latin, Cyrillic)
 * @returns {boolean} - True if multiple conflicting scripts are detected.
 */
function isMixedScript(domain) {
    domain = punycode.toUnicode(domain);

    const hasLatin = /\p{Script=Latin}/u.test(domain);
    const hasOther = /\p{Script=Cyrillic}|\p{Script=Greek}/u.test(domain);

    return hasLatin && hasOther;
}
