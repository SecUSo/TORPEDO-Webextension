// Page registry
const pages = [
    "welcome",                  // 0
    "explanation",              // 1
    "tooltip",                  // 2
    "green-case",               // 3
    "grey-case",                // 4
    "grey-case-showcase"        // 5
];

// todo: change imgs

const LAST_PAGE = pages.length - 1;


// State
let activePageIndex = 0;
let lang = "en";


// DOM ready
document.addEventListener("DOMContentLoaded", () => {
    lang = browser.i18n.getUILanguage().substring(0, 2);

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

    document.getElementById("finish").addEventListener("click", (e) => {
        if (!e.currentTarget.classList.contains("disabled")) {
            browser.runtime.sendMessage({ name: "close" });
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
    console.log("update overview for index: ", activePageIndex);
    const activePageName = pages[activePageIndex];
    console.log("activePageName found: " + activePageName);

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

    prepStaticPage();

    /*if (isExamplePage(pages[activePageIndex])) {
        prepExample();

    } else {
        prepStaticPage();
    }*/
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

    /*
    for (let i = 1; i < 8; i++) {
        document.getElementById(`functionality-explanation-txt-${i}`).innerHTML =
            getMsg(`functionality_explanation_txt_${i}`);
    }

    document.getElementById(`domain-explain`).textContent = getMsg(`domain_translation`);
    document.getElementById("green-case-showcase-title").textContent = getMsg("green_case_title");
    document.getElementById("blue-case-showcase-title").textContent = getMsg("blue_case_title");
    document.getElementById("simple-grey-case-showcase-title").textContent = getMsg("simple_grey_case_title");
    document.getElementById("warning-grey-case-showcase-title").textContent = getMsg("warning_grey_case_title");

    document
        .getElementById("green-case-showcase-img")
        .setAttribute("src", `/img/examples/${lang}/green_case_${lang}.svg`);
    document
        .getElementById("blue-case-showcase-img")
        .setAttribute("src", `/img/examples/${lang}/blue_case_${lang}.svg`);
    document
        .getElementById("simple-grey-case-showcase-img")
        .setAttribute(
            "src",
            `/img/examples/${lang}/simple-grey_case_no-phish_${lang}.svg`);
    document
        .getElementById("warning-grey-case-showcase-img")
        .setAttribute(
            "src",
            `/img/examples/${lang}/warning-grey_case_no-phish_${lang}.svg`);

    let showcases = Array.from(document.querySelectorAll(".show-case-card.card"));
    showcases.forEach((showcase) => {
        showcase.addEventListener("click", (e) => {
            const targetPage = showcase.dataset.targetPage;
            if (!targetPage) return;

            const pageIndex = findFirstByIndex(pages, targetPage);
            if (pageIndex !== null) {
                activePageContent = pageIndex;
                show();
            }
        });
    });

    document
        .getElementById("contextmenu-img")
        .setAttribute(
            "src",
            `/img/examples/${lang}/simple-grey_case_contextmenu_${lang}.svg`
        );
    document.getElementById("special-cases-title").textContent = getMsg("special_cases_title");
    document.getElementById("special-cases-txt").textContent = getMsg("special_cases_txt");

    document.getElementById("settings-title").textContent = getMsg("settings_title");
    document.getElementById("settings-subtitle").textContent = getMsg("settings_subtitle");
    document
        .getElementById("settings-img")
        .setAttribute("src", `/img/examples/${lang}/settings_${lang}.png`);
    Array.from(document.querySelectorAll(".settings-option")).forEach(
        (option, index) => {
            // Using .innerHTML because msg might contain formatting
            document.getElementById(`settings-option-${index + 1}`).innerHTML =
                getMsg(`settings_option_${index}`);
        }
    );*/
}

/**
 *
 * @param {*} obj object to go through
 * @param {*} firstExampleValue RegEx to look for, if none is specified first value containing the RegEx "_case" is chosen
 *
 *  @returns first match containing firstExampleValue, if none matches returns null
 */
function findFirstByIndex(obj, firstExampleValue = null) {
    let result = firstExampleValue
        ? Object.entries(obj)
            .sort((a, b) => a[0] - b[0])
            .filter((entry) => entry[1].match(firstExampleValue))
        : Object.entries(obj)
            .sort((a, b) => a[0] - b[0])
            .filter((entry) => entry[1].match(/_case/g));
    return result.length ? result[0][0] : null;
}

/**
 *
 * @param {*} string word that shall be cut off at stopper
 * @param {*} stopper last part in word
 */
function wordStopper(string, stopper) {
    return string.includes(stopper)
        ? string.substring(0, string.indexOf(stopper)).concat(stopper)
        : string;
}
/**
 *
 * @param {*} string word where the last part shall be "_case"
 *
 *  special case of wordStopper, stopper is "_case"
 */
function caseStopper(string) {
    return wordStopper(string, "_case");
}

/**
 *
 * @param {*} object object/array from which to id the key/index
 * @param {*} value value of the object of which the key ought to be found
 * @param {*} first determines whether to output first or last instance of matches. Defaults to first.
 */
function keyByValue(object, value, first = true) {
    if (first) return Object.keys(object).find((key) => object[key] === value);
    else {
        let result = Object.keys(object)
            .filter((key) => object[key] === value)
            .sort((b, a) => a[0] - b[0])[0];
        return result;
    }
}

function findAmountOfExamplesOfCategory(category, obj) {
    let amount = 0;
    amount = Object.values(obj).filter((page) => {
        return page.includes(caseStopper(category));
    }).length;

    return amount;
}

function nrInCategory(category, obj) {
    let sortedCats = Object.entries(obj).filter((page) => {
        return page[1].includes(caseStopper(category));
    });
    let nrOfCat = 0;
    for (el of sortedCats) keyByValue(pages, category) > el[0] ? nrOfCat++ : null;
    return nrOfCat;
}

function prepExample() {
    console.log("prep example");
    document.querySelector(".svg-in-img").setAttribute(
        "src", `./img/examples/${lang}/${pages[activePageContent]}_${lang}.svg`
    );

    document.getElementById("example-title").innerHTML = getMsg(
        `${caseStopper(pages[activePageContent])}_title`
    );

    document.getElementById("category-explanation").innerHTML = getMsg(
        `${caseStopper(pages[activePageContent])}_category`
    );

    document.getElementById("explanation-of-specific-link").innerHTML = getMsg(
        `${pages[activePageContent]}_specific_link_explanation`
    );

    let amountActiveCat = findAmountOfExamplesOfCategory(
        pages[activePageContent],
        pages
    );

    let context = getMsg(`${pages[activePageContent]}_context`);

    if (context) {
        document.getElementById("example-context").innerHTML =
            `<span class="underlined">${getMsg("example")}${
                amountActiveCat > 1
                    ? ` ${nrInCategory(pages[activePageContent], pages) + 1}`
                    : ""
            }:</span> ` + context;

        document.getElementById("additional-info").classList.remove("off");
    } else {
        document.getElementById("additional-info").classList.add("off");
    }

    if (amountActiveCat > 1) {
        document.getElementById("more-than-one-example").innerHTML = getMsg(
            `${caseStopper(pages[activePageContent])}_more_than_one`
        );

        document.getElementById("more-than-one").classList.remove("off");
    } else {
        document.getElementById("more-than-one").classList.add("off");
    }

    document.querySelector(".example-wrapper").classList.remove("off");
}

function prepStaticPage() {
    const className = pages[activePageIndex]
    console.log("prep static page with classname: " + className);

    document.querySelectorAll(`.${className}`).forEach((el) => {
        console.log("found elemenet: ", el);
        el.classList.remove("off");
    });
}


// utilities
function isExamplePage(pageName) {
    return pageName.includes("_case");
}


// Helper methods
function getMsg(key) {
    return browser.i18n.getMessage(key.replace(/-/g, "_"));
}

function setInnerHTML(elementIdOrSelector, msgKey, isSelector = false) {
    const el = isSelector
        ? document.querySelector(elementIdOrSelector)
        : document.getElementById(elementIdOrSelector);

    if (el) el.innerHTML = getMsg(msgKey);
}
