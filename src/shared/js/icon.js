let detectedLocation = "";


document.addEventListener("click", async (e) => {
    const targetId = e.target.id;

    if (targetId === "torpedoPage") {
        await browser.tabs.create({url: "https://secuso.aifb.kit.edu/TORPEDO.php"});
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
    if (!tab) return;

    try {
        const url = new URL(tab.url);
        detectedLocation = url.host;

    } catch (e) {
        detectedLocation = tab.url;
    }

    const storage = await browser.storage.sync.get({ state: [] });
    const stateArray = storage.state;
    const currentEntry = stateArray.find(entry => entry.location === detectedLocation);

    if (currentEntry && currentEntry.works) {
        errorButton.className = "working";
        errorButton.textContent = browser.i18n.getMessage("OK");

    } else {
        errorButton.className = "error";
        errorButton.textContent = browser.i18n.getMessage("error");
    }
}


document.addEventListener("DOMContentLoaded", init);
