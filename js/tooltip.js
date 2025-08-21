const TooltipManager = (function() {
    /**
     * Creates the tooltip HTML structure with the necessary elements and images.
     */
    function tooltipText() {
        return "<div id='torpedoWarning' class='loader-active'> \
                        <img id='torpedoWarningImage' src='" +
            chrome.runtime.getURL("img/warning.png") +
            "'> \
                                <img id='torpedoWarningImage2' src='" +
            chrome.runtime.getURL("img/warning2.png") +
            "'> \
                        <p id='torpedoWarningText'></p>\
                      </div>\
                      <div class='loader-active'><a href='" +
            torpedo.url +
            "' id='torpedoURL''></a></div> \
                      <div style='display:none' class='loader-active' id='torpedoContextMenu'>\
                          <ul>\
                              <li id='torpedoMarkTrusted'></li>\
                              <li id='torpedoGoogle'></li>\
                              <li id='torpedoOpenSettings'></li>\
                              <li id='torpedoOpenTutorial'></li>\
                          </ul>\
                      </div>\
                      <div class='loader-active'><p id='torpedoSecurityStatus'></p></div> \
                      <div class='loader-active' id='torpedoAdvice'> \
                        <img id='torpedoAdviceImage' src='" +
            chrome.runtime.getURL("img/advice.png") +
            "'> \
                        <p id='torpedoAdviceText'></p> \
                      </div> \
                            <div class='loader-active' id='torpedoAdviceDiv'><p id='torpedoMoreAdvice'></p></div> \
                      <div class='loader-active' id='torpedoInfo'>  \
                        <img id='torpedoInfoImage' src='" +
            chrome.runtime.getURL("img/info.png") +
            `'> \
                <p id='torpedoInfoText'></p> \
              </div>\
              <div class='loader-active' id='torpedoInfoDiv'><p id='torpedoMoreInfo'></p></div> \
              <div class='loader-active'><button id='torpedoMoreInfoButton' type='button'></button></div> \
              <div class='loader-active'><button id='torpedoRedirectButton' type='button''></button></div> \
              <div class='loader-active'><button id='torpedoActivateLinkButton' type='button''></button></div>
              <div class='loader-active'><p id='torpedoLinkDelay'></p></div>
              <p class='loader-active' id='torpedoTimer'></p>
              ` +
            `<div class="loader-bg"> \
    <div class="loader-card"> \
    <div class="loader loader-active"> \
          <div class="dots"> \
            <div class="dot dot-0"></div> \
            <div class="dot dot-1"></div> \
            <div class="dot dot-2"></div> \
            <div class="dot dot-3"></div> \
            <div class="dot dot-4"></div> \
            <div class="dot dot-5"></div> \
            <div class="dot dot-6"></div> \
            <div class="dot dot-7"></div> \
            <div class="dot dot-8"></div> \
            <div class="dot dot-9"></div> \
          </div> \
          <div class="lens"> \
            <img src="${chrome.runtime.getURL(
                "./img/TORPEDO_Icon.svg"
            )}" alt="loading..." /> \
          </div> \
          <div class="load-text"> \
            <p>Loading...</p> \
          </div> \
        </div> \
      </div> \
    </div> \
              `;
    }

    /**
     * Displays the tooltip at the specified target element.
     */
    function showTooltip(target) {
        const tooltipElement = document.createElement("div");
        tooltipElement.className = "torpedoTooltip";
        tooltipElement.innerHTML = tooltipText();
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

        initTooltip();
        updateTooltip().then();
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
        torpedo.countShortURL = 0;
        torpedo.oldDomain = torpedo.domain;
        torpedo.oldUrl = torpedo.url;

        const contextMenu = tooltip.querySelector("#torpedoContextMenu");

        tooltip.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            contextMenu.style.display = contextMenu.style.display === "none" ? "block" : "none";
        });

        tooltip.addEventListener("click", (event) => {
            if (contextMenu.style.display === "block" && !event.target.closest("#torpedoContextMenu")) {
                contextMenu.style.display = "none";
            }
        });

        onClick("#torpedoMarkTrusted", async () => {
            const { userDefinedDomains = [] } = await browser.storage.sync.get("userDefinedDomains");
            await browser.storage.sync.set({ userDefinedDomains: [...userDefinedDomains, torpedo.domain] });
            updateTooltip();
        })

        onClick("#torpedoGoogle", () => browser.runtime.sendMessage({ name: "google", url: torpedo.domain }));

        onClick("#torpedoOpenSettings", () => browser.runtime.sendMessage({ name: "settings" }));

        onClick("#torpedoOpenTutorial", () => browser.runtime.sendMessage({ name: "tutorial" }));

        onClick("#torpedoInfoText", () => {
            const infoDiv = tooltip.querySelector("#torpedoInfoDiv");
            if (infoDiv) {
                infoDiv.style.display = getComputedStyle(infoDiv).display === "none" ? "block" : "none";
            }
        });

        onClick("#torpedoAdviceText", () => {
            const adviceDiv = tooltip.querySelector("#torpedoAdviceDiv");
            if (adviceDiv) {
                adviceDiv.style.display = getComputedStyle(adviceDiv).display === "none" ? "block" : "none";
            }
        });

        onClick("#torpedoMoreInfoButton", (event) => {openInfoImage(event)}); // ToDo

        onClick("#torpedoRedirectButton", (event) => resolveRedirect(event));

        tooltip.querySelector("#torpedoActivateLinkButton").disabled = true;
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
        let url = torpedo.url;
        const pathname = torpedo.pathname;

        if (pathname.length > 100) {
            const shortenedPathname = pathname.substring(0, 100) + "...";
            url = url.replace(pathname, shortenedPathname);
        }

        const torpedoURL = t.querySelector("#torpedoURL");
        if (torpedoURL) {
            torpedoURL.innerHTML = url.replace(torpedo.domain,
                '<span id="torpedoDomain">' + torpedo.domain + "</span>");
        }

        assignText(secStatus, url);

        const domain = torpedo.domain;
        const shouldHideTrusted = storage.referrerPart1?.includes(domain) ||
            storage.userDefinedDomains?.includes(domain) ||
            storage.trustedDomains?.includes(domain) ||
            storage.redirectDomains?.includes(domain);

        const markTrustedEl = t.querySelector("#torpedoMarkTrusted");
        if (markTrustedEl) {
            markTrustedEl.style.display = shouldHideTrusted ? "none" : "block";
            markTrustedEl.textContent = browser.i18n.getMessage("markAsTrusted");
        }

        const redirectBtn = t.querySelector("#torpedoRedirectButton");
        if (redirectBtn) {
            if (await isRedirect(domain) && storage.privacyModeActivated) {
                redirectBtn.style.display = "block";
            } else {
                redirectBtn.style.display = "none";
            }
        }

        const activateBtn = t.querySelector("#torpedoActivateLinkButton");
        if (activateBtn) {
            if (secStatus === "T4") {
                activateBtn.style.display = "block";
            } else {
                activateBtn.style.display = "none";
            }
        }

        const googleBtn = t.querySelector("#torpedoGoogle");
        if (googleBtn) {
            googleBtn.textContent = browser.i18n.getMessage("googleCheck");
        }

        const settingsBtn = t.querySelector("#torpedoOpenSettings");
        if (settingsBtn) {
            settingsBtn.textContent = browser.i18n.getMessage("openSettings");
        }

        const tutorialBtn = t.querySelector("#torpedoOpenTutorial");
        if (tutorialBtn) {
            tutorialBtn.textContent = browser.i18n.getMessage("openTutorial");
        }

        const tooltipRoot = document.querySelector(".torpedoTooltip");
        tooltipRoot.className = "torpedoTooltip";

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
                const warningImg = t.querySelector("#torpedoWarningImage2");
                const warningText = t.querySelector("#torpedoWarningText");
                if (warningImg) warningImg.style.display = "block";
                if (warningText) warningText.style.display = "block";
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
        const activateLinkButton = browser.i18n.getMessage("LinkAktivierung");
        const ueberschrift = browser.i18n.getMessage(state + "Ueberschrift");
        const erklaerung = browser.i18n.getMessage(state + "Erklaerung");
        const mehrInfo = browser.i18n.getMessage("MehrInfo");
        const infotext = browser.i18n.getMessage(state + "Infotext").replace("<URL>", url);
        const infoCheck = browser.i18n.getMessage("Info");
        const gluehbirneText = browser.i18n.getMessage(state + "GluehbirneText");
        const gluehbirneInfo = browser.i18n.getMessage("mehrInfoGluehbirne");
        const linkDeaktivierung = browser.i18n.getMessage(state + "LinkDeaktivierung");

        setHTML("#torpedoWarningText", ueberschrift);
        setHTML("#torpedoSecurityStatus", erklaerung);
        setHTML("#torpedoAdviceText", gluehbirneInfo);
        setHTML("#torpedoMoreAdvice", gluehbirneText);
        setHTML("#torpedoInfoText", mehrInfo);
        setHTML("#torpedoMoreInfo", infotext);
        setHTML("#torpedoRedirectButton", button);
        setHTML("#torpedoActivateLinkButton", activateLinkButton);
        setHTML("#torpedoLinkDelay", linkDeaktivierung);
        setHTML("#torpedoMoreInfoButton", infoCheck);

        const elementsToHide = [
            "#torpedoWarningImage",
            "#torpedoWarningImage2",
            "#torpedoTimer",
            "#torpedoInfoDiv",
            "#torpedoLinkDelay",
            "#torpedoAdvice",
            "#torpedoAdviceDiv",
            "#torpedoMoreInfoButton",
            "#torpedoRedirectButton",
            "#torpedoActivateLinkButton"
        ];
        elementsToHide.forEach(hide);

        if (gluehbirneText) show("#torpedoAdvice");
        if (linkDeaktivierung) {
            show("#torpedoLinkDelay");
        } else {
            setStyle("#torpedoInfo", {
                marginBottom: "0",
                paddingBottom: "0"
            });
        }
    }

    async function processClick() {
        const storage = await browser.runtime.sync.get(["userDefinedDomains", "trustedDomains", "onceClickedDomains"]);
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
     * Hides all elements in the tooltip except the loader.
     */
    function onlyShowLoader() {
        document.querySelectorAll(".torpedoTooltip > div > *").forEach(el => el.classList.add("loader-active"));

        const loaderBg = document.querySelector('.torpedoTooltip > .loader-bg');
        if (loaderBg) loaderBg.classList.add("transparent-bg");

        document.querySelectorAll(".loader").forEach(el => el.classList.add("loader-active"));
    }

    function deactivateLoader() {
        document.querySelectorAll(".torpedoTooltip > *").forEach(el => el.classList.remove("loader-active"));
        document.querySelectorAll(".torpedoTooltip > div > *").forEach(el => el.classList.remove("loader-active"));

        const loaderBg = document.querySelector(".torpedoTooltip > div > .loader-bg");
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

        torpedo.uri = normalizedUri;
        torpedo.url = normalizedUri.href;
        torpedo.domain = extractDomain(normalizedUri.hostname);
        torpedo.pathname = normalizedUri.pathname + normalizedUri.search + normalizedUri.hash;
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
