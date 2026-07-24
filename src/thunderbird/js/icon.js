/**
 * Thunderbird version of the Script for the toolbar popup (browserAction / action popup).
 *
 * This script gets injected into the ``icon.html`` page together with the ``browser-polyfill`` library. It setts
 * the correct texts and handles the click events inside the toolbar popup.
 */


let detectedLocation = "";


document.addEventListener("click", async (e) => {
    const targetId = e.target.id;

    if (targetId === "torpedoPage") {
        await browser.windows.openDefaultBrowser("https://secuso.aifb.kit.edu/TORPEDO.php");
    } else if (targetId === "tutorial") {
        await browser.runtime.sendMessage({ name: "tutorial" });
    } else if (targetId === "options") {
        await browser.runtime.openOptionsPage();
    } else if (targetId === "error" && e.target.classList.contains("error")) {
        await browser.runtime.sendMessage({ name: "sendMail", location: detectedLocation });
    }
});


async function init() {
    const torpedoPageButton = document.getElementById("torpedoPage");
    const tutorialButton = document.getElementById("tutorial");
    const optionsButton = document.getElementById("options");
    const errorButton = document.getElementById("error");

    torpedoPageButton.textContent = browser.i18n.getMessage("extensionName");
    tutorialButton.textContent = browser.i18n.getMessage("tutorial");
    optionsButton.textContent = browser.i18n.getMessage("options");

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.spaceId === undefined) {
        errorButton.style.display = "none";
        return;
    }

    const displayedMessages = await browser.messageDisplay.getDisplayedMessages(tab.id);
    if (!displayedMessages || displayedMessages.messages.length === 0) {
        errorButton.style.display = "none";
        return;
    }

    errorButton.style.display = "block";

    const storage = await browser.storage.sync.get({ lastState: null });
    const lastState = storage.lastState;

    detectedLocation = lastState.location;

    if (lastState.state === "loading") {
        errorButton.textContent = browser.i18n.getMessage("loading");

    } else if (lastState.state === "works") {
        errorButton.className = "working";
        errorButton.textContent = browser.i18n.getMessage("OK");

    } else if (lastState.state === "error") {
        errorButton.className = "error";
        errorButton.textContent = browser.i18n.getMessage("error");
    }
}


document.addEventListener("DOMContentLoaded", init);
