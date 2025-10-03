const TooltipManager = (function() {

    /**
     * Displays the tooltip at the specified target element.
     */
    async function showTooltip(target) {
        const tooltipElement = document.createElement("div");

        tooltipElement.className = "torpedo-tooltip is-loading";

        const settings = await browser.storage.sync.get(null);
        if (settings.minimalTooltip === true) {
            tooltipElement.classList.add("minimal-tooltip");
        }

        const tooltipURL = browser.runtime.getURL("tooltip.html");
        const resp = await fetch(tooltipURL);
        tooltipElement.innerHTML = await resp.text();

        document.body.appendChild(tooltipElement);

        torpedo.tooltip = tooltipElement;
        torpedo.opened = true;

        tooltipElement.addEventListener("mouseenter", () => {
            if (torpedo.hideTimer) {
                clearTimeout(torpedo.hideTimer);
            }
        });

        tooltipElement.addEventListener("mouseleave", () => {
            torpedo.hideTimer = setTimeout(() => hideTooltip(), 150);
        });

        const { computePosition, offset, flip, shift } = window.FloatingUIDOM;

        computePosition(target, tooltipElement, {
            placement: "bottom-start",
            middleware: [offset(8), flip(), shift({ padding: 5 })]
        }).then(({ x, y }) => {
            tooltipElement.style.left = `${x}px`;
            tooltipElement.style.top = `${y}px`;
        });

        preventClickEvent(torpedo.tooltip.querySelector(".torpedo-URL"), ["click"]);
        initTooltip();
        await updateTooltip();
    }

    /**
     * Hides the tooltip and cleans up any associated timers or intervals.
     */
    function hideTooltip() {
        if (!torpedo.opened) return;

        if (torpedo.hideTimer) {
            clearTimeout(torpedo.hideTimer);
        }
        clearInterval(torpedo.timerInterval);

        torpedo.tooltip.remove();
        torpedo.tooltip = null;
        torpedo.opened = false;
    }

    /**
     * Initializes the tooltip with event listeners and sets up the context menu.
     */
    function initTooltip() {
        const tooltip = torpedo.tooltip;

        onlyShowLoader();

        torpedo.countRedirect = 0;
        torpedo.oldDomain = torpedo.domain;
        torpedo.oldUrl = torpedo.url;

        const contextMenu = tooltip.querySelector(".torpedo-context-menu");

        tooltip.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            contextMenu.style.display = contextMenu.style.display === "none" ? "block" : "none";
        });

        tooltip.addEventListener("click", (event) => {
            if (contextMenu.style.display === "block" && !event.target.closest(".torpedo-context-menu")) {
                contextMenu.style.display = "none";
            }
        });

        onClick(".torpedo-mark-trusted", async () => {
            const { userDefinedDomains = [] } = await browser.storage.sync.get("userDefinedDomains");
            await browser.storage.sync.set({ userDefinedDomains: [...userDefinedDomains, torpedo.domain] });
            await updateTooltip();
        })

        onClick(".torpedo-google", () => browser.runtime.sendMessage({ name: "google", url: torpedo.domain }));

        onClick(".torpedo-open-settings", () => browser.runtime.sendMessage({ name: "settings" }));

        onClick(".torpedo-open-tutorial", () => browser.runtime.sendMessage({ name: "tutorial" }));

        onClick(".torpedo-info-text", () => {
            const infoDiv = tooltip.querySelector(".torpedo-info-div");
            if (infoDiv) {
                infoDiv.style.display = getComputedStyle(infoDiv).display === "none" ? "block" : "none";
            }
        });

        onClick(".torpedo-redirect-button", (event) => resolveRedirect(event));

        const warningImg = tooltip.querySelector(".torpedo-warning-img");
        if (warningImg) warningImg.src = browser.runtime.getURL("img/warning2.png")

        const infoImg = tooltip.querySelector(".torpedo-info-img");
        if (infoImg) infoImg.src = browser.runtime.getURL("img/info.png")

        const lensImg = tooltip.querySelector(".torpedo-lens-img");
        if (lensImg) lensImg.src = browser.runtime.getURL("img/TORPEDO_Icon.svg")
    }

    /**
     * Adds a click event listener to the element with the specified ID in the tooltip.
     */
    function onClick(id, handler) {
        torpedo.tooltip.querySelector(id)?.addEventListener("click", handler);
    }

    /*
     * Sets the inner HTML of the element with the specified selector to the provided HTML string.
     */
    function setHTML(selector, hmtl) {
        const el = torpedo.tooltip.querySelector(selector);
        if (el) el.innerHTML = hmtl;
    }

    /*
     * Hides the element with the specified selector in the tooltip.
     */
    function hide(selector) {
        const el = torpedo.tooltip.querySelector(selector);
        if (el) el.style.display = "none";
    }

    /*
     * Shows the element with the specified selector in the tooltip.
     */
    function show(selector) {
        const el = torpedo.tooltip.querySelector(selector);
        if (el) el.style.display = "block";
    }

    /*
     * Sets the style of the element with the specified selector in the tooltip.
     */
    function setStyle(selector, styleObj) {
        const el = torpedo.tooltip.querySelector(selector);
        if (el) Object.assign(el.style, styleObj);
    }

    /**
     * Updates the tooltip with the current security status and URL information.
     */
    async function updateTooltip() {
        const storage = await browser.storage.sync.get(null);
        const secStatus = await getSecurityStatus(storage);

        const t = torpedo.tooltip;

        let url = torpedo.urlObject.href;
        const pathSuffix = torpedo.urlObject.pathname + torpedo.urlObject.search + torpedo.urlObject.hash;

        if (pathSuffix.length > 100) {
            const shortenedPathname = pathSuffix.substring(0, 100) + "...";
            url = url.replace(pathSuffix, shortenedPathname);
        }

        const torpedoURL = t.querySelector(".torpedo-URL");
        if (torpedoURL) {
            torpedoURL.href = torpedo.url;

            const urlSplit = url.split(torpedo.domain);
            t.querySelector(".torpedo-url-prefix").innerHTML = urlSplit[0];
            t.querySelector(".torpedo-url-suffix").innerHTML = urlSplit[1] || "";
            t.querySelector(".torpedo-url-domain").innerHTML = torpedo.domain;
        }

        assignText(secStatus, url);

        const domain = torpedo.domain;
        const shouldHideTrusted = storage.referrerPart1?.includes(domain) ||
            storage.userDefinedDomains?.includes(domain) ||
            storage.trustedDomains?.includes(domain) ||
            storage.redirectDomains?.includes(domain);

        const markTrustedEl = t.querySelector(".torpedo-mark-trusted");
        if (markTrustedEl) {
            markTrustedEl.style.display = shouldHideTrusted ? "none" : "block";
            markTrustedEl.textContent = browser.i18n.getMessage("markAsTrusted");
        }

        const redirectBtn = t.querySelector(".torpedo-redirect-button");
        if (redirectBtn) {
            if (await isRedirect(domain) && storage.privacyModeActivated) {
                redirectBtn.style.display = "block";
            } else {
                redirectBtn.style.display = "none";
            }
        }

        const googleBtn = t.querySelector(".torpedo-google");
        if (googleBtn) {
            googleBtn.textContent = browser.i18n.getMessage("googleCheck");
        }

        const settingsBtn = t.querySelector(".torpedo-open-settings");
        if (settingsBtn) {
            settingsBtn.textContent = browser.i18n.getMessage("openSettings");
        }

        const tutorialBtn = t.querySelector(".torpedo-open-tutorial");
        if (tutorialBtn) {
            tutorialBtn.textContent = browser.i18n.getMessage("openTutorial");
        }

        const tooltipRoot = document.querySelector(".torpedo-tooltip");
        tooltipRoot.classList.remove("torpedoUserDefined");
        tooltipRoot.classList.remove("torpedoTrusted");

        switch (secStatus) {
            case "T2":
                tooltipRoot.classList.add("torpedoUserDefined");
                break;
            case "T1":
                tooltipRoot.classList.add("torpedoTrusted");
                if (markTrustedEl) markTrustedEl.style.display = "block";
                break;
            case "T32":
                if (markTrustedEl) markTrustedEl.style.display = "block";
                const warningImg = t.querySelector(".torpedo-warning-img");
                if (warningImg) warningImg.style.display = "block";
                break;
            default:
                break;
        }

        const eventTypes = ["click", "contextmenu", "mouseup", "mousedown"];

        if (isTimerActivated(storage, secStatus)) {
            countdown(storage.timer, secStatus, eventTypes);
        } else {
            reactivateLink(torpedo.target, eventTypes);
        }

        deactivateLoader();
    }

    function assignText(state, url) {
        // get texts from textfile
        const button = browser.i18n.getMessage("ButtonWeiterleitung");
        const ueberschrift = browser.i18n.getMessage(state + "Ueberschrift");
        const erklaerung = browser.i18n.getMessage(state + "Erklaerung");
        const mehrInfo = browser.i18n.getMessage("MehrInfo");
        const infotext = browser.i18n.getMessage(state + "Infotext").replace("<URL>", url);
        const linkDeaktivierung = browser.i18n.getMessage(state + "LinkDeaktivierung");

        setHTML(".torpedo-redirect-button", button);
        setHTML(".torpedo-state-title", ueberschrift);
        setHTML(".torpedo-security-status", erklaerung);
        setHTML(".torpedo-info-text", mehrInfo);
        setHTML(".torpedo-more-info", infotext);
        setHTML(".torpedo-link-delay", linkDeaktivierung);

        const elementsToHide = [
            ".torpedo-warning-img",
            ".torpedo-timer",
            ".torpedo-info-div",
            ".torpedo-link-delay",
            ".torpedo-redirect-button"
        ];
        elementsToHide.forEach(hide);

        if (linkDeaktivierung) {
            show(".torpedo-link-delay");
        } else {
            setStyle(".torpedo-info", {
                marginBottom: "0",
                paddingBottom: "0"
            });
        }
    }

    async function processClick() {
        const storage = await browser.storage.sync.get(["userDefinedDomains", "trustedDomains", "onceClickedDomains"]);
        if (storage.userDefinedDomains.includes(torpedo.domain) || storage.trustedDomains.includes(torpedo.domain)) return;

        let { onceClickedDomains = [] } = storage;
        if (onceClickedDomains.includes(torpedo.domain)) {
            await browser.storage.sync.set({
                onceClickedDomains: onceClickedDomains.filter(d => d !== torpedo.domain),
                userDefinedDomains: [...(storage.userDefinedDomains || []), torpedo.domain]
            })
        } else {
            await browser.storage.sync.set({ onceClickedDomains: [...onceClickedDomains, torpedo.domain] });
        }
    }

    /*
     * Starts the loader animation.
     */
    function onlyShowLoader() {
        const loaderBg = document.querySelector('.torpedo-tooltip > .loader-bg');
        if (loaderBg) loaderBg.classList.add("transparent-bg");
    }

    /*
     * Stops the loader animation.
     */
    function deactivateLoader() {
        document.querySelector(".torpedo-tooltip").classList.remove("is-loading");

        const loaderBg = document.querySelector(".torpedo-tooltip > .loader-bg");
        if (loaderBg) loaderBg.classList.remove("transparent-bg");
    }

    function showLoaderWithOverlay() {
        const overlay = document.querySelector('.loader-bg');
        if (overlay) overlay.classList.add("loader-active");
    }

    /*
     * Sets the incoming URL as the new torpedo URL.
     */
    function setNewUrl(uri) {
        let normalizedUri = uri;

        if (normalizedUri.hostname.endsWith(".")) {
            const newHref = normalizedUri.href.replace(normalizedUri.hostname, normalizedUri.hostname.slice(0, -1));
            normalizedUri = new URL(newHref);
        }

        torpedo.url = normalizedUri.href;
        torpedo.domain = extractDomain(normalizedUri.hostname);
    }

    /*
     * Extracts the domain from a URL, using the public suffix list if available. If the URL is an IP address
     * or if the public suffix list does not return a valid domain, it returns the original URL.
     */
    function extractDomain(url) {
        if (isIP(url)) {
            return url;
        }

        const psl = torpedo.publicSuffixList.getDomain(url);
        return psl || url;
    }

    return { showTooltip, hideTooltip, updateTooltip, setNewUrl, extractDomain, showLoaderWithOverlay, processClick };
})();
