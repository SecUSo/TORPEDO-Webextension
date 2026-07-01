/**
 * A utility module for every kind of tasks.
 * @type {{preventEvents: preventEvents, reactivateEvents: reactivateEvents, isDomainMatch: function(*, *): boolean}}
 */
const Utils = (function () {
    /**
     * Prevents the default actions and stops propagation of the specified event.
     * @param event - The event for which to prevent default actions and stop propagation.
     */
    function preventDefaultActions(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Prevents the specified events on the target element by adding event listeners that call preventDefaultActions.
     * @param target - The element on which to prevent the events.
     * @param eventTypes - An array of event types to prevent (e.g., ["click", "contextmenu"]).
     */
    function preventEvents(target, eventTypes) {
        eventTypes.forEach(eventType => target.addEventListener(eventType, preventDefaultActions, { capture: true }));
    }

    /**
     * Reactivates the specified events on the target element by removing the event listeners that prevent default
     * actions and adding a click listener to process clicks.
     * @param target - The element on which to reactivate the events.
     * @param eventTypes - An array of event types to reactivate (e.g., ["click", "contextmenu"]).
     */
    function reactivateEvents(target, eventTypes) {
        eventTypes.forEach(eventType => target.removeEventListener(eventType, preventDefaultActions, { capture: true }));
        target.addEventListener("click", () => processClick(target));
    }

    /**
     * Checks if the domains of two hostnames match by extracting their base domains and comparing them.
     * @param hostname1 - The first hostname to compare.
     * @param hostname2 - The second hostname to compare.
     * @returns {boolean} - True if the base domains match, false otherwise.
     */
    function isDomainMatch(hostname1, hostname2) {
        const domain1 = torpedo.extractDomain(hostname1);
        const domain2 = torpedo.extractDomain(hostname2);

        return domain1 === domain2;
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
            const domain = torpedo.extractDomain(urlObject.hostname);

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

    return { preventEvents, reactivateEvents, isDomainMatch };
})();