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
        target.addEventListener("click", () => TooltipManager.processClick());
    }

    /**
     * Compares the domains of two URLs.
     */
    function isDomainMatch(url1, url2) {
        const domain1 = TooltipManager.extractDomain(url1);
        const domain2 = TooltipManager.extractDomain(url2);

        return domain1 === domain2;
    }

    return { preventEvents, reactivateEvents, isDomainMatch };
})();