/**
 * Determines the security status of the current ``torpedo.url`` based on the settings stored in the ``storage``.
 *
 * @returns {Promise<string|string>} A string representing the security status (e.g., T1, T2, ...)
 */
async function getSecurityStatus(storage) {
    torpedo.countRedirect = 0;
    let referrerURL = matchReferrer(torpedo.url, storage);

    while (referrerURL !== "<NO_RESOLVED_REFERRER>") {
        try {
            const urlObject = new URL(referrerURL);
            torpedo.setNewUrl(urlObject);
        } catch (e) { }

        referrerURL = matchReferrer(torpedo.url, storage);
        torpedo.countRedirect++;
    }

    if (await isRedirect(torpedo.domain)) {

        if (!storage.privacyModeActivated) {
            await resolveRedirect();
            return "URLnachErmittelnButtonPrivacyMode";
        }

        return "URLnachErmittelnButton2";
    }

    if (inTrusted(torpedo.domain, storage)) return "T1";
    if (inUserList(torpedo.domain, storage)) return "T2";

    let tooltipWarning;
    if (torpedo.target.getAttribute("title")) {
        try {
            const externalTooltipUrlObject = new URL(torpedo.target.getAttribute("title"));
            tooltipWarning = !Utils.isDomainMatch(torpedo.domain, externalTooltipUrlObject.hostname);

        } catch (e) {
            tooltipWarning = false;
        }

    } else {
        tooltipWarning = false;
    }

    const mixedScript = isMixedScript(torpedo.domain);
    // const invisibleChar = hasInvisibleChar(torpedo.domain);

    if (tooltipWarning || mixedScript || isIP(torpedo.domain)) {
        return "T32";
    }

    if (torpedo.countRedirect === 0) {
        return isMismatch(torpedo.domain) ? "T32" : "T31";

    } else {
        return storage.redirectModeActivated && !isMismatch(torpedo.domain) ? "T31" : "T32";
    }
}


/**
 * Checks if the ``url`` is a known redirect URL.
 *
 * @returns {Promise<boolean>} A boolean indicating whether it is or not
 */
async function isRedirect(url) {
    try {
        const { redirectDomains = [] } = await browser.storage.sync.get("redirectDomains");
        return redirectDomains.some(domain => domain.includes(url));
    } catch (e) { }
}


/**
 * Checks for a mismatch between the ``domain`` and the link text (``torpedo.target.innerText``).
 *
 * @returns {boolean} A boolean indicating whether it is or not
 */
function isMismatch(domain) {
    try {
        let displayedLinkText = torpedo.target.innerText;
        const urlObject = new URL(displayedLinkText);
        const displayedDomain = torpedo.extractDomain(urlObject.hostname);

        return displayedDomain !== domain;

    } catch (e) {
        return false;
    }
}


/**
 * Checks if the ``domain`` is in the trusted list, based on the ``storage``.
 *
 * @returns {boolean|*|boolean} A boolean indicating whether it is or not
 */
function inTrusted(domain, storage) {
    return storage.trustedListActivated && storage.trustedDomains?.some(d => d.includes(domain));
}


/**
 * Checks if the ``domain`` is in the user-defined list, based on the ``storage``.
 *
 * @returns {boolean|*|boolean} A boolean indicating whether it is or not
 */
function inUserList(url, storage) {
    return storage.userDefinedDomains?.some(d => d.includes(url));
}


const IPV4_REGEX = new RegExp(
    /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/
);


/**
 * Checks if the ``address`` is a valid IPv4 address.
 *
 * @returns {boolean} A boolean indicating whether it is or not
 */
function isIP(address) {
    return IPV4_REGEX.test(address);
}


/**
 * Checks if the ``domain`` has invisible characters.
 *
 * @returns {boolean} A boolean indicating whether it is or not
 */
function hasInvisibleChar(domain) {
    try {
        domain = decodeURIComponent(domain);
    } catch (e) {
        // If decoding fails, continue with original string
    }

    // 2. Run the Regex
    const invisibleRegex = /[\p{Cf}\p{Cc}\p{Co}\p{Cn}]/u;
    return invisibleRegex.test(domain);
}


/**
 * Checks if the ``domain`` is a mixture if multiple scripts (like Latin and Cyrillic characters).
 *
 * @returns {boolean} A boolean indicating whether it is or not
 */
function isMixedScript(domain) {
    domain = punycode.toUnicode(domain);

    const hasLatin = /\p{Script=Latin}/u.test(domain);
    const hasOther = /\p{Script=Cyrillic}|\p{Script=Greek}/u.test(domain);

    return hasLatin && hasOther;
}
