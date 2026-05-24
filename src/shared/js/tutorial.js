// Page registry
const pages = [
    "welcome",                      // 0
    "explanation",                  // 1
    "tooltip",                      // 2
    "green-case",                   // 3
    "green-case-showcase",          // 4
    "grey-case",                    // 5
    "grey-case-two",                // 6
    "grey-case-showcase",           // 7
    "warning-grey-case",            // 8
    "warning-grey-case-showcase",   // 9
    "configuration"                 // 10
];

const LAST_PAGE = pages.length - 1;


// State
let activePageIndex = 0;


// DOM ready
document.addEventListener("DOMContentLoaded", () => {

    // overview bubble clicks
    document.querySelectorAll(".overview-case").forEach((btn) => {
        btn.addEventListener("click", () => {
            const pageName = btn.dataset.pageName;
            if (!pageName) return;

            const idx = pages.indexOf(pageName);
            if (idx !== -1) {
                activePageIndex = idx;
                show();
            }
        })
    })

    document.getElementById("prev").addEventListener("click", () => {
        if (activePageIndex > 0) {
            activePageIndex--;
            show();
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        if (activePageIndex < LAST_PAGE) {
            activePageIndex++;
            show();
        }
    });

    document.getElementById("finish").addEventListener("click", async (e) => {
        if (!e.currentTarget.classList.contains("disabled")) {
            await browser.runtime.sendMessage({ name: "close" });
        }
    });

    init();
    show();
});


// Display
function show() {
    updateOverview();
    showPageContent();
}

function updateOverview() {
    const activePageName = pages[activePageIndex];

    document.querySelectorAll(".overview-case").forEach((btn) => {
        const isActive = btn.dataset.pageName === activePageName;
        btn.classList.toggle("selected", isActive);
        btn.setAttribute("aria-current", isActive ? "step" : "false");
    });

    const isLastPage = activePageIndex === LAST_PAGE;
    const finishBtn = document.getElementById("finish");
    finishBtn.classList.toggle("disabled", !isLastPage);
    finishBtn.setAttribute("aria-disabled", String(!isLastPage));
}

function showPageContent() {
    document.querySelectorAll(".tut-content > div").forEach((div) => {
        div.classList.add("off");
    });

    const className = pages[activePageIndex]
    document.querySelectorAll(`.${className}`).forEach((el) => {
        el.classList.remove("off");
    });
}

function init() {
    // welcome page
    setInnerHTML("welcome-title", "welcome_title");
    setInnerHTML("introduction-txt", "introduction_txt");
    setInnerHTML("introduction-txt-2", "introduction_txt_2");

    // explanation page
    setInnerHTML("explanation-title", "explanation_title");
    setInnerHTML("explanation-txt", "explanation_txt");
    setInnerHTML("explanation-txt-2", "explanation_txt_2");

    // tooltip page
    setInnerHTML("tooltip-title", "tooltip_title");
    setInnerHTML("tooltip-txt", "tooltip_txt");

    // green case page
    setInnerHTML("green-case-title", "green_case_title");
    setInnerHTML("green-case-txt", "green_case_txt");

    // green case showcase page
    setInnerHTML("green-case-showcase-one-title", "green_case_showcase_one_title");
    setInnerHTML("green-case-showcase-one-txt", "green_case_showcase_one_txt");
    setInnerHTML("green-case-showcase-two-title", "green_case_showcase_two_title");
    setInnerHTML("green-case-showcase-two-txt", "green_case_showcase_two_txt");

    // grey case page
    setInnerHTML("grey-case-title", "grey_case_title");
    setInnerHTML("grey-case-txt", "grey_case_txt");
    setInnerHTML("grey-case-txt-2", "grey_case_txt_2");

    // grey case two page
    setInnerHTML("grey-case-two-title", "grey_case_two_title");
    setInnerHTML("grey-case-two-txt", "grey_case_two_txt");
    setInnerHTML("grey-case-two-txt-2", "grey_case_two_txt_2");
    setInnerHTML("grey-case-two-txt-3", "grey_case_two_txt_3");
    setInnerHTML("grey-case-two-txt-4", "grey_case_two_txt_4");

    // grey case showcase page
    setInnerHTML("grey-case-showcase-one-title", "grey_case_showcase_one_title");
    setInnerHTML("grey-case-showcase-one-txt", "grey_case_showcase_one_txt");
    setInnerHTML("grey-case-showcase-two-title", "grey_case_showcase_two_title");
    setInnerHTML("grey-case-showcase-two-txt", "grey_case_showcase_two_txt");

    // warning grey case
    setInnerHTML("warning-grey-case-title", "warning_grey_case_title");
    setInnerHTML("warning-grey-case-txt", "warning_grey_case_txt");
    setInnerHTML("warning-grey-case-txt-2", "warning_grey_case_txt_2");
    setInnerHTML("warning-grey-case-showcase-one-title", "warning_grey_case_showcase_one_title");
    setInnerHTML("warning-grey-case-showcase-one-txt", "warning_grey_case_showcase_one_txt");
    setInnerHTML("warning-grey-case-showcase-two-title", "warning_grey_case_showcase_two_title");
    setInnerHTML("warning-grey-case-showcase-two-txt", "warning_grey_case_showcase_two_txt");

    // configuration
    setInnerHTML("configuration-title", "configuration_title");
    setInnerHTML("configuration-txt", "configuration_txt");
    setInnerHTML("configuration-showcase-one-txt", "configuration_showcase_one_txt");
    setInnerHTML("configuration-showcase-two-title", "configuration_showcase_two_title");
    setInnerHTML("configuration-showcase-two-txt", "configuration_showcase_two_txt");
    setInnerHTML("configuration-showcase-two-txt-2", "configuration_showcase_two_txt_2");
    setInnerHTML("configuration-showcase-two-txt-3", "configuration_showcase_two_txt_3");
    setInnerHTML("configuration-showcase-two-txt-4", "configuration_showcase_two_txt_4");
    setInnerHTML("configuration-showcase-two-txt-5", "configuration_showcase_two_txt_5");
    setInnerHTML("configuration-showcase-two-txt-6", "configuration_showcase_two_txt_6");
    setInnerHTML("configuration-showcase-three-txt", "configuration_showcase_three_txt");

    // images based on language
    const lang = browser.i18n.getUILanguage().substring(0, 2);
    setImage("green-case-showcase-one-img", `img/examples/${lang}/green_case_one_${lang}.svg`);
    setImage("green-case-showcase-two-img", `img/examples/${lang}/green_case_two_${lang}.svg`);
    setImage("grey-case-showcase-one-img", `img/examples/${lang}/grey_case_one_${lang}.svg`);
    setImage("grey-case-showcase-two-img", `img/examples/${lang}/grey_case_two_${lang}.svg`);
    setImage("warning-grey-case-showcase-one-img", `img/examples/${lang}/warning_grey_case_one_${lang}.svg`);
    setImage("warning-grey-case-showcase-two-img", `img/examples/${lang}/warning_grey_case_two_${lang}.svg`);
    setImage("configuration-showcase-one-img", `img/examples/${lang}/simple-grey_case_contextmenu_${lang}.svg`);
    setImage("configuration-showcase-two-img", `img/examples/${lang}/configuration_${lang}.png`);
    setImage("configuration-showcase-three-img", `img/examples/${lang}/icon_${lang}.png`);
}


// Helper methods
function getMsg(key) {
    return browser.i18n.getMessage(key);
}

function setInnerHTML(elementId, msgKey) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = getMsg(msgKey);
}

function setImage(id, path) {
    const el = document.getElementById(id);
    if (el) el.src = path;
}
