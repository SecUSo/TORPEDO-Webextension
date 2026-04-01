/**
 * Content script for the Torpedo browser extension.
 */
(async function () {
    /**
     * Main function to initialize the content script.
     */
    async function main() {
        torpedo.location = window.location.host || "mail-message";

        try {
            const tldData = await browser.runtime.sendMessage({ name: "TLD" });
            if (tldData) torpedo.publicSuffixList.parse(tldData, punycode.toASCII);

        } catch (e) {
            console.error("Failed to fetch TLD data:", e);
        }

        const tbConfig = { selectors: ["body"] };
        setupEventListeners(tbConfig);

        await browser.runtime.sendMessage({ name: "ok", location: torpedo.location });
    }

    /**
     * Sets up event listeners for regular pages.
     */
    function setupEventListeners(config) {
        const anchorSelectors = config.selectors.map((selector) => selector + " a").join();
        const formSelectors = config.selectors.map((selector) => selector + " form").join();

        document.body.addEventListener("mouseover", (event) => {
            const targetLink = event.target.closest(anchorSelectors);
            if (targetLink) openTooltip(targetLink, "a");

            const targetForm = event.target.closest(formSelectors);
            if (targetForm) openTooltip(targetForm, "form");
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
        if (torpedo.opened) {
            if (e === torpedo.target && torpedo.hideTimer) {
                clearTimeout(torpedo.hideTimer);
            }
            return;
        }

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

            if (!href || href.includes("mailto:")) {
                Utils.reactivateEvents(torpedo.target, eventTypes);
                return;
            }
        }

        let url;
        try {
            const raw = type === "form" ? torpedo.target.action : torpedo.target.href;
            url = new URL(raw);

        } catch (e) {
            Utils.reactivateEvents(torpedo.target, eventTypes);
            return;
        }

        torpedo.setNewUrl(url);

        try {
            torpedo.target.addEventListener("mouseenter", handleMouseEnter);
            torpedo.target.addEventListener("mouseleave", handleMouseLeave);
            await TooltipManager.showTooltip(torpedo.target);

        } catch (err) {
            console.log(`Error showing tooltip for ${url.href}:`, err);
            await browser.runtime.sendMessage({ name: "error", location: torpedo.location });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", main);
    } else {
        await main();
    }

})();
