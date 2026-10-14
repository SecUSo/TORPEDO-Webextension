/**
 * Checks if the ``address`` is a valid IPv4 address.
 * @returns {boolean} - True if it is an IPv4 address, false otherwise.
 */
function isIPv4(address) {
    const parts = address.split(".");
    if (parts.length !== 4) return false;

    return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255 && part === String(num);
    });
}


function preventEvents(target) {
    if (target.hasAttribute("href")) {
        target.dataset.href = target.getAttribute("href");
        target.removeAttribute("href");
    }
}

function reactivateEvents(target) {
    if (target.dataset.href) {
        target.setAttribute("href", target.dataset.href);
        delete target.dataset.href;
    }

    target.addEventListener("click", () => processClick(target));
}


/**
 * Processes a click on the link for which the tooltip is shown.
 * @param target - The div container of the clicked link.
 * @returns {Promise<void>} - A promise that resolves when the click processing is complete.
 */
async function processClick(target) {
    // extract the link
    const urlString = target.getAttribute('href') || target.dataset.href;
    if (!urlString) return;

    try {
        // extract the domain from the URL
        const urlObject = new URL(urlString);
        const domain = Torpedo.extractDomain(urlObject.hostname);

        const storage = await browser.storage.sync.get({
            userDefinedDomains: [],
            trustedDomains: [],
            onceClickedDomains: []
        });

        const { userDefinedDomains, trustedDomains, onceClickedDomains } = storage;

        // do nothing if the domain is already in userDefinedDomains or trustedDomains
        if (userDefinedDomains.includes(domain) || trustedDomains.includes(domain)) {
            return;
        }

        const update = {};

        if (onceClickedDomains.includes(domain)) {
            // move from 'onceClicked' to 'userDefined'
            update.onceClickedDomains = onceClickedDomains.filter(d => d !== domain);
            update.userDefinedDomains = [...userDefinedDomains, domain];

        } else {
            // add to 'onceClicked'
            update.onceClickedDomains = [...onceClickedDomains, domain];
        }

        await browser.storage.sync.set(update);

    } catch (error) {
        console.error("Invalid URL or storage error:", error);
    }
}


/**
 * It parses only a limited set of HTML tags from a string and returns a DocumentFragment containing
 * the parsed elements, to avoid the "innerHTML" api because of security issues.
 * @param str - The string containing HTML tags.
 * @returns {DocumentFragment} - The resulting DocumentFragment.
 */
function parseLimitedMarkup(str) {
    const frag = document.createDocumentFragment();
    const re = /<br\s*\/?>|<span\s+class=['"]([^'"]+)['"]>(.*?)<\/span>/gis;
    let lastIndex = 0;
    let match;

    while ((match = re.exec(str)) !== null) {
        if (match.index > lastIndex) {
            frag.appendChild(document.createTextNode(str.slice(lastIndex, match.index)));
        }

        if (match[0].toLowerCase().startsWith("<br")) {
            frag.appendChild(document.createElement("br"));

        } else{
            const span = document.createElement("span");
            span.className = match[1];
            span.textContent = match[2];
            frag.appendChild(span);
        }

        lastIndex = re.lastIndex;
    }

    if (lastIndex < str.length) {
        frag.appendChild(document.createTextNode(str.slice(lastIndex)));
    }

    return frag;
}


function debugLog(...args) {
    if (Torpedo.debug) {
        console.log("%c[TORPEDO Debug]", "color: #00ff00; font-weight: bold;", ...args);
    }
}
