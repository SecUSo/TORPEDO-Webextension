/**
 * Browser version of the Script for the toolbar popup (browserAction / action popup).
 *
 * This script gets injected into the ``icon.html`` page together with the ``browser-polyfill`` library. It setts
 * the correct texts and handles the click events inside the toolbar popup.
 */


let detectedLocation = "";


document.addEventListener("click", async (e) => {
    const targetId = e.target.id;

    if (targetId === "torpedoPage") {
        await browser.tabs.create({ url: "https://secuso.aifb.kit.edu/TORPEDO.php" });
    } else if (targetId === "tutorial") {
        await browser.runtime.sendMessage({ name: "tutorial" });
    } else if (targetId === "options") {
        await browser.runtime.openOptionsPage();
    } else if (targetId === "error" && e.target.classList.contains("error")) {
        await browser.runtime.sendMessage({ name: "sendMail", location: detectedLocation });
    }
});


async function setStaticText() {
    const torpedoPageButton = document.getElementById("torpedoPage");
    torpedoPageButton.textContent = await browser.i18n.getMessage("website");

    const tutorialButton = document.getElementById("tutorial");
    tutorialButton.textContent = await browser.i18n.getMessage("tutorial");

    const optionsButton = document.getElementById("options");
    optionsButton.textContent = await browser.i18n.getMessage("options");
}


function isUrlInManifest(url) {
    const manifest = browser.runtime.getManifest();
    const matches = manifest.content_scripts[0].matches;

    return matches.some((pattern) => {
        const regexString = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*');

        const regex = new RegExp(`^${regexString}$`);
        return regex.test(url);
    });
}


async function getPageState(tabId) {
    let pageState = null;

    try {
        const response = await browser.tabs.sendMessage(tabId, { name: "getPageState" });
        if (response) pageState = response;

    } catch (e) { }

    return pageState;
}


async function init() {
    await setStaticText();
    const errorButton = document.getElementById("error");

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
        errorButton.style.display = "none";
        return;
    }

    if (tab.url.startsWith("about:") || tab.url.startsWith("moz-extension:")) {
        errorButton.style.display = "none";
        return;
    }

    if (!isUrlInManifest(tab.url)) {
        errorButton.style.display = "none";
        return;
    }

    const pageState = await getPageState(tab.id);
    detectedLocation = pageState.location;

    let className;
    let messageId;
    let displayStyle = "block";

    if (!pageState || pageState.status === "error") {
        className = "error";
        messageId = "error";

    } else if (pageState.status === "loading") {
        messageId = "loading";

    } else if (pageState.status === "success") {
        if (pageState.foundSelectors) {
            className = "working";
            messageId = "OK";

        } else {
            displayStyle = "none";
        }
    }

    if (className) errorButton.className = className;
    if (messageId) errorButton.textContent = browser.i18n.getMessage(messageId);
    errorButton.style.display = displayStyle;
}


document.addEventListener("DOMContentLoaded", init);
