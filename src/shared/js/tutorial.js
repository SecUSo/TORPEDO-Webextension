// Page registry
const pages = [
    "welcome",                  // 0
    "explanation",              // 1
    "tooltip",                  // 2
    "green-case",               // 3
    "grey-case",                // 4
    "grey-case-showcase"        // 5
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
    setInnerHTML("tooltip-txt-2", "tooltip_txt_2");

    // green case page
    setInnerHTML("green-case-title", "green_case_title");
    setInnerHTML("green-case-txt", "green_case_txt");
    setInnerHTML("green-case-txt-2", "green_case_txt_2");

    // grey case page
    setInnerHTML("grey-case-title", "grey_case_title");
    setInnerHTML("grey-case-txt", "grey_case_txt");
    setInnerHTML("grey-case-txt-2", "grey_case_txt_2");
    setInnerHTML("grey-case-txt-3", "grey_case_txt_3");
    setInnerHTML("grey-case-txt-4", "grey_case_txt_4");
    setInnerHTML("grey-case-txt-5", "grey_case_txt_5");
    setInnerHTML("grey-case-txt-6", "grey_case_txt_6");
    setInnerHTML("grey-case-txt-7", "grey_case_txt_7");

    // grey case showcase page
    setInnerHTML("grey-case-showcase-one-title", "grey_case_showcase_one_title");
    setInnerHTML("grey-case-showcase-one-txt", "grey_case_showcase_one_txt");
    setInnerHTML("grey-case-showcase-two-title", "grey_case_showcase_two_title");
    setInnerHTML("grey-case-showcase-two-txt", "grey_case_showcase_two_txt");
}


// Helper methods
function getMsg(key) {
    return browser.i18n.getMessage(key);
}

function setInnerHTML(elementId, msgKey) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = getMsg(msgKey);
}
