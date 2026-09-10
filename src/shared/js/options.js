let toastTimeout = null;
await initOptions();


async function initOptions() {
    toggleListVisibility("off");
    setStaticText();
    await loadAndApplyUserSettings();
    attachEventListeners();
    initTooltips();
}


/**
 *
 * @param settingsUpdate
 * @returns {Promise<void>}
 */
async function autoSave(settingsUpdate) {
    await browser.storage.sync.set(settingsUpdate);
}


function initTooltips() {
    const tooltip = document.getElementById("floating-tooltip");
    const triggers = document.querySelectorAll("[data-tooltip]");

    const { computePosition, flip, shift, offset } = window.FloatingUIDOM;

    triggers.forEach(trigger => {
        const showTooltip = () => {
            const textKey = trigger.getAttribute("data-tooltip");
            if (!textKey) return;

            tooltip.textContent = browser.i18n.getMessage(textKey) || "no messages for this key";
            tooltip.style.display = "block";

            computePosition(trigger, tooltip, {
                placement: "top",
                middleware: [offset(8), flip(), shift({ padding: 8 })]
            }).then(({ x, y }) => {
                Object.assign(tooltip.style, {
                    left: `${x}px`,
                    top: `${y}px`
                });
            });
        };

        const hideTooltip = () => {
            tooltip.style.display = "none";
        };

        trigger.addEventListener("mouseenter", showTooltip);
        trigger.addEventListener("mouseleave", hideTooltip);
        trigger.addEventListener("focus", showTooltip);
        trigger.addEventListener("blur", hideTooltip);
    });
}


function showToast(message, duration = 2200) {
    const toast = document.getElementById("toast-notification");

    toast.textContent = message;
    toast.classList.add("visible");

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
    }, duration);
}


function setStaticText() {
    const textMap = {
        "options-title": "options",

        // timer tab
        "timerCheckboxText": "timerActivated",
        "timerInputPrefix": "timerAmount",
        "timerInputSuffix": "seconds",
        "devTrustedTimerCheckboxText": "activateTimerOnLowRisk",
        "userTrustedTimerCheckboxText": "activateTimerOnUserList",
        "privacyModeCheckboxText": "activatePrivacyMode",
        "securityModeCheckboxText": "activateSecurityMode",
        "redirectModeCheckboxText": "activateRedirectMode",

        // domain tab
        "trustedDomainsTitle": "lowRiskDomains",
        "devTrustedDomainsCheckboxText": "activateLowRiskList",
        "showDevTrustedDomainsBtn": "showLowRiskList",
        "userTrustedDomainsTitle": "userDomains",
        "showUserTrustedDomainsBtn": "editUserList",
        "addUserTrustedDomainBtn": "addEntries",

        // redirect tab
        "redirectTextOne": "referrerInfo1",
        "redirectTextTwo": "referrerExample",
        "addDefaultReferrerBtn": "addDefaultReferrer",
        "showReferrerBtn": "referrerList",
        "redirectTitle": "addEntries",
        "redirectTextThree": "referrerInfo2",
        "referrerInputHostText": "exampleReferrerHost",
        "referrerInputPathText": "exampleReferrerPath",
        "referrerInputAttributeText": "exampleReferrerAttribute",
        "addReferrerBtn": "addEntries",

        // short url tab
        "shortUrlTextOne": "shortURLInfo",
        "shortUrlTitle": "shortURLListText",
        "showShortUrlBtn": "editUserList",
        "addShortUrlBtn": "addEntries",

        // tooltip tab
        "tooltipTextOne": "tooltip_text",
        "tooltipPreviewUrlLongTitle": "shortUeberschrift",
        "tooltipPreviewUrlShortTitle": "longUeberschrift",
        "tooltipPreviewSecurityShort": "longT31Erklaerung",
        "tooltipPreviewSecurityLong": "shortT31Erklaerung",
        "moreInfoText": "mehrInfo",
        "timerTextOne": "T31LinkDeaktivierung",

        // tutorial tab
        "tutorialTextOne": "tutorial_text",
        "openTutorialBtn": "open_tutorial_text"
    }

    const el = document.getElementById("timerTextTwo");
    el.textContent = browser.i18n.getMessage("verbleibendeZeit", "0");

    for (const id in textMap) {
        const element = document.getElementById(id);
        if (element) {
            const msg = browser.i18n.getMessage(textMap[id]) || textMap[id];
            while (element.firstChild) element.removeChild(element.firstChild);
            element.appendChild(parseLimitedMarkup(msg));
        }
    }
}


async function loadAndApplyUserSettings() {
    const settings = await browser.storage.sync.get(null);

    // timer tab
    const timerValue = settings.timer;
    const childSection = document.getElementById("timerChildSection");
    document.getElementById("timerInput").value = timerValue;
    document.getElementById("timerCheckbox").checked = timerValue > 0;

    if (timerValue > 0) {
        childSection.classList.add("active");
    } else {
        childSection.classList.remove("active");
    }

    document.getElementById("devTrustedTimerCheckbox").checked = settings.trustedTimerActivated;
    document.getElementById("userTrustedTimerCheckbox").checked = settings.userTimerActivated;
    document.getElementById("privacyModeCheckbox").checked = settings.privacyModeActivated;
    // document.getElementById("securityModeCheckbox").checked = ;
    document.getElementById("redirectModeCheckbox").checked = settings.redirectModeActivated;

    // domains tab
    document.getElementById("devTrustedDomainsCheckbox").checked = settings.trustedListActivated;
    document.getElementById("showDevTrustedDomainsBtn").disabled = !settings.trustedListActivated;

    fillDevTrustedList(settings);
    fillUserTrustedList(settings);

    // redirect tab
    fillReferrerList(settings);

    // Short-Url tab
    fillShortURLList(settings);

    // tooltip tab
    if (settings.section_url_active === true) {
        document.getElementById("tooltipPreviewUrlTitleDiv").classList.add("active");
        document.getElementById("tooltipPreviewUrlTitleCheckbox").checked = true;
    } else {
        document.getElementById("tooltipPreviewUrlTitleDiv").classList.remove("active");
        document.getElementById("tooltipPreviewUrlTitleCheckbox").checked = false;
    }

    if (settings.minimal_url === true) {
        document.getElementById("tooltipPreviewUrlDiv").classList.add("active");
        document.getElementById("tooltipPreviewUrlTitleDiv").classList.add("long");
        document.getElementById("tooltipPreviewSecurityDiv").classList.add("long");
        document.getElementById("tooltipPreviewUrlCheckbox").checked = true;
    } else {
        document.getElementById("tooltipPreviewUrlDiv").classList.remove("active");
        document.getElementById("tooltipPreviewUrlTitleDiv").classList.remove("long");
        document.getElementById("tooltipPreviewSecurityDiv").classList.remove("long");
        document.getElementById("tooltipPreviewUrlCheckbox").checked = false;
    }

    if (settings.section_security_active === true) {
        document.getElementById("tooltipPreviewSecurityDiv").classList.add("active");
        document.getElementById("tooltipPreviewSecurityCheckbox").checked = true;
    } else {
        document.getElementById("tooltipPreviewSecurityDiv").classList.remove("active");
        document.getElementById("tooltipPreviewSecurityCheckbox").checked = false;
    }

    if (settings.section_info_active === true) {
        document.getElementById("tooltipPreviewMoreInfoDiv").classList.add("active");
        document.getElementById("tooltipPreviewMoreInfoCheckbox").checked = true;
    } else {
        document.getElementById("tooltipPreviewMoreInfoDiv").classList.remove("active");
        document.getElementById("tooltipPreviewMoreInfoCheckbox").checked = false;
    }

    if (settings.section_timer_active === true) {
        document.getElementById("tooltipPreviewTimerDiv").classList.add("active");
        document.getElementById("tooltipPreviewTimerCheckbox").checked = true;
    } else {
        document.getElementById("tooltipPreviewTimerDiv").classList.remove("active");
        document.getElementById("tooltipPreviewTimerCheckbox").checked = false;
    }
}


function attachEventListeners() {
    // Checkbox auto-save helper
    const bindAutoSaveCheckbox = (id, key) => {
        document.getElementById(id).addEventListener("change", async (event) => {
            await autoSave({ [key]: event.target.checked });
            await loadAndApplyUserSettings();
        });
    };

    // navigation
    document.querySelector(".tab-links").addEventListener("click", (event) => {
        const anchor = event.target.closest("a");
        if (anchor) {
            event.preventDefault();
            switchTab(anchor);
        }
    });

    // timer tab
    document.getElementById("timerCheckbox").addEventListener("change", async (event) => {
        const childSection = document.getElementById("timerChildSection");
        const timerInput = document.getElementById("timerInput");

        if (event.target.checked) {
            childSection.classList.add("active");
            timerInput.value = 3;
            await autoSave({ timer: 3 });

        } else {
            childSection.classList.remove("active");
            timerInput.value = 0;
            await autoSave({ timer: 0 });
        }
    });

    document.getElementById("timerInput").addEventListener("change", async (event) => {
        const timerInput = document.getElementById("timerInput");

        let timerValue = event.target.value;
        if (timerValue === "") timerValue = 3;
        timerValue = Math.max(0, Math.ceil(parseFloat(timerValue.replace(",", "."))));

        timerInput.value = timerValue;
        await autoSave({ timer: timerValue });

        if (!(timerValue > 0)) {
            document.getElementById("timerCheckbox").checked = false;
            const childSection = document.getElementById("timerChildSection");
            childSection.classList.remove("active");
        }
    });

    bindAutoSaveCheckbox("devTrustedTimerCheckbox", "trustedTimerActivated");
    bindAutoSaveCheckbox("userTrustedTimerCheckbox", "userTimerActivated");
    bindAutoSaveCheckbox("privacyModeCheckbox", "privacyModeActivated");
    // bindAutoSaveCheckbox("securityModeCheckbox", );
    bindAutoSaveCheckbox("redirectModeCheckbox", "redirectModeActivated");

    // domains tab
    document.getElementById("devTrustedDomainsCheckbox").addEventListener("change", async (event) => {
        const isChecked = event.target.checked;
        document.getElementById("showDevTrustedDomainsBtn").disabled = !isChecked;
        await autoSave({ trustedListActivated: isChecked });

        if (!isChecked) document.getElementById("devTrustedList").style.display = "none";
    });

    document.getElementById("showDevTrustedDomainsBtn").addEventListener("click", () => toggleListVisibility("devTrustedList"));
    document.getElementById("showUserTrustedDomainsBtn").addEventListener("click", () => toggleListVisibility("userTrustedList"));
    document.getElementById("addUserTrustedDomainBtn").addEventListener("click", () => addUserDefined());

    // redirect tab
    document.getElementById("addDefaultReferrerBtn").addEventListener("click", () => addDefaultReferrer());
    document.getElementById("showReferrerBtn").addEventListener("click", () => toggleListVisibility("referrerList"));
    document.getElementById("addReferrerBtn").addEventListener("click", () => addReferrer());

    // Short-Url tab
    document.getElementById("showShortUrlBtn").addEventListener("click", () => toggleListVisibility("shortUrlList"));
    document.getElementById("addShortUrlBtn").addEventListener("click", () => addShortUrl());

    // tooltip tab
    bindAutoSaveCheckbox("tooltipPreviewUrlTitleCheckbox", "section_url_active");
    bindAutoSaveCheckbox("tooltipPreviewUrlCheckbox", "minimal_url");
    bindAutoSaveCheckbox("tooltipPreviewSecurityCheckbox", "section_security_active");
    bindAutoSaveCheckbox("tooltipPreviewMoreInfoCheckbox", "section_info_active");
    bindAutoSaveCheckbox("tooltipPreviewTimerCheckbox", "section_timer_active");

    // tutorial tab
    document.getElementById("openTutorialBtn").addEventListener("click", async () => {
        await browser.runtime.sendMessage({ name: "tutorial" });
    });
}


/**
 *
 * @param clickedAnchor
 */
function switchTab(clickedAnchor) {
    document.querySelectorAll(".tab-links a").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-content .tab").forEach(tab => tab.classList.remove("active"));

    clickedAnchor.classList.add("active");
    const targetTab = document.querySelector(clickedAnchor.getAttribute("href"));
    if (targetTab) targetTab.classList.add("active");

    toggleListVisibility("off");
}


function toggleListVisibility(listId) {
    if (listId === "off") {
        document.querySelectorAll(".data-table").forEach(table => table.style.display = "none");
        return;
    }

    const listElement = document.getElementById(listId);
    const isVisible = listElement.style.display !== "none";
    document.querySelectorAll(".data-table").forEach(table => table.style.display = "none");
    listElement.style.display = isVisible ? "none": "table";
}


function renderEmptyState(tbody) {
    const emptyRow = tbody.insertRow();
    const cell = emptyRow.insertCell(0);
    cell.className = "table-empty-state";
    cell.textContent = "No entries added yet";
}


function fillDevTrustedList(settings) {
    const domains = settings.trustedDomains || [];
    const table = document.getElementById("devTrustedList");
    const tbody = table.querySelector("tbody") || table.createTBody();
    tbody.textContent = "";

    const headerRow = tbody.insertRow();
    const headerCell = document.createElement("th");
    headerCell.id = "devTrustedListTitle";
    headerCell.textContent = browser.i18n.getMessage("trustedList");
    headerRow.appendChild(headerCell);

    if (domains.length === 0) {
        renderEmptyState(tbody);
        return;
    }

    domains.forEach(domain => {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        const span = document.createElement("span");
        span.textContent = String(domain);
        cell.appendChild(span);
    });
}


function fillUserTrustedList(settings) {
    const domains = settings.userDefinedDomains || [];
    const table = document.getElementById("userTrustedList");
    const tbody = table.querySelector("tbody") || table.createTBody();
    tbody.textContent = "";

    const headerRow = tbody.insertRow();
    const headerCell = document.createElement("th");
    headerCell.id = "userTrustedListTitle";
    headerCell.textContent = browser.i18n.getMessage("userList");
    headerRow.appendChild(headerCell);

    if (domains.length === 0) {
        renderEmptyState(tbody);
        return;
    }

    domains.forEach((domain, index) => {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        const div = document.createElement("div");
        div.className = "list-row-item";

        const btn = document.createElement("button");
        btn.className = "deleteBtn";
        btn.textContent = "✕";
        btn.addEventListener("click", async () => {
            domains.splice(index, 1);
            await autoSave({ userDefinedDomains: domains });
            fillUserTrustedList(settings);
        });

        const span = document.createElement("span");
        span.textContent = domain;

        div.appendChild(btn);
        div.appendChild(span);
        cell.append(div);
    });
}


function fillReferrerList(settings) {
    const hosts = settings.referrerPart1 || [];
    const paths = settings.referrerPart2 || [];
    const attributes = settings.referrerPart3 || [];

    const table = document.getElementById("referrerList");
    const tbody = table.querySelector("tbody") || table.createTBody();
    tbody.textContent = "";

    const headerRow = tbody.insertRow();
    const headerCell = document.createElement("th");
    headerCell.id = "referrerListTitle";
    headerCell.textContent = browser.i18n.getMessage("referrerList");
    headerRow.appendChild(headerCell);

    if (hosts.length === 0) {
        renderEmptyState(tbody);
        return;
    }

    hosts.forEach((host, index) => {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        const div = document.createElement("div");
        div.className = "list-row-item";

        const btn = document.createElement("button");
        btn.className = "deleteBtn";
        btn.textContent = "✕";
        btn.addEventListener("click", async () => await deleteReferrer(index));

        const span = document.createElement("span");
        span.textContent = `${host}${paths[index]}${attributes[index]}`;

        div.appendChild(btn);
        div.appendChild(span);
        cell.append(div);
    });
}


function fillShortURLList(settings) {
    const domains = settings.redirectDomains || [];
    const table = document.getElementById("shortUrlList");
    const tbody = table.querySelector("tbody") || table.createTBody();
    tbody.textContent = "";

    const headerRow = tbody.insertRow();
    const headerCell = document.createElement("th");
    headerCell.id = "shortUrlListTitle";
    headerCell.textContent = browser.i18n.getMessage("shortURLListText");
    headerRow.appendChild(headerCell);

    if (domains.length === 0) {
        renderEmptyState(tbody);
        return;
    }

    domains.forEach((domain, index) => {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        const div = document.createElement("div");
        div.className = "list-row-item";

        const btn = document.createElement("button");
        btn.className = "delete-btn";
        btn.textContent = "✕";
        btn.addEventListener("click", async () => {
            domains.splice(index, 1);
            await autoSave({ redirectDomains: domains });
            const newSettings = await browser.storage.sync.get(null);
            fillShortURLList(newSettings);
        });

        const span = document.createElement("span");
        span.textContent = String(domain);

        div.appendChild(btn);
        div.appendChild(span);
        cell.appendChild(div);
    });
}


/**
 *
 */
async function addUserDefined() {
    let input = document.getElementById("userTrustedDomainInput").value.trim();
    const settings = await browser.storage.sync.get(null);

    if (!input) return;

    await browser.runtime.sendMessage({ name: "TLD" }, async (tld) => {
        Torpedo.publicSuffixList.parse(tld, punycode.toASCII);
    });

    let inputDomain = "";
    try {
        const urlString = input.includes("://") ? input : `https://${input}`;
        const href = new URL(urlString);

        const isValidDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(href.hostname);
        if (!isValidDomain) {
            showToast(browser.i18n.getMessage("toastNotificationInvalidDomain"));
            document.getElementById("userTrustedDomainInput").value = "";
            return;
        }

        inputDomain = Torpedo.extractDomain(href.hostname);

    } catch (err) {
        showToast(browser.i18n.getMessage("toastNotificationAddError"));
        console.log("error:", err);
        document.getElementById("userTrustedDomainInput").value = "";
        return;
    }

    if (settings.trustedDomains.includes(inputDomain) && settings.trustedListActivated) {
        showToast(browser.i18n.getMessage("toastNotificationAlreadyInDev"));
        document.getElementById("userTrustedDomainInput").value = "";
        return;
    }

    const userDomains = settings.userDefinedDomains || [];
    if (userDomains.includes(inputDomain)) {
        showToast(browser.i18n.getMessage("toastNotificationAlreadyInUser"));
        document.getElementById("userTrustedDomainInput").value = "";
        return;
    }

    userDomains.push(inputDomain);
    await autoSave({ userDefinedDomains: userDomains });
    const newSettings = await browser.storage.sync.get(null);

    fillUserTrustedList(newSettings);
    document.getElementById("userTrustedDomainInput").value = "";
}


async function addReferrer() {
    const hostInput = document.getElementById("referrerInputHost").value.trim().toLowerCase();
    const pathInput = document.getElementById("referrerInputPath").value.trim();
    const attributeInput = document.getElementById("referrerInputAttribute").value.trim();

    if (!hostInput) return;

    const settings = await browser.storage.sync.get(null);
    const hosts = settings.referrerPart1 || [];
    const paths = settings.referrerPart2 || [];
    const attributes = settings.referrerPart3 || [];

    const alreadyExists = hosts.some((h, i) => h === hostInput && paths[i] === pathInput && attributes[i] === attributeInput);
    if (alreadyExists) {
        showToast(browser.i18n.getMessage("toastNotificationAlreadyInReferrer"));
        return;
    }

    hosts.push(hostInput);
    paths.push(pathInput);
    attributes.push(attributeInput);

    await autoSave({ referrerPart1: hosts, referrerPart2: paths, referrerPart3: attributes });

    const newSettings = await browser.storage.sync.get(null);
    fillReferrerList(newSettings);

    document.getElementById("referrerInputHost").value = "";
    document.getElementById("referrerInputPath").value = "";
    document.getElementById("referrerInputAttribute").value = "";
}


async function addDefaultReferrer() {
    const defaultReferrers = [
        { host: "deref-gmx.net", path: "/mail/client/[...]/dereferrer/?", attribute: "redirectUrl=" },
        { host: "deref-web-02.de", path: "/mail/client/[...]/dereferrer/?", attribute: "redirectUrl=" },
        { host: "deref-web.de", path: "/mail/client/[...]/dereferrer/?", attribute: "redirectUrl=" },
        { host: "google.*", path: "/url?", attribute: "url=" },
        { host: "google.*", path: "/url?", attribute: "q=" }
    ]

    const settings = await browser.storage.sync.get(null);
    const hosts = settings.referrerPart1 || [];
    const paths = settings.referrerPart2 || [];
    const attributes = settings.referrerPart3 || [];

    defaultReferrers.forEach((referrer) => {
        const exists = hosts.some((h, i) => h === referrer.host && paths[i] === referrer.path && attributes[i] === referrer.attribute);

        if (!exists) {
            hosts.push(referrer.host);
            paths.push(referrer.path);
            attributes.push(referrer.attribute);
        }
    });

    await autoSave({ referrerPart1: hosts, referrerPart2: paths, referrerPart3: attributes });

    const newSettings = await browser.storage.sync.get(null);
    fillReferrerList(newSettings);
}


async function addShortUrl() {
    const inputElement = document.getElementById("shortUrlInput").value.trim().toLowerCase();
    const settings = await browser.storage.sync.get(null);

    if (!inputElement) return;

    const isValidDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(inputElement);
    if (!isValidDomain) {
        showToast(browser.i18n.getMessage("toastNotificationInvalidDomain"));
        document.getElementById("shortUrlInput").value = "";
        return;
    }

    const domains = settings.redirectDomains || [];
    if (domains.includes(inputElement)) {
        showToast(browser.i18n.getMessage("toastNotificationAlreadyInShortUrl"));
        return;
    }

    domains.push(inputElement);
    await autoSave({ redirectDomains: domains });
    document.getElementById("shortUrlInput").value = "";
    const newSettings = await browser.storage.sync.get(null);
    fillShortURLList(newSettings);
}


async function deleteReferrer(index) {
    const settings = await browser.storage.sync.get(null);
    const hosts = settings.referrerPart1 || [];
    const paths = settings.referrerPart2 || [];
    const attributes = settings.referrerPart3 || [];

    hosts.splice(index, 1);
    paths.splice(index, 1);
    attributes.splice(index, 1);

    await autoSave({ referrerPart1: hosts, referrerPart2: paths, referrerPart3: attributes });
    const newSettings = await browser.storage.sync.get(null);
    fillReferrerList(newSettings);
}