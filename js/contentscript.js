(async function () {
    /**
     * Start entry point of the Torpedo extension.
     */
    async function main() {
        const siteConfig = {
            "mail.yahoo.com": { selectors: ['div[data-test-id="message-view"]'] },
            "mail.google.com": { selectors: [".adn"] },
            "owa.kit.edu": { selectors: ['div[role="list"]', " div.isMessageBodyInPopout"] },
            "outlook.live.com": { selectors: ['div[role="main"]'] },
            "mail.aol.com": { selectors: ["#displayMessage"] },
            "email.t-online.de": { iframe: ["mailreadview"] },
            default: { iframe: ["mailbody"] }
        };

        torpedo.location = window.location.host;
        const config = siteConfig[torpedo.location] || siteConfig.default;

        try {
            const tldData = await browser.runtime.sendMessage({ name: "TLD" });
            if (tldData) torpedo.publicSuffixList.parse(tldData, punycode.toASCII);

        } catch (e) {
            console.error("Failed to fetch TLD data:", e);
        }

        if (!config.iframe) {
            setupEventListeners(config);

        } else {
            setupIframeEventListeners();
        }

        checkPageAndSetIcon(config);
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
            if (targetForm) {
                openTooltip(targetForm, "form");
                torpedo.progUrl = true;
            }
        });
    }

    /**
     * Sets up event listeners for iframes.
     */
    function setupIframeEventListeners() {
        document.body.addEventListener("mouseover", (event) => {
            const anchorTarget = event.target.closest("a");
            if (anchorTarget && event.view.location.href.includes("iframe")) openTooltip(anchorTarget, "a");
        });
    }

    /**
     * Checks the page for configured selectors and sets the browser icon.
     */
    function checkPageAndSetIcon(config) {
        setTimeout(() => {
            const message = { location: torpedo.location };

            if (config.iframe && window.location.href.includes("iframe")) {
                message.name = "ok";
            } else if (!config.iframe && document.body.querySelector(config.selectors.join())) {
                message.name = "ok";
            } else {
                message.name = "error";
            }
            browser.runtime.sendMessage(message);
        }, 2000);
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
        if (torpedo.opened) return;

        if (torpedo.target) {
            torpedo.target.removeEventListener("mouseenter", handleMouseEnter);
            torpedo.target.removeEventListener("mouseleave", handleMouseLeave);
        }

        torpedo.target = e;

        torpedo.target.removeEventListener("mouseenter", handleMouseEnter);
        torpedo.target.removeEventListener("mouseleave", handleMouseLeave);

        torpedo.progUrl = false;
        torpedo.hasTooltip = false;

        const eventTypes = ["click", "contextmenu", "mouseup", "mousedown"];
        preventClickEvent(torpedo.target, eventTypes);

        if (type === "a") {
            const href = torpedo.target.href;

            if (href.includes("mailto:")) return;

            if (href === "") {
                try {
                    torpedo.target.setAttribute("href", e.relatedTarget.href);
                } catch (e) {}
            }
        }

        torpedo.state = "unknown";

        const url = type === "form" ? new URL(torpedo.target.action) : new URL(torpedo.target.href);
        TooltipManager.setNewUrl(url);

        const tooltipURL = hasTooltip(torpedo.target);
        if (tooltipURL !== "<HAS_NO_TOOLTIP>") {
            torpedo.hasTooltip = isTooltipMismatch(tooltipURL, torpedo.url);
        }

        try {
            const storage = await browser.storage.sync.get(null);
            if (storage.referrerSites.includes(torpedo.location)) {
                resolveReferrer(storage);
                torpedo.target.href = torpedo.url;
            }

            torpedo.target.addEventListener("mouseenter", handleMouseEnter);
            torpedo.target.addEventListener("mouseleave", handleMouseLeave);

            await TooltipManager.showTooltip(torpedo.target);

        } catch (err) {
            console.log(torpedo.target.href);
            console.log(err);
            await browser.runtime.sendMessage({name: "error"});
        }
    }

    /**
     * Starts the main function when the DOM is fully loaded.
     */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", main);
    } else {
        await main();
    }
})();
