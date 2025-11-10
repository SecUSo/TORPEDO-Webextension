document.addEventListener("click", (e) => {
    const targetId = e.target.id;

    if (targetId === "torpedoPage") {
        browser.tabs.create({url: "https://secuso.aifb.kit.edu/TORPEDO.php"});
    } else if (targetId === "options") {
        browser.runtime.openOptionsPage();
    } else if (targetId === "error" && e.target.classList.contains("error")) {
        browser.runtime.sendMessage({name: "sendMail"});
    }
});


function init() {
    const torpedoPageButton = document.getElementById("torpedoPage");
    const optionsButton = document.getElementById("options");
    const errorButton = document.getElementById("error");

    torpedoPageButton.textContent = browser.i18n.getMessage("extensionName");
    optionsButton.textContent = browser.i18n.getMessage("options");

    browser.storage.sync.get("state").then((object) => {
        if (object.state && object.state.works) {
            errorButton.className = "working";
            errorButton.textContent = browser.i18n.getMessage("OK");
        } else {
            errorButton.className = "error";
            errorButton.textContent = browser.i18n.getMessage("error");
        }
    });
}

document.addEventListener("DOMContentLoaded", init);
