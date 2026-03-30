let activePageContent = 0;
let lang = "en";
let overviewVisible = true;
/* 
  FOR EASY PLUG AND PLAY OF PAGES:
  * numbers start from 0
  * numbers are indicating the placement (order)
  * if you want an overview bubble you need to edit the tutorial html
    at the specified position to match the order (page 0 --> first overview) in the
    section "overview"
  * the page you insert needs to be implemented in the html in the section "tut-content"
    and will be flipped on and off as soon as it is called upon (through navigation)
  * If you want to add more than one page of a specific type
    than add "_case" and a specific term behind it (see below).
    This will allow to have different pictures within one general 
    category of cases. F.e. simple-grey_case is one category with the
    sub-pages _no-phish and _phish.
  * Naming-convention for all before green_case is
    same name as css class; "-" in css, "_" in js
*/
const pages = {
  0: "welcome",
  1: "explanation",
  2: "green_case",
  3: "blue_case",
  4: "simple-grey_case_phish",
  5: "simple-grey_case_no-phish",
  6: "warning-grey_case_phish",
  7: "warning-grey_case_no-phish",
  8: "configurations",
};

const lastPage = Math.max(...Object.keys(pages).map(Number));
let overviewCircles;

document.addEventListener("DOMContentLoaded", () => {
    lang = browser.i18n.getUILanguage().substring(0, 2);
    overviewCircles = document.querySelectorAll(".overview-case");

    overviewCircles.forEach((circle) => {
        circle.addEventListener("click", () => {
            const pageName = circle.dataset.pageName;
            if (!pageName) return;

            const pageIndex = Object.keys(pages).find(
                (key) => pages[key] === pageName
            );

            if (pageIndex !== undefined) {
                activePageContent = parseInt(pageIndex, 10);
                show();
            }
        });
    });

    document.getElementById("prev").addEventListener("click", () => {
       if (activePageContent > 0) show(--activePageContent);
    });

    document.getElementById("next").addEventListener("click", () => {
       if (activePageContent < lastPage) show(++activePageContent);
    });

    document.getElementById("finish").addEventListener("click", (e) => {
       if (!e.currentTarget.classList.contains("disabled")) {
           browser.runtime.sendMessage({ name: "close" });
       }
    });

    init();
    show(activePageContent);
});

function show() {

    activateCurrentPageElements();
    showPageContent();
}

function activateCurrentPageElements() {
    if (overviewVisible) {
        document.querySelector(".overview").style.display = "flex";
        const activePageName = pages[activePageContent];

        overviewCircles.forEach((circle) => {
           circle.classList.toggle("selected", circle.dataset.pageName === activePageName);
        });
    } else {
        document.querySelector(".overview").style.display = "none";
    }

    const isLastPage = activePageContent === lastPage;
    document.getElementById("finish").classList.toggle("disabled", !isLastPage);
}

function showPageContent() {
    document.querySelectorAll(".tut-content > div").forEach((div) => {
        div.classList.add("off");
    });

    pages[activePageContent].includes("_case") ? prepExample() : prepNoExamplePage();
}

function init() {
    activateCurrentPageElements();

    document.getElementById("welcome-title").innerHTML = getMsg("welcome_title");
    document.getElementById("introduction-txt").innerHTML = getMsg("introduction_txt");
    document.getElementById("technical-bg-title").innerHTML = getMsg("technical_background_title");
    document.getElementById("technical-bg-txt").innerHTML = getMsg("technical_background_txt");
    document.getElementById("functionality-title").innerHTML = getMsg("functionality_title");
    document.getElementById("functionality-txt").innerHTML = getMsg("functionality_txt");
    document.querySelectorAll(".welcome").forEach(el => el.classList.remove("off"));

    document.getElementById("functionality-explanation-title").textContent = getMsg(
        "functionality_explanation_title"
    );

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
    );
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

function getMsg(msg) {
  return browser.i18n.getMessage(msg.replace(/-/g, "_"));
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

function prepNoExamplePage() {
    const className = pages[activePageContent].replace(/-/g, "_");
    console.log("prep no example with: ", className);
    document.querySelectorAll(`.${className}`).forEach((elem) => {
        elem.classList.remove("off");
    })
}
