/**
 * fill tooltip with html structure
 */
function tooltipText() {
  var text =
    "<div id='torpedoWarning' class='loader-active'> \
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
  return text;
}

function onClick(id, handler) {
  const el = torpedo.tooltip.querySelector(id);
  if (el) el.addEventListener("click", handler);
}

function initTooltip() {
  const tooltip = torpedo.tooltip;

  onlyShowLoader();

  torpedo.countRedirect = 0;
  torpedo.countShortURL = 0;
  torpedo.oldDomain = torpedo.domain;
  torpedo.oldUrl = torpedo.url;

  const contextMenu = tooltip.querySelector("#torpedoContextMenu");

  // show/hide context menu on right click
  tooltip.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (contextMenu) {
      const isHidden = getComputedStyle(contextMenu).display === "none";
      contextMenu.style.position = "absolute";
      contextMenu.style.display = isHidden ? "block" : "none";
    }
  });

  // Hide context‐menu when clicking anywhere else inside tooltip
  tooltip.addEventListener("click", (event) => {
    if (contextMenu && contextMenu.style.display === "block") {
      if (!event.target.closest("#torpedoContextMenu")) {
        contextMenu.style.display = "none";
      }
    }
  });

  // add torpedo domain to user defined domains
  onClick("#torpedoMarkTrusted", async () => {
    const { userDefinedDomains = [] } = await browser.storage.sync.get("userDefinedDomains");
    const arr = [...userDefinedDomains, torpedo.domain];
    await browser.storage.sync.set({ userDefinedDomains: arr });
    updateTooltip();
  })

  // send message to background script to check domain on google
  onClick("#torpedoGoogle", () => {
    browser.runtime.sendMessage({ name: "google", url: torpedo.domain });
  })

  onClick("#torpedoOpenSettings", () => {
    browser.runtime.sendMessage({ name: "settings" });
  })

  onClick("#torpedoOpenTutorial", () => {
    browser.runtime.sendMessage({ name: "tutorial" });
  });

  // show/hide advice text
  onClick("#torpedoInfoText", () => {
    const infoDiv = tooltip.querySelector("#torpedoInfoDiv");
    if (infoDiv) {
      infoDiv.style.display = getComputedStyle(infoDiv).display === "none" ? "block" : "none";
    }
  })

  onClick("#torpedoAdviceText", () => {
    const adviceDiv = tooltip.querySelector("#torpedoAdviceDiv");
    if (adviceDiv) {
        adviceDiv.style.display = getComputedStyle(adviceDiv).display === "none" ? "block" : "none";
    }
  })

  onClick("#torpedoMoreInfoButton", (event) => {openInfoImage(event)})

  onClick("#torpedoRedirectButton", async (event) => {
    resolveRedirect(event);
    torpedo.api.hide();
  })

  const activateBtn = tooltip.querySelector("#torpedoActivateLinkButton");
  if (activateBtn) activateBtn.disabled = true;
}

function setHTML(selector, hmtl) {
  const el = torpedo.tooltip.querySelector(selector);
  if (el) el.innerHTML = hmtl;
}

function hide(selector) {
    const el = torpedo.tooltip.querySelector(selector);
    if (el) el.style.display = "none";
}

function show(selector) {
    const el = torpedo.tooltip.querySelector(selector);
    if (el) el.style.display = "block";
}

function setStyle(selector, styleObj) {
  const el = torpedo.tooltip.querySelector(selector);
  if (el) {
    Object.assign(el.style, styleObj);
  }
}

function assignText(state, url, tooltip) {
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

/**
 * fill the basic tooltip structure with corresponding texts
 */
async function updateTooltip() {
  // Values of sync storage (r) and local storage (re) are relevant for further processing

  const r = await browser.storage.sync.get(null);
  const secStatus = getSecurityStatus(r);

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

  assignText(secStatus, url, t);

  const domain = torpedo.domain;
  const shouldHideTrusted = r.referrerPart1?.includes(domain) ||
    r.userDefinedDomains?.includes(domain) ||
    r.trustedDomains?.includes(domain) ||
    r.redirectDomains?.includes(domain);

  const markTrustedEl = t.querySelector("#torpedoMarkTrusted");
    if (markTrustedEl) {
      markTrustedEl.style.display = shouldHideTrusted ? "none" : "block";
      markTrustedEl.textContent = browser.i18n.getMessage("markAsTrusted");
    }

  const redirectBtn = t.querySelector("#torpedoRedirectButton");
  if (redirectBtn) {
    if (isRedirect(domain) && r.privacyModeActivated) {
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

  const tooltipRoot = document.querySelector(".tippy-content");
  if (tooltipRoot) {
    tooltipRoot.classList.remove("torpedoUserDefined", "torpedoTrusted", "torpedoPhish");

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
  }

  const eventTypes = ["click", "contextmenu", "mouseup", "mousedown"];

  if (isTimerActivated(r, secStatus)) {
    countdown(r.timer, secStatus, eventTypes);
  } else {
    reactivateLink(torpedo.target, eventTypes);
  }

  deactivateLoader();
}

/**
 * opens an image containing information on URL checking
 */
function openInfoImage(event) {
  var t = torpedo.tooltip;
  $(t.find("#torpedoInfoImage")[0]).qtip({
    overwrite: false,
    content: {
      text:
        "<img id='torpedoPopupImage' src='" +
        chrome.runtime.getURL(chrome.i18n.getMessage("infoImage")) +
        "'> ",
      button: true,
    },
    show: {
      event: event.type,
      ready: true,
    },
    hide: {
      event: "unfocus",
    },
    position: {
      at: "center",
      my: "center",
      target: jQuery(window),
    },
    style: {
      classes: "torpedoPopup",
    },
  });
}

function extractTLDfromDomain(domain) {
  var domainTLD = torpedo.publicSuffixList.getPublicSuffix(domain);
  return domainTLD;
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

/**
 * user has clicked on a link via the tooltip
 */
function processClick() {
  chrome.storage.sync.get(null, function (r) {
    // check if not already in user defined or trusted domain lists
    if (r.userDefinedDomains.indexOf(torpedo.domain) == -1 && r.trustedDomains.indexOf(torpedo.domain) == -1) {
      var domains = r.onceClickedDomains;
      // was domain clicked before ?
      if (domains.indexOf(torpedo.domain) > -1) {
        // remove domain from once clicked domains
        var index = domains.indexOf(torpedo.domain);
        domains.splice(index, 1);
        chrome.storage.sync.set({ onceClickedDomains: domains });
        // add domain to user defined domains
        domains = r.userDefinedDomains;
        domains[domains.length] = torpedo.domain;
        chrome.storage.sync.set({ userDefinedDomains: domains });
      }
      // add domain to once clicked domains
      else {
        domains[domains.length] = torpedo.domain;
        chrome.storage.sync.set({ onceClickedDomains: domains });
      }
    }
  });
}

function onlyShowLoader() {
  document.querySelectorAll(".torpedoTooltip > div > *").forEach(el => el.classList.add("loader-active"));

  const loaderBg = document.querySelector('.torpedoTooltip > div > .loader-bg');
  if (loaderBg) loaderBg.classList.add("transparent-bg");

  document.querySelectorAll(".loader").forEach(el => el.classList.add("loader-active"));
}

function showLoaderWithOverlay() {
  const overlay = document.querySelector('.loader-bg');
  if (overlay) overlay.classList.add("loader-active");
}

function deactivateLoader() {
  document.querySelectorAll(".torpedoTooltip > *").forEach(el => el.classList.remove("loader-active"));
  document.querySelectorAll(".torpedoTooltip > div > *").forEach(el => el.classList.remove("loader-active"));

  const loaderBg = document.querySelector(".torpedoTooltip > div > .loader-bg");
  if (loaderBg) loaderBg.classList.remove("transparent-bg");
}
