/**
 * Resolves the current ``torpedo.url`` by asking the ``service_worker`` to follow a URL and set the returned
 * destination as the new URL.
 *
 * @returns {Promise<void>}
 */
async function resolveRedirect() {
    TooltipManager.showLoaderWithOverlay();

    const redirect = await browser.runtime.sendMessage({ name: "redirect", url: torpedo.url });

    const urlObject = new URL(redirect);
    torpedo.setNewUrl(urlObject);

    await TooltipManager.updateTooltip();
}


/**
 * Inspects a given URL against a three-part referrer rule set to extract an embedded target URL.
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

