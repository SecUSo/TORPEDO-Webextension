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

    /**
     * Main function to initialize the content script.
     */
    async function main() {
        torpedo.location = window.location.hostname;
        pageState.selectors = SITE_SELECTORS[torpedo.location];

        addPageStateListener();

        if (!pageState.selectors) {
            pageState.error = "UNSUPPORTED_SITE";
            return;
        }

        try {
            const tldData = await browser.runtime.sendMessage({ name: "TLD" });
            torpedo.publicSuffixList.parse(tldData, punycode.toASCII);
            pageState.isReady = true;

        } catch (error) {
            pageState.error = "TLD_FETCH_FAILED";
            return;
        }

        addEventListeners();
    }

    function addEventListeners() {
        const anchorSelectors = pageState.selectors.map(selector => `${selector} a`).join(", ");

        document.addEventListener("mouseover", (event) => {
            const targetAnchor = event.target.closest(anchorSelectors);

            if (targetAnchor) {
                openTooltip(targetAnchor, "a");
            }
        });
    }

    function addPageStateListener() {
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.name === "getPageState") {
                if (pageState.error) {
                    sendResponse({ location: torpedo.location, status: "error", reason: pageState.error });
                    return false;
                }

                if (!pageState.isReady) {
                    sendResponse({ location: torpedo.location, status: "loading" });
                    return false;
                }

                const selectorsFound = document.body.querySelector(pageState.selectors.join()) ? true : false;
                sendResponse({ location: torpedo.location, status: "success", foundSelectors: selectorsFound });
            }

            return false;
        });
    }

    /**
     * Handles mouse enter events on the target element.
     */
    const handleMouseEnter = () => {
        if (torpedo.hideTimer) clearTimeout(torpedo.hideTimer);
    };

    /**
     * Handles mouse leave events on the target element.
     */
    const handleMouseLeave = () => {
        torpedo.hideTimer = setTimeout(() => TooltipManager.hideTooltip(), 150);
    };

    /**
     * This method is being called when the user hovers over a link
     * and the tooltip should open.
     */
    async function openTooltip(e, type) {
        if (e.classList.contains("torpedo-URL")) {
            return;
        }

        if (torpedo.state !== "closed") {
            if (e === torpedo.target) {
                if (torpedo.hideTimer) {
                    clearTimeout(torpedo.hideTimer);
                }
                return;
            } else {
                TooltipManager.hideTooltip();
            }
        }

        torpedo.state = "pending";

        if (torpedo.target) {
            torpedo.target.removeEventListener("mouseenter", handleMouseEnter);
            torpedo.target.removeEventListener("mouseleave", handleMouseLeave);
        }

        torpedo.target = e;

        torpedo.target.removeEventListener("mouseenter", handleMouseEnter);
        torpedo.target.removeEventListener("mouseleave", handleMouseLeave);

        const eventTypes = ["click", "contextmenu", "mouseup", "mousedown"];
        Utils.preventEvents(torpedo.target, eventTypes);

        if (type === "a") {
            const href = torpedo.target.href;

            if (!href || href.includes("mailto:") || href.includes("tel:")) {
                Utils.reactivateEvents(torpedo.target, eventTypes);
                torpedo.state = "closed";
                return;
            }

            if (href === "") {
                try {
                    torpedo.target.setAttribute("href", e.relatedTarget.href);
                } catch (e) {}
            }
        }

        const url = type === "form" ? new URL(torpedo.target.action) : new URL(torpedo.target.href);
        torpedo.setNewUrl(url);

        try {
            const storage = await browser.storage.sync.get(null);
            if (storage.referrerSites.includes(torpedo.location)) {
                matchReferrer(storage);
                torpedo.target.href = torpedo.url;
            }

            torpedo.target.addEventListener("mouseenter", handleMouseEnter);
            torpedo.target.addEventListener("mouseleave", handleMouseLeave);
            await TooltipManager.showTooltip(torpedo.target);

        } catch (err) {
            console.log(`Error showing tooltip for ${url.href}:`, err);
            torpedo.state = "closed";
            await browser.runtime.sendMessage({ name: "error", location: torpedo.location });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", main);
    } else {
        await main();
    }

})();