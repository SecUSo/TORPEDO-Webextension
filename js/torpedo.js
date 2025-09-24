/**
 * Global state object for the Torpedo extension.
 */
const torpedo = {
    // Counter for redirects.
    countRedirect: 0,
    // The domain of the torpedo target link.
    domain: "",
    hasTooltip: false,
    // Timer to hide the tooltip.
    hideTimer: null,
    // The current location of the browser e.x. mail.google.com
    location: null,
    oldDomain: "",
    oldUrl: "",
    // Flag that indicating if the tooltip is currently open.
    opened: false,
    // The pathname of the URL.
    pathname: "",
    progUrl: false,
    // The public suffix list instance.
    publicSuffixList: "",
    // The current security state of the target URL.
    state: "unknown",
    // The DOM element for which the tooltip should be shown.
    target: null,
    // The timer interval for the countdown timer.
    timerInterval: null,
    // The tooltip DOM element.
    tooltip: null,
    // The href of the URL object.
    url: ""
}