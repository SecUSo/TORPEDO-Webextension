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
    // The current location of the browser e.x. mail.google.com
    location: null,
    oldDomain: "",
    // Flag that indicating if the tooltip is currently open.
    opened: false,
    // The public suffix list instance.
    publicSuffixList: "",
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
        this.domain = TooltipManager.extractDomain(newUrlObject.hostname)
    }
}