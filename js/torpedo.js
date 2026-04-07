/**
 * Global state object for the Torpedo extension.
 */
const torpedo = {
    // Counter for redirects.
    countRedirect: 0,
    // The domain of the torpedo target link.
    domain: "",
    // Timer to hide the tooltip.
    hideTimer: null,
    // The current location of the browser e.x. imap.gmail.com:993
    location: null,
    // The public suffix list instance.
    publicSuffixList: "",
    // the current state of the tooltip: "closed/pending/open"
    state: "closed",
    // The DOM element for which the tooltip should be shown.
    target: null,
    // The timer interval for the countdown timer.
    timerInterval: null,
    // The tooltip DOM element.
    tooltip: null,
    // The href of the URL object.
    url: "",
    // The URL object of the target link.
    urlObject: null,

    /**
     * Sets a new URL object and updates related properties.
     */
    setNewUrl(newUrlObject) {
        if (newUrlObject.hostname.endsWith(".")) {
            newUrlObject.hostname = newUrlObject.hostname.slice(0, -1);
        }

        this.urlObject = newUrlObject;
        this.url = newUrlObject.href;
        this.domain = this.extractDomain(this.urlObject.hostname);
    },

    /**
     * Extracts the domain from a given hostname using the public suffix list.
     * @param hostname - The hostname to extract the domain from.
     * @returns {string|*} - The extracted domain or the original hostname if the domain cannot be determined.
     */
    extractDomain(hostname) {
        if (isIP(hostname)) {
            return hostname;
        }

        const domain = this.publicSuffixList.getDomain(hostname);
        return domain ? domain : hostname;
    }
}