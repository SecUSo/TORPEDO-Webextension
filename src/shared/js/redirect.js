/**
 * Checks if the ``URL`` matches any known redirect domains stored in the user settings.
 * @returns {Promise<boolean>} - A promise resolving to true if it is a known redirect, otherwise false.
 */
async function isRedirect(url) {
    try {
        const { redirectDomains = [] } = await browser.storage.sync.get("redirectDomains");
        return redirectDomains.some(domain => domain.includes(url));
    } catch (e) {
        return false;
    }
}


/**
 * Inspects a ``URL`` against a three-part referrer rule set stored in the ``storage``
 * to extract an embedded target URL.
 * @returns {string} - The decoded embedded target URL, or '<NO_RESOLVED_REFERRER>'.
 */
function matchReferrer(url, storage) {
    const {referrerPart1, referrerPart2, referrerPart3} = storage;
    if (!referrerPart1 || !referrerPart2 || !url) {
        return "<NO_RESOLVED_REFERRER>";
    }

    const href = new URL(url);
    const hostnameURL = href.hostname;

    const indices = referrerPart1
        .map((element, i) => {
            const domainParts = element.split("*").filter(Boolean);
            return domainParts.every(part => hostnameURL.includes(part)) ? i : -1;
        })
        .filter(index => index !== -1);

    for (const index of indices) {
        const pathParts = referrerPart2[index].split("[...]").filter(Boolean);
        if (pathParts.every(part => url.includes(part))) {
            const cut = referrerPart3[index];
            const urlAttrIndex = url.indexOf(cut);
            if (urlAttrIndex !== -1) {
                let temp = url.substring(urlAttrIndex + cut.length);
                temp = decodeURIComponent(temp);
                if (temp.startsWith("http") || temp.startsWith("www")) {
                    return temp;
                }
            }
        }
    }

    return "<NO_RESOLVED_REFERRER>";
}
