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
    debug: false,
    // The current website or Thunderbird location
    location: null,
    // The public suffix list instance
    publicSuffixList: "",
    // The current target element over which the user hovered
    target: null,
    // The map connecting DOM targets to their attribute dictionary
    targetTooltipMap: new Map(),
    // The cache for HTML files and images
    cache: new Map(),

    /**
     * Extracts the base domain from the ``hostname`` using the public suffix list.
     * If the ``hostname`` is an IP address, it returns the IP directly.
     * @returns {string} - The extracted base domain or the original hostname.
     */
    extractDomain(hostname) {
        if (isIPv4(hostname)) return hostname;

        const domain = this.publicSuffixList.getDomain(hostname);
        return domain ? domain : hostname;
    },

    /**
     * Retrieves a resource (HTML or image) from the background script, utilizing a cache
     * to avoid duplicate requests for the same file.
     * @returns {Promise<any|null>} - A promise resolving to the resource data, or null.
     */
    async loadFromCache(path, type) {
        if (!this.cache.has(path)) {
            let requestPromise;

            switch (type) {
                case "HTML":
                    requestPromise = browser.runtime.sendMessage({ name: "loadResource", path: path });
                    break;
                case "img": {
                    requestPromise = browser.runtime.sendMessage({ name: "getImageData", path: path });
                    break;
                }
                default:
                    return null;
            }

            this.cache.set(path, requestPromise);

            requestPromise.catch((error) => {
                console.error(`Failed to load ${path}: ${error}`);
                this.cache.delete(path);
            });
        }

        return await this.cache.get(path);
    }
}