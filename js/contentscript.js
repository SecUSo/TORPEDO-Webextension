(function () {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", main);
    } else {
        main();
    }

    /*
     * Main function of this webextension.
     */
    async function main() {
        const siteConfig = {
            "mail.yahoo.com": {selectors: ['div[data-test-id="message-view"]']},
            "mail.google.com": {selectors: [".adn"]},
            "owa.kit.edu": {selectors: ['div[role="list"]', " div.isMessageBodyInPopout"]},
            "outlook.live.com": {selectors: ['div[role="main"]']},
            "mail.aol.com": {selectors: ["#displayMessage"]},
            "email.t-online.de": {iframe: ["mailreadview"]},
            default: {iframe: ["mailbody"]}
        };

        torpedo.location = window.location.host;
        const config = siteConfig[torpedo.location] || siteConfig.default;

        /*
         * Load the public suffix list (TLD) from the service_worker (background) script.
         */
        /*try {
            const tldData = await browser.runtime.sendMessage({ name: "TLD" });
            if (tldData) {
                torpedo.publicSuffixList.parse(tldData, punycode.toASCII);
            }
        } catch (e) {
            console.error("Failed to fetch TLD data:", e);
        }*/

        chrome.runtime.sendMessage({ name: "TLD" }, function (r) {
            torpedo.publicSuffixList.parse(r, punycode.toASCII);
        });

        // ToDo: unbind all previous event listeners like '$("body").unbind()';

        /*
         * Regular page handling.
         */
        if (!config.iframe) {

            /*
             * Add event listener to open tooltip if user hovers over an <a> tag.
             */
            const anchorSelectors = config.selectors.map((selector) => selector + " a").join();
            document.body.addEventListener("mouseover", (event) => {
                const targetLink = event.target.closest(anchorSelectors);

                if (targetLink) {
                    openTooltip(targetLink, "a");
                }
            });

            /*
             * Add event listener to open tooltip if user hover over a <form> tag.
             */
            const formSelectors = config.selectors.map((selector) => selector + " form").join();
            document.body.addEventListener("mouseover", (event) => {
                const targetForm = event.target.closest(formSelectors);

                if (targetForm) {
                    openTooltip(targetForm, "form");
                    torpedo.progUrl = true;
                }
            });

            // ToDo: add send Message logic to show / hide icon
        }

        /*
         * Iframe handling.
         */
        else {
            document.body.addEventListener("mouseover", (event) => {
                const anchorTarget = event.target.closest("a");

                if (anchorTarget) {
                    const location = event.view.location.href;

                    if (location.includes("iframe")) {
                        openTooltip(anchorTarget, "a");
                    }
                }
            });

            // ToDo: add send Message logic to show / hide icon
        }
    }

    function openTooltip(e, type) {
        console.log("open tool tip")

        torpedo.target = e;
        torpedo.progUrl = false;
        torpedo.hasTooltip = false;

        const eventTypes = ["click", "contextmenu", "mouseup", "mousedown"];
        preventClickEvent(torpedo.target, eventTypes);

        if (type === "a") {
            const href = torpedo.target.href;

            if (torpedo.opened || href.includes("mailto:")) return;

            // ToDo: handle if href === ""
        }

        torpedo.state = "unknown";

        try {
            const url = type === "form" ? new URL(torpedo.target.action) : new URL(torpedo.target.href);
            setNewUrl(url);

        } catch (err) {
            console.log(torpedo.target.href);
            console.log(err);
            browser.runtime.sendMessage({ name: "error" });
        }

        const tooltipURL = hasTooltip(torpedo.target);
    }
})();
