const Utils = (function () {
    /**
     * Prevents default actions for the given event.
     */
    function preventDefaultActions(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Prevents the specified events on the target element.
     */
    function preventEvents(target, eventTypes) {
        eventTypes.forEach(eventType => target.addEventListener(eventType, preventDefaultActions, { capture: true }));
    }

    /**
     * Reactivates the specified events on the target element and adds a click listener to process the tooltip click.
     */
    function reactivateEvents(target, eventTypes) {
        eventTypes.forEach(eventType => target.removeEventListener(eventType, preventDefaultActions, { capture: true }));
        target.addEventListener("click", () => processClick());
    }

    /**
     * Compares the domains of two URLs.
     */
    function isDomainMatch(url1, url2) {
        const domain1 = TooltipManager.extractDomain(url1);
        const domain2 = TooltipManager.extractDomain(url2);

        return domain1 === domain2;
    }

    /**
     * Processes a click on the link for which the tooltip is shown.
     * @returns {Promise<void>} - A promise that resolves when the click processing is complete.
     */
    async function processClick() {
        const storage = await browser.storage.sync.get(["userDefinedDomains", "trustedDomains", "onceClickedDomains"]);
        if (storage.userDefinedDomains.includes(torpedo.domain) || storage.trustedDomains.includes(torpedo.domain)) return;

        let { onceClickedDomains = [] } = storage;
        if (onceClickedDomains.includes(torpedo.domain)) {
            await browser.storage.sync.set({
                onceClickedDomains: onceClickedDomains.filter(d => d !== torpedo.domain),
                userDefinedDomains: [...(storage.userDefinedDomains || []), torpedo.domain]
            })

        } else {
            await browser.storage.sync.set({ onceClickedDomains: [...onceClickedDomains, torpedo.domain] });
        }
    }

    return { preventEvents, reactivateEvents, isDomainMatch };
})();