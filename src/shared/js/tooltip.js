/**
 * The core manager responsible for generating, positioning and updating the tooltip.
 */
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

    let cachedTooltipTemplate = null;

    /**
     * Shows the tooltip by fetching the HTML, applying user settings, binding events, positioning it,
     * and updating its content.
     * @param target - The target element for which the tooltip is to be shown.
     * @returns {Promise<void>} - A promise that resolves when the tooltip has been shown.
     */
    async function showTooltip(target) {
        if (target !== Torpedo.target) return;

        debugLog("Initializing Tooltip UI for:", target.href);

        const urlObj = new URL(target.href);
        const dict = {
            urlObj: urlObj,
            domain: Torpedo.extractDomain(urlObj.hostname),
            tooltip: null,
            timerInterval: null,
            hideTimer: null,
            secStatus: null
        }
        Torpedo.targetTooltipMap.set(target, dict);

        const settings = await browser.storage.sync.get(null);
        if (target !== Torpedo.target) return;

        try {
            dict.tooltip = await firstInitialization(target, dict, settings);
        } catch (error) {
            debugLog("Error during the first initialization:", error);
            return;
        }

        if (target !== Torpedo.target) return;

        document.body.appendChild(dict.tooltip);
        await positionTooltip(target, dict.tooltip);

        if (target !== Torpedo.target) {
            hideTooltip(target);
            return;
        }

        await updateTooltip(target, dict);
    }

    /**
     *
     * @param target
     * @param dict
     * @param settings
     * @returns {Promise<Element>}
     */
    async function firstInitialization(target, dict, settings) {
        let tooltipDiv;

        if (cachedTooltipTemplate) {
            tooltipDiv = cachedTooltipTemplate.cloneNode(true);
        } else {
            tooltipDiv = await fetchHTML("tooltip.html");
            if (!tooltipDiv) throw new Error("Failed to load tooltip HTML.");

            await setStaticTextAndImages(tooltipDiv);

            cachedTooltipTemplate = tooltipDiv.cloneNode(true);
        }

        preventEvents(tooltipDiv.querySelector(".torpedo-URL"), ["click"]);
        tooltipDiv.classList.add(CLASSES.LOADING);

        applySectionSettings(tooltipDiv, settings);
        bindHoverEvents(target, tooltipDiv);
        await addButtonListeners(target, dict, tooltipDiv);
        initContextMenu(target, dict, tooltipDiv);

        return tooltipDiv;
    }

    /**
     * Hides the tooltip by removing it from the DOM and clearing any active timers.
     */
    function hideTooltip(target) {
        if (target === Torpedo.target) Torpedo.target = null;

        target.removeEventListener("mouseenter", handleMouseEnter);
        target.removeEventListener("mouseleave", handleMouseLeave);
        reactivateEvents(target, ["click", "contextmenu", "mouseup", "mousedown"]);

        const dict = Torpedo.targetTooltipMap.get(target);
        if (dict) {
            if (dict.hideTimer) clearTimeout(dict.hideTimer);
            if (dict.timerInterval) clearInterval(dict.timerInterval);
            dict.tooltip?.remove();
            Torpedo.targetTooltipMap.delete(target);
        }

        debugLog("Tooltip UI closed for:", target.href);
    }

    /**
     * Fetches the tooltip HTML from the background script and returns it as a DOM element.
     * @returns {Promise<Element|null>} - A promise that resolves to the tooltip DOM element or null if loading fails.
     */
    async function fetchHTML(filePath) {
        const tooltipHTML = await browser.runtime.sendMessage({ name: "loadResource", path: filePath });
        if (!tooltipHTML) return null;

        const parser = new DOMParser();
        const doc = parser.parseFromString(tooltipHTML, "text/html");

        const firstEl = doc.body.firstElementChild;
        if (!firstEl) return null;

        return document.importNode(firstEl, true);
    }

    /**
     *
     * @param tooltipDiv
     * @returns {Promise<void>}
     */
    async function setStaticTextAndImages(tooltipDiv) {
        tooltipDiv.querySelector(".torpedo-info-text").textContent = browser.i18n.getMessage("MehrInfo");
        tooltipDiv.querySelector(".torpedo-redirect-button").textContent = browser.i18n.getMessage("ButtonWeiterleitung");
        tooltipDiv.querySelector(".torpedo-google").textContent = browser.i18n.getMessage("googleCheck");
        tooltipDiv.querySelector(".torpedo-open-settings").textContent = browser.i18n.getMessage("openSettings");
        tooltipDiv.querySelector(".torpedo-open-tutorial").textContent = browser.i18n.getMessage("openTutorial");
        tooltipDiv.querySelector(".torpedo-mark-trusted").textContent = browser.i18n.getMessage("markAsTrusted");

        const classImageMap = {
            ".torpedo-warning-img": "img/warning2.png",
            ".torpedo-info-img": "img/info.png",
            ".torpedo-lens-img": "img/TORPEDO_Icon.svg"
        };

        for (const [elClass, imagePath] of Object.entries(classImageMap)) {
            tooltipDiv.querySelector(elClass).src = await browser.runtime.sendMessage({ name: "getImageData", path: imagePath });
        }
    }

    /**
     *
     * @param tooltipDiv
     * @param settings
     */
    function applySectionSettings(tooltipDiv, settings) {
        const map = {
            section_url_active: "section-url",
            section_security_active: "section-security",
            section_info_active: "section-info",
            section_timer_active: "section-timer"
        };

        for (const [key, id] of Object.entries(map)) {
            if (settings[key] === true) {
                tooltipDiv.querySelector(`#${id}`)?.classList.add(CLASSES.ACTIVE);
            }
        }

        if (settings.minimal_url === true) {
            tooltipDiv.querySelector(".torpedo-URL").classList.add(CLASSES.ACTIVE);
        }
    }

    /**
     * Binds hover events to the tooltip div to manage its visibility. Starts a hide timer on mouse leave
     * and clears the timer on mouse enter.
     * @param target
     * @param tooltipDiv - The tooltip div element to bind events to.
     */
    function bindHoverEvents(target, tooltipDiv) {
        tooltipDiv.addEventListener("mouseenter", () => {
            const dict = Torpedo.targetTooltipMap.get(target);
            if (dict && dict.hideTimer) clearTimeout(dict.hideTimer);
        });

        tooltipDiv.addEventListener("mouseleave", () => {
            const dict = Torpedo.targetTooltipMap.get(target);
            if (dict) dict.hideTimer = setTimeout(() => hideTooltip(target), 150);
        });
    }

    /**
     * Positions the tooltip relative to the target element using Floating UI for optimal placement.
     * @param target - The target for which the tooltip is to be positioned.
     * @param tooltipDiv - The tooltip div element to position.
     * @returns {Promise<void>} - A promise that resolves when the tooltip has been positioned.
     */
    async function positionTooltip(target, tooltipDiv) {
        const { computePosition, flip, shift } = globalThis.FloatingUIDOM;

        try {
            computePosition(target, tooltipDiv, {
                placement: "bottom-start",
                middleware: [flip(), shift({ padding: 5 })]
            }).then(({ x, y }) => {
                tooltipDiv.style.left = `${x}px`;
                tooltipDiv.style.top = `${y}px`;
            });

        } catch (e) {
            debugLog("Positioning error:", e);
        }
    }

    /**
     *
     * @param target
     * @param dict
     * @param tooltipDiv
     * @returns {Promise<void>}
     */
    async function addButtonListeners(target, dict, tooltipDiv) {
        tooltipDiv.querySelector(".torpedo-info-text").addEventListener("click", () => {
            const infoDiv = tooltipDiv.querySelector(".torpedo-info-div");
            const isHidden = getComputedStyle(infoDiv).display === "none";
            infoDiv.style.display = isHidden ? "block" : "none";
        });

        tooltipDiv.querySelector(".torpedo-url-button").addEventListener("click", async () => {
            tooltipDiv.querySelector(".torpedo-URL").classList.toggle(CLASSES.ACTIVE);
            updateTextContent(tooltipDiv, dict.secStatus, dict.urlObj.href);
        });

        tooltipDiv.querySelector(".torpedo-redirect-button").addEventListener("click", async () => {
            showLoaderWithOverlay(tooltipDiv);
            const redirectResult = await browser.runtime.sendMessage({ name: "redirect", url: dict.urlObj.href });
            if (redirectResult) {
                dict.urlObj = new URL(redirectResult);
                dict.domain = Torpedo.extractDomain(dict.urlObj.hostname);
            }
            await updateTooltip(target, dict);
        });
    }

    /**
     * Initializes the context menu for the tooltip, including event listeners for menu options.
     */
    function initContextMenu(target, dict, tooltipDiv) {
        const contextMenu = tooltipDiv.querySelector(".torpedo-context-menu");

        tooltipDiv.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            contextMenu.style.display = contextMenu.style.display === "none" ? "block" : "none";
        });

        tooltipDiv.addEventListener("click", (event) => {
            if (contextMenu.style.display === "block" && !event.target.closest(".torpedo-context-menu")) {
                contextMenu.style.display = "none";
            }
        });

        tooltipDiv.querySelector(".torpedo-mark-trusted").addEventListener("click", async () => {
            const { userDefinedDomains = [] } = await browser.storage.sync.get("userDefinedDomains");

            if (!userDefinedDomains.includes(dict.domain)) {
                await browser.storage.sync.set({ userDefinedDomains: [...userDefinedDomains, dict.domain] });
            }

            await updateTooltip(target, dict);
        });

        tooltipDiv.querySelector(".torpedo-google").addEventListener("click", async () => {
            const dict = Torpedo.targetTooltipMap.get(target);
            await browser.runtime.sendMessage({ name: "google", url: dict.urlObj.hostname });
        });

        tooltipDiv.querySelector(".torpedo-open-settings").addEventListener("click", async () => {
            await browser.runtime.sendMessage({ name: "settings" });
        });

        tooltipDiv.querySelector(".torpedo-open-tutorial").addEventListener("click", async () => {
            await browser.runtime.sendMessage({ name: "tutorial" })
        });
    }

    /**
     * Updates the tooltip content based on the current security status and user settings.
     * @returns {Promise<void>} - A promise that resolves when the tooltip has been updated.
     */
    async function updateTooltip(target, dict) {
        const storage = await browser.storage.sync.get(null);
        if (target !== Torpedo.target) {
            hideTooltip(target);
            return;
        }

        const secStatus = await getSecurityStatus(target, dict, storage);
        if (target !== Torpedo.target) {
            hideTooltip(target);
            return;
        }

        dict.secStatus = secStatus.status;

        updateURLDisplay(dict.tooltip, dict.urlObj, dict.domain);
        updateTextContent(dict.tooltip, secStatus.status, dict.urlObj.href);

        await updateActionButtons(dict.tooltip, dict.domain, storage);

        if (target !== Torpedo.target) {
            hideTooltip(target);
            return;
        }

        updateSecurityVisuals(dict.tooltip, dict.domain, secStatus.status, storage);
        handleTimerLogic(target, dict, storage, secStatus.status);

        deactivateLoader(dict.tooltip);
    }

    /**
     * Updates the URL display in the tooltip, shortening the path if it exceeds 100 characters.
     */
    function updateURLDisplay(tooltipDiv, urlObj, domain) {
        const torpedoURL = tooltipDiv.querySelector(".torpedo-URL");
        torpedoURL.href = urlObj.href;

        let url = urlObj.href;
        const pathSuffix = urlObj.pathname + urlObj.search + urlObj.hash;

        if (pathSuffix.length > 100) {
            url = url.replace(pathSuffix, pathSuffix.substring(0, 100) + "...");
        }

        const urlSplit = url.split(domain);
        tooltipDiv.querySelector(".torpedo-url-prefix").textContent = urlSplit[0];
        tooltipDiv.querySelector(".torpedo-url-domain").textContent = domain;
        tooltipDiv.querySelector(".torpedo-url-suffix").textContent = urlSplit[1] || "";
    }

    /**
     * Updates the text content of various elements in the tooltip based on the security status.
     * @param tooltipDiv
     * @param secStatus - The security status used to determine the text content.
     * @param torpedoURL
     */
    function updateTextContent(tooltipDiv, secStatus, torpedoURL) {
        const getMsg = (key) => browser.i18n.getMessage(key);

        const isActive = tooltipDiv.querySelector(".torpedo-URL").classList.contains(CLASSES.ACTIVE);
        const titleId = isActive ? "shortUeberschrift" : "longUeberschrift";
        const statusId = isActive ? `short${secStatus}Erklaerung` : `long${secStatus}Erklaerung`;

        tooltipDiv.querySelector(".torpedo-state-title").textContent = getMsg(titleId);

        const el = tooltipDiv.querySelector(".torpedo-security-status");
        while (el.firstChild) el.removeChild(el.firstChild);
        el.appendChild(parseLimitedMarkup(getMsg(statusId)));

        tooltipDiv.querySelector(".torpedo-info-div").style.display = "none";
        const infoEl = tooltipDiv.querySelector(".torpedo-more-info");
        while (infoEl.firstChild) infoEl.removeChild(infoEl.firstChild);
        const msg = getMsg(secStatus + "Infotext").replace("<URL>", torpedoURL);
        infoEl.appendChild(parseLimitedMarkup(msg));

        const linkDelayText = getMsg(secStatus + "LinkDeaktivierung")
        const delayEl = tooltipDiv.querySelector(".torpedo-link-delay");
        delayEl.textContent = linkDelayText;

        if (linkDelayText) {
            delayEl.style.display = "block";
        } else {
            Object.assign(delayEl.style, { marginBottom: "0", paddingBottom: "0" });
        }
    }

    /**
     * Updates the action buttons in the tooltip based on the current storage settings.
     * @param tooltipDiv
     * @param domain
     * @param storage - The storage object containing user settings.
     * @returns {Promise<void>} - A promise that resolves when the action buttons have been updated.
     */
    async function updateActionButtons(tooltipDiv, domain, storage) {
        const isRedirectDomain = await isRedirect(domain);
        const showRedirect = isRedirectDomain && storage.privacyModeActivated;

        tooltipDiv.querySelector(".torpedo-redirect-button").style.display = showRedirect ? "block" : "none";
    }

    /**
     * Updates the security visuals of the tooltip based on the security status and storage settings.
     * @param tooltipDiv
     * @param domain
     * @param secStatus - The security status used to determine the visuals.
     * @param storage - The storage object containing user settings.
     */
    function updateSecurityVisuals(tooltipDiv, domain, secStatus, storage) {
        tooltipDiv.classList.remove(CLASSES.USER_DEFINED, CLASSES.TRUSTED)

        const isAlreadyTrusted =
            storage.referrerPart1?.includes(domain) ||
            storage.userDefinedDomains?.includes(domain) ||
            storage.trustedDomains?.includes(domain) ||
            storage.redirectDomains?.includes(domain);

        let markTrustedDisplay = !isAlreadyTrusted ? "block" : "none";
        let warningImgDisplay = "none";

        switch (secStatus) {
            case "T1":
                tooltipDiv.classList.add(CLASSES.TRUSTED);
                markTrustedDisplay = "none";
                break;

            case "T2":
                tooltipDiv.classList.add(CLASSES.USER_DEFINED);
                break;

            case "T32":
                tooltipDiv.querySelector(".torpedo-mark-trusted").style.display = "block";
                markTrustedDisplay = "block";
                warningImgDisplay = "block";
                break;
        }

        tooltipDiv.querySelector(".torpedo-mark-trusted").style.display = markTrustedDisplay;
        tooltipDiv.querySelector(".torpedo-warning-img").style.display = warningImgDisplay;
    }

    function deactivateLoader(tooltipDiv) {
        tooltipDiv.classList.remove(CLASSES.LOADING);

        const overlay = tooltipDiv.querySelector('.loader-bg');
        const loader = tooltipDiv.querySelector('.loader');

        if (overlay) overlay.classList.remove("loader-active");
        if (loader) loader.classList.remove("loader-active");
    }

    function showLoaderWithOverlay(tooltipDiv) {
        const overlay = tooltipDiv.querySelector('.loader-bg');
        const loader = tooltipDiv.querySelector('.loader');

        if (overlay) overlay.classList.add("loader-active");
        if (loader) loader.classList.add("loader-active");
    }

    return { showTooltip, hideTooltip };
})();