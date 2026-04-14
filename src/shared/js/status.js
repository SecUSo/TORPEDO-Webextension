/**
 * Determines the security status of the current domain.
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
        const externalTooltipUrlObject = new URL(torpedo.target.getAttribute("title"));
        tooltipWarning = !Utils.isDomainMatch(torpedo.domain, externalTooltipUrlObject.hostname);

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
 * Checks if a URL is a known redirector.
 */
async function isRedirect(url) {
    try {
        const { redirectDomains = [] } = await browser.storage.sync.get("redirectDomains");
        return redirectDomains.some(domain => domain.includes(url));
    } catch (e) { }
}


/**
 * Checks for a mismatch between the link text and the actual domain.
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
 * Checks if a domain is in the trusted list.
 */
function inTrusted(domain, storage) {
    return storage.trustedListActivated && storage.trustedDomains?.some(d => d.includes(domain));
}

/**
 * Checks if a domain is in the user-defined list.
 */
function inUserList(url, storage) {
    return storage.userDefinedDomains?.some(d => d.includes(url));
}

const IPV4_REGEX = new RegExp(
    /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/
);

/**
 * Checks if an address is a valid IPv4 address.
 */
function isIP(address) {
    return IPV4_REGEX.test(address);
}

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

function isMixedScript(domain) {
    domain = punycode.toUnicode(domain);

    const hasLatin = /\p{Script=Latin}/u.test(domain);
    const hasOther = /\p{Script=Cyrillic}|\p{Script=Greek}/u.test(domain);

    return hasLatin && hasOther;
}
