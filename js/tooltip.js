const TooltipManager = (function() {

    /**
     * CSS classes used in the tooltip.
     * @type {{LOADING: string, ACTIVE: string, USER_DEFINED: string, TRUSTED: string}}
     */
    const CLASSES = {
        LOADING: "is-loading",
        ACTIVE: "active",
        USER_DEFINED: "torpedoUserDefined",
        TRUSTED: "torpedoTrusted"
    };

    /**
     * UI helper methods for safely manipulating tooltip elements.
     * @type {{find: function(*): *, setText: function(*, *): void, setHTML: function(*, *): void, toggle: function(*, *): void, setStyle: function(*, *): void, onClick: function(*, *): void, setImgSrc: function(*, *): void}}
     */
    const UI = {
        /** Safely query an element within the tooltip */
        find: (selector) => torpedo.tooltip?.querySelector(selector),

        /** Set text content safely */
        setText: (selector, text) => {
            const el = UI.find(selector);
            if (el) el.textContent = text;
        },

        /** Set inner HTML safely */
        setHTML: (selector, html) => {
            const el = UI.find(selector);
            if (el) el.innerHTML = html;
        },

        /** Toggle display style */
        toggle: (selector, show) => {
            const el = UI.find(selector);
            if (el) el.style.display = show ? "block" : "none";
        },

        /** Set specific style */
        setStyle: (selector, styleObj) => {
            const el = UI.find(selector);
            if (el) Object.assign(el.style, styleObj);
        },

        /** Add click listener safely */
        onClick: (selector, handler) => {
            UI.find(selector)?.addEventListener("click", handler);
        },

        /** Set Image Source safely */
        setImgSrc: async (selector, path) => {
            const el = UI.find(selector);
            if (el) {
                el.src = await browser.runtime.sendMessage({ name: "getImageData", path: path });
            }
        }
    };

    /**
     * Shows the tooltip by fetching the HTML, applying user settings, binding events, positioning it,
     * and updating its content.
     * @param target - The target element for which the tooltip is to be shown.
     * @returns {Promise<void>} - A promise that resolves when the tooltip has been shown.
     */
    async function showTooltip(target) {
        const tooltipDiv = await fetchHTML("tooltip.html");

        if (!tooltipDiv) {
            throw new Error("Failed to load tooltip HTML.");
        }

        Utils.preventEvents(tooltipDiv.querySelector(".torpedo-URL"), ["click"])

        tooltipDiv.classList.add(CLASSES.LOADING);
        document.body.appendChild(tooltipDiv);

        torpedo.tooltip = tooltipDiv;
        torpedo.state = "open";

        await applyUserSettings();
        bindHoverEvents(tooltipDiv);
        await positionTooltip(target, tooltipDiv);

        initStaticContent();
        initContextMenu();

        await updateTooltip();
    }

    /**
     * Hides the tooltip by removing it from the DOM and clearing any active timers.
     */
    function hideTooltip() {
        if (torpedo.state === "closed") return;

        if (torpedo.hideTimer) clearTimeout(torpedo.hideTimer);
        if (torpedo.timerInterval) clearInterval(torpedo.timerInterval);

        torpedo.tooltip?.remove();
        torpedo.tooltip = null;
        torpedo.state = "closed";
    }

    /**
     * Fetches the tooltip HTML from the background script and returns it as a DOM element.
     * @param fileName - The name of the HTML file to fetch.
     * @returns {Promise<Element|null>} - A promise that resolves to the tooltip DOM element or null if loading fails.
     */
    async function fetchHTML(fileName) {
        const tooltipHTML = await browser.runtime.sendMessage({ name: "loadResource", path: fileName });

        if (!tooltipHTML) {
            console.error("Failed to load tooltip HTML from background script.");
            return null;
        }

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = tooltipHTML;

        return tempDiv.firstElementChild ?? null;
    }

    /**
     * Applies user settings to the tooltip by adding 'active' classes to sections based on stored preferences.
     * @returns {Promise<void>} - A promise that resolves when the settings have been applied.
     */
    async function applyUserSettings() {
        const settings = await browser.storage.sync.get(null);

        const map = {
            section_url_active: "section-url",
            section_security_active: "section-security",
            section_info_active: "section-info",
            section_timer_active: "section-timer"
        };

        for (const [key, id] of Object.entries(map)) {
            if (settings[key] === true) {
                torpedo.tooltip?.querySelector(`#${id}`)?.classList.add(CLASSES.ACTIVE);
            }
        }

        if (settings.minimal_url === true) {
            UI.find(".torpedo-URL")?.classList.add(CLASSES.ACTIVE);
        }
    }

    /**
     * Binds hover events to the tooltip div to manage its visibility. Starts a hide timer on mouse leave
     * and clears the timer on mouse enter.
     * @param tooltipDiv - The tooltip div element to bind events to.
     */
    function bindHoverEvents(tooltipDiv) {
        tooltipDiv.addEventListener("mouseenter", () => {
            if (torpedo.hideTimer) clearTimeout(torpedo.hideTimer);
        });

        tooltipDiv.addEventListener("mouseleave", () => {
            torpedo.hideTimer = setTimeout(() => hideTooltip(), 150);
        });
    }

    /**
     * Positions the tooltip relative to the target element using Floating UI for optimal placement.
     * @param target - The target for which the tooltip is to be positioned.
     * @param tooltipDiv - The tooltip div element to position.
     * @returns {Promise<void>} - A promise that resolves when the tooltip has been positioned.
     */
    async function positionTooltip(target, tooltipDiv) {
        const { computePosition, offset, flip, shift } = globalThis.FloatingUIDOM;

        try {
            computePosition(target, tooltipDiv, {
                placement: "bottom-start",
                middleware: [offset(8), flip(), shift({ padding: 5 })]
            }).then(({ x, y }) => {
                tooltipDiv.style.left = `${x}px`;
                tooltipDiv.style.top = `${y}px`;
            });

        } catch (e) {
            console.error("Torpedo: Positioning error", e);
        }
    }

    /**
     * Initializes static content in the tooltip, including images and event listeners for info text and redirect button.
     */
    function initStaticContent() {
        showLoaderWithOverlay();

        UI.setImgSrc(".torpedo-warning-img", "img/warning2.png");
        UI.setImgSrc(".torpedo-info-img", "img/info.png");
        UI.setImgSrc(".torpedo-lens-img", "img/TORPEDO_Icon.svg");

        UI.onClick(".torpedo-info-text", () => {
            const infoDiv = UI.find(".torpedo-info-div");
            if (infoDiv) {
                const isHidden = getComputedStyle(infoDiv).display === "none";
                infoDiv.style.display = isHidden ? "block" : "none";
            }
        });
        UI.onClick(".torpedo-redirect-button", (event) => resolveRedirect(event));
        UI.onClick(".torpedo-url-button", () => {
            UI.find(".torpedo-URL")?.classList.toggle(CLASSES.ACTIVE);
        });
    }

    /**
     * Initializes the context menu for the tooltip, including event listeners for menu options.
     */
    function initContextMenu() {
        const tooltip = torpedo.tooltip;
        const contextMenu = UI.find(".torpedo-context-menu");

        if (!contextMenu) return;

        tooltip.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            contextMenu.style.display = contextMenu.style.display === "none" ? "block" : "none";
        });

        tooltip.addEventListener("click", (event) => {
            if (contextMenu.style.display === "block" && !event.target.closest(".torpedo-context-menu")) {
                contextMenu.style.display = "none";
            }
        });

        UI.onClick(".torpedo-mark-trusted", async () => {
            const { userDefinedDomains = [] } = await browser.storage.sync.get("userDefinedDomains");

            if (!userDefinedDomains.includes(torpedo.domain)) {
                await browser.storage.sync.set({ userDefinedDomains: [...userDefinedDomains, torpedo.domain] });
            }

            await updateTooltip();
        });
        UI.onClick(".torpedo-google", () => browser.runtime.sendMessage({ name: "google", url: torpedo.domain }));
        UI.onClick(".torpedo-open-settings", () => browser.runtime.sendMessage({ name: "settings" }));
        UI.onClick(".torpedo-open-tutorial", () => browser.runtime.sendMessage({ name: "tutorial" }));
    }

    /**
     * Updates the tooltip content based on the current security status and user settings.
     * @returns {Promise<void>} - A promise that resolves when the tooltip has been updated.
     */
    async function updateTooltip() {
        const storage = await browser.storage.sync.get(null);
        const secStatus = await getSecurityStatus(storage);

        console.log("Security Status:", secStatus);

        updateURLDisplay();
        updateTextContent(secStatus);
        await updateActionButtons(storage);
        updateSecurityVisuals(secStatus, storage);
        handleTimerLogic(storage, secStatus);

        deactivateLoader();
    }

    /**
     * Updates the URL display in the tooltip, shortening the path if it exceeds 100 characters.
     */
    function updateURLDisplay() {
        const torpedoURL = UI.find(".torpedo-URL");
        if (!torpedoURL) return;

        let url = torpedo.url;
        const pathSuffix = torpedo.urlObject.pathname + torpedo.urlObject.search + torpedo.urlObject.hash;

        if (pathSuffix.length > 100) {
            url = url.replace(pathSuffix, pathSuffix.substring(0, 100) + "...");
        }

        torpedoURL.href = torpedo.url;

        const urlSplit = url.split(torpedo.domain);
        UI.setHTML(".torpedo-url-prefix", urlSplit[0]);
        UI.setHTML(".torpedo-url-domain", torpedo.domain);
        UI.setHTML(".torpedo-url-suffix", urlSplit[1] || "");
    }

    /**
     * Updates the text content of various elements in the tooltip based on the security status.
     * @param secStatus - The security status used to determine the text content.
     */
    function updateTextContent(secStatus) {
        const getMsg = (key) => browser.i18n.getMessage(key);

        UI.setHTML(".torpedo-redirect-button", getMsg("ButtonWeiterleitung"));
        UI.setHTML(".torpedo-state-title", getMsg(secStatus + "Ueberschrift"));
        UI.setHTML(".torpedo-security-status", getMsg(secStatus + "Erklaerung"));
        UI.setHTML(".torpedo-info-text", getMsg("MehrInfo"));
        UI.setHTML(".torpedo-more-info", getMsg(secStatus + "Infotext").replace("<URL>", torpedo.url));

        const linkDelayText = getMsg(secStatus + "LinkDeaktivierung")
        UI.setHTML(".torpedo-link-delay", linkDelayText);

        [
            ".torpedo-warning-img",
            ".torpedo-timer",
            ".torpedo-info-div",
            ".torpedo-link-delay",
            ".torpedo-redirect-button"
        ].forEach(sel => UI.toggle(sel, false));

        if (linkDelayText) {
            UI.toggle(".torpedo-link-delay", true);
        } else {
            UI.setStyle(".torpedo-info", { marginBottom: "0", paddingBottom: "0" });
        }
    }

    /**
     * Updates the action buttons in the tooltip based on the current storage settings.
     * @param storage - The storage object containing user settings.
     * @returns {Promise<void>} - A promise that resolves when the action buttons have been updated.
     */
    async function updateActionButtons(storage) {
        const isRedirectDomain = await isRedirect(torpedo.domain);
        const showRedirect = isRedirectDomain && storage.privacyModeActivated;
        UI.toggle(".torpedo-redirect-button", showRedirect);

        UI.setText(".torpedo-google", browser.i18n.getMessage("googleCheck"));
        UI.setText(".torpedo-open-settings", browser.i18n.getMessage("openSettings"));
        UI.setText(".torpedo-open-tutorial", browser.i18n.getMessage("openTutorial"));
    }

    /**
     * Updates the security visuals of the tooltip based on the security status and storage settings.
     * @param secStatus - The security status used to determine the visuals.
     * @param storage - The storage object containing user settings.
     */
    function updateSecurityVisuals(secStatus, storage) {
        const tooltipRoot = document.querySelector(".torpedo-tooltip");
        if (!tooltipRoot) return;

        tooltipRoot.classList.remove(CLASSES.USER_DEFINED, CLASSES.TRUSTED)

        const domain = torpedo.domain;
        const isAlreadyTrusted =
            storage.referrerPart1?.includes(domain) ||
            storage.userDefinedDomains?.includes(domain) ||
            storage.trustedDomains?.includes(domain) ||
            storage.redirectDomains?.includes(domain);

        UI.toggle(".torpedo-mark-trusted", !isAlreadyTrusted);
        UI.setText(".torpedo-mark-trusted", browser.i18n.getMessage("markAsTrusted"));

        switch (secStatus) {
            case "T1":
                tooltipRoot.classList.add(CLASSES.TRUSTED);
                UI.toggle(".torpedo-mark-trusted", false);
                break;

            case "T2":
                tooltipRoot.classList.add(CLASSES.USER_DEFINED);
                break;

            case "T32":
                UI.toggle(".torpedo-mark-trusted", true);
                UI.toggle(".torpedo-warning-img", true);
                break;
        }
    }

    /**
     * Handles the timer logic for link activation based on the security status and storage settings.
     * @param storage - The storage object containing user settings.
     * @param secStatus - The security status used to determine if the timer should be activated.
     */
    function handleTimerLogic(storage, secStatus) {
        const eventTypes = ["click", "contextmenu", "mouseup", "mousedown"];

        if (isTimerActivated(storage, secStatus)) {
            countdown(storage.timer, secStatus, eventTypes);
        } else {
            Utils.reactivateEvents(torpedo.target, eventTypes);
            Utils.reactivateEvents(UI.find(".torpedo-URL"), ["click"]);
        }
    }

    function deactivateLoader() {
        document.querySelector(".torpedo-tooltip").classList.remove(CLASSES.LOADING);

        const overlay = document.querySelector('.loader-bg');
        const loader = document.querySelector('.loader');

        if (overlay) overlay.classList.remove("loader-active");
        if (loader) loader.classList.remove("loader-active");
    }

    function showLoaderWithOverlay() {
        const overlay = document.querySelector('.loader-bg');
        const loader = document.querySelector('.loader');

        if (overlay) overlay.classList.add("loader-active");
        if (loader) loader.classList.add("loader-active");
    }

    return { showTooltip, hideTooltip, updateTooltip, showLoaderWithOverlay };
})();
