/**
 * The Thunderbird version of the content script for the Torpedo browser extension.
 */
(async function () {
    const pageState = {
        isReady: false,
        error: null,
        selectors: null
    }

    /**
     * Main function to initialize the content script.
     */
    async function main() {
        torpedo.location = window.location.hostname || "mailbox";
        pageState.selectors = ["body"];

        addPageStateListener();

        try {
            const tldData = await browser.runtime.sendMessage({ name: "TLD" });
            torpedo.publicSuffixList.parse(tldData, punycode.toASCII);
            pageState.isReady = true;

        } catch (error) {
            pageState.error = "TLD_FETCH_FAILED";
            await browser.runtime.sendMessage({ name: "error" });
            return;
        }

        await browser.runtime.sendMessage({ name: "ok" });
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

                sendResponse({ location: torpedo.location, status: "success", foundSelectors: true });
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
        }

        let url;
        try {
            const raw = type === "form" ? torpedo.target.action : torpedo.target.href;
            url = new URL(raw);

        } catch (e) {
            Utils.reactivateEvents(torpedo.target, eventTypes);
            torpedo.state = "closed";
            return;
        }

        torpedo.setNewUrl(url);

        try {
            torpedo.target.addEventListener("mouseenter", handleMouseEnter);
            torpedo.target.addEventListener("mouseleave", handleMouseLeave);
            await TooltipManager.showTooltip(torpedo.target);

        } catch (err) {
            console.log(`Error showing tooltip for ${url.href}:`, err);
            torpedo.state = "closed";
            pageState.error = "TOOLTIP_ERROR";
            await browser.runtime.sendMessage({ name: "error" });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", main);
    } else {
        await main();
    }

})();