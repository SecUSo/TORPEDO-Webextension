const handleMouseEnter = (event) => {
    const target = event.currentTarget;
    const dict = Torpedo.targetTooltipMap.get(target);

    if (dict && dict.hideTimer) clearTimeout(dict.hideTimer);
};
/**
 * Handles mouse leave events on the target element.
 */
const handleMouseLeave = (event) => {
    const target = event.currentTarget;
    const dict = Torpedo.targetTooltipMap.get(target);
    if (!dict) return;

    dict.hideTimer = setTimeout(() => TooltipManager.hideTooltip(target), 150);
};


/**
 * The global ``Torpedo`` state object of the Extension across files.
 * @type {{location: null, publicSuffixList: string, target: null, targetTooltipMap: Map<any, any>, cache: Map<any, any>, extractDomain(*): (string|*), loadFromCache(*, *): Promise<null|*>}}
 */
const Torpedo = {
    // The debug flag for the debug mode
    debug: false,
    // The current website or Thunderbird location
    location: null,
    // The public suffix list instance
    publicSuffixList: "",
    // The current target element over which the user hovered
    target: null,
    // The map connecting DOM targets to their attribute dictionary
    targetTooltipMap: new Map(),

    /**
     * Extracts the base domain from the ``hostname`` using the public suffix list.
     * If the ``hostname`` is an IP address, it returns the IP directly.
     * @returns {string} - The extracted base domain or the original hostname.
     */
    extractDomain(hostname) {
        if (isIPv4(hostname)) return hostname;

        const domain = this.publicSuffixList.getDomain(hostname);
        return domain ? domain : hostname;
    }
}