/**
 * Orchestrates the security checks for a hovered ``targetElement``, resolving redirects and determining
 * the final security tier.
 * @returns {Promise<{status: string, finalUrl: string}>} - An object containing the status code and final URL.
 */
async function getSecurityStatus(targetElement, dict, storage) {
    let countRedirect = 0;
    let currentUrl = dict.urlObj.href;
    let currentDomain = dict.domain;
    let result;

    let tooltipWarning = null;
    let mixedScript = null;
    let invisibleChar = null;
    let isIp = null;
    let visualMismatch = null;

    let referrerURL = matchReferrer(currentUrl, storage);
    while (referrerURL !== "<NO_RESOLVED_REFERRER>") {
        try {
            const newUrlObj = new URL(referrerURL);
            currentUrl = newUrlObj.href;
            currentDomain = Torpedo.extractDomain(newUrlObj.hostname);
            dict.urlObj = newUrlObj;
            dict.domain = currentDomain;

        } catch (e) { }

        referrerURL = matchReferrer(currentUrl, storage);
        countRedirect++;
    }

    if (await isRedirect(currentDomain)) {
        if (!storage.privacyModeActivated) {

            const redirectResult = await browser.runtime.sendMessage({ name: "redirect", url: currentUrl });
            if (redirectResult) {
                const newUrlObj = new URL(redirectResult);
                currentUrl = newUrlObj.href;
                currentDomain = Torpedo.extractDomain(newUrlObj.hostname);
                dict.urlObj = newUrlObj;
                dict.domain = currentDomain;
            }

            result = { status: "URLnachErmittelnButtonPrivacyMode", finalUrl: currentUrl };
        } else {
            result = { status: "URLnachErmittelnButton2", finalUrl: currentUrl };
        }

    } else {
        const inTrustedList = storage.trustedListActivated && storage.trustedDomains?.some(d => d.includes(currentDomain));
        const inUserTrustedList = storage.userDefinedDomains?.some(d => d.includes(currentDomain));

        if (inTrustedList) {
            result = { status: "T1", finalUrl: currentUrl };

        } else if (inUserTrustedList) {
            result = { status: "T2", finalUrl: currentUrl };

        } else {
            tooltipWarning = false;
            const titleAttr = targetElement.getAttribute("title");
            if (titleAttr) {
                try {
                    const externalUrlObj = new URL(titleAttr);
                    tooltipWarning = !(Torpedo.extractDomain(currentDomain) === Torpedo.extractDomain(externalUrlObj.hostname));

                } catch (e) { }
            }

            mixedScript = isMixedScript(currentDomain);
            invisibleChar = hasInvisibleChar(currentDomain);
            isIp = isIPv4(currentDomain);

            if (tooltipWarning || mixedScript || invisibleChar || isIp) {
                result = { status: "T32", finalUrl: currentUrl };

            } else {
                visualMismatch = isVisualMismatch(currentDomain, targetElement);
                if (countRedirect === 0) {
                    result = { status: visualMismatch ? "T32" : "T31", finalUrl: currentUrl };

                } else {
                    result = {status: storage.redirectModeActivated && !visualMismatch ? "T31" : "T32", finalUrl: currentUrl};
                }
            }
        }
    }

    debugLog("Security Evaluation Complete:", {
        finalUrl: result.finalUrl,
        status: result.status,
        redirectsFound: countRedirect,
        tooltipWarning,
        mixedScript,
        invisibleChar,
        isIp,
        visualMismatch
    });

    return result;
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
