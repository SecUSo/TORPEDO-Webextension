/**
 * The browser version of the content script for the Torpedo browser extension.
 */
(async function () {
    const SITE_SELECTORS = {
        "mail.yahoo.com": ['div[data-test-id="message-view"]'],
        "mail.google.com": [".adn"],
        "owa.kit.edu": ['div[role="list"]', " div.isMessageBodyInPopout"],
        "outlook.live.com": ['div[role="main"]'],
        "mail.aol.com": ["#displayMessage"],
        "email.t-online.de": ["mailreadview"]
    };
    const pageState = {
        isReady: false,
        error: null,
        selectors: null
    }

    Torpedo.location = window.location.hostname;
    pageState.selectors = SITE_SELECTORS[Torpedo.location];

    addPageStateListener();

    if (!pageState.selectors) {
        pageState.error = "UNSUPPORTED_SITE";
        await browser.runtime.sendMessage({ name: "error" });
        return;
    }

    try {
        const tldData = await browser.runtime.sendMessage({ name: "TLD" });
        Torpedo.publicSuffixList.parse(tldData, punycode.toASCII);
        pageState.isReady = true;

    } catch (error) {
        pageState.error = "TLD_FETCH_FAILED";
        await browser.runtime.sendMessage({ name: "error" });
        return;
    }

    await browser.runtime.sendMessage({ name: "ok" });
    addEventListeners();

    /**
     *
     */
    function addEventListeners() {
        const anchorSelectors = pageState.selectors.map(selector => `${selector} a`).join(", ");

        document.addEventListener("mouseover", (event) => {
            const targetAnchor = event.target.closest(anchorSelectors);
            if (targetAnchor) openTooltip(targetAnchor, "a");
        });
    }

    /**
     *
     */
    function addPageStateListener() {
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.name === "getPageState") {
                if (pageState.error) {
                    sendResponse({ location: Torpedo.location, status: "error", reason: pageState.error });
                    return false;
                }

                if (!pageState.isReady) {
                    sendResponse({ location: Torpedo.location, status: "loading" });
                    return false;
                }

                const selectorsFound = document.body.querySelector(pageState.selectors.join()) ? true : false;
                sendResponse({ location: Torpedo.location, status: "success", foundSelectors: selectorsFound });
            }

            return false;
        });
    }


    /**
     * This method is being called when the user hovers over a link
     * and the tooltip should open.
     */
    async function openTooltip(newTarget) {
        if (newTarget.classList.contains("torpedo-URL")) return;

        const href = newTarget.href;
        if (!href || href.includes("mailto:") || href.includes("tel:")) return;

        const currTarget = Torpedo.target;
        if (newTarget === currTarget) return;

        debugLog("Tooltip triggered for link:", href);

        // if the tooltip of the current Torpedo target is shown
        if (Torpedo.targetTooltipMap.has(currTarget)) {
            TooltipManager.hideTooltip(currTarget);
        }

        Torpedo.target = newTarget;

        preventEvents(newTarget, ["click", "contextmenu", "mouseup", "mousedown"]);

        newTarget.addEventListener("mouseenter", handleMouseEnter);
        newTarget.addEventListener("mouseleave", handleMouseLeave);

        try {
            await TooltipManager.showTooltip(newTarget);

        } catch (err) {
            TooltipManager.hideTooltip(newTarget);

            debugLog(`Error showing tooltip for ${newTarget.href}:`, err);
            pageState.error = "TOOLTIP_ERROR";
            await browser.runtime.sendMessage({ name: "error" });
        }
    }
})();