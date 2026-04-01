/**
 * Resolves a redirect URL (e.g., a short URL).
 */
async function resolveRedirect() {
    TooltipManager.showLoaderWithOverlay();

    const redirect = await browser.runtime.sendMessage({ name: "redirect", url: torpedo.url });

    const urlObject = new URL(redirect);
    torpedo.setNewUrl(urlObject);

    await TooltipManager.updateTooltip();
}


/**
 * checks if the current url is a referrer 
 *
 * @return resolved referrer or <NO_RESOLVED_REFERRER> if the current url is no referrer or there was an error 
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

