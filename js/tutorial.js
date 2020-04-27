var slideIndex = 1;
var lang = "en";
var prev = 3;
var pages = {
  1: ['guide-page-blacklist', 'basic'],
  2: ['guide-page-welcome', 'basic'],
  3: ['guide-page-why', 'basic'],
  4: ['guide_page_settings', 'tooltips'],
};

$(document).ready(function () {
  lang = chrome.i18n.getUILanguage().substr(0, 2);

  $("#prev").html(chrome.i18n.getMessage("back"));
  $("#next").html(chrome.i18n.getMessage("next"));
  $("#finish").html(chrome.i18n.getMessage("finish"));

  $("#prev").on("click", function (e) { if (slideIndex > 1) show(--slideIndex) });
  $("#next").on("click", function (e) { if (slideIndex < 4) show(++slideIndex) });
  $("#finish").on("click", function (e) { chrome.runtime.sendMessage({ "name": "close" }); });

  init();
  show(slideIndex);
});

function show(n) {
  $("#prev").prop("disabled", false);
  $("#next").prop("disabled", false);
  $("#finish").prop("disabled", true);

  var node = document.getElementById(pages[n][0]);
  var section = document.getElementById("section-" + pages[n][1] + "-item");
  node.classList.add("active");
  //section.classList.add("active");  
  document.getElementById(pages[prev][0]).classList.remove("active");
  //if(pages[prev][1] != pages[n][1]) document.getElementById("section-" + pages[prev][1] + "-item").classList.remove("active");
  prev = n;

  if (n == 4) {
    $("#next").prop("disabled", true);
    $("#finish").prop("disabled", false);
  }
  if (n == 1) $("#prev").prop("disabled", true);
}

function init() {
  // images
  document.getElementById("guide_page_settings_1-img").src = chrome.extension.getURL("img/open_settings_rightclick_" + lang + ".png");
  document.getElementById("guide_page_settings_2-img").src = chrome.extension.getURL("img/open_settings_1_" + lang + ".png");
  document.getElementById("guide_page_settings_3-img").src = chrome.extension.getURL("img/open_settings_2_" + lang + ".png");



  // side bar
  /*$("#section-basic-item").html(chrome.i18n.getMessage("guide_basic"));
  $("#section-tooltips-item").html(chrome.i18n.getMessage("guide_tooltips"));
  $("#section-settings-item").html(chrome.i18n.getMessage("guide_settings"));*/

  // page 1
  $("#torpedo-guide-intro-blacklist").html(chrome.i18n.getMessage("guide_intro_blacklist"));
  
  // page 2
  $("#torpedo-guide-basic-welcome-title").html(chrome.i18n.getMessage("guide_welcome_title"));
  $("#torpedo-guide-basic-welcome-intro1").html(chrome.i18n.getMessage("guide_welcome_intro1"));
  $("#torpedo-guide-basic-welcome-intro2").html(chrome.i18n.getMessage("guide_welcome_intro2"));

  // page 3
  $("#torpedo-guide-basic-why-title").html(chrome.i18n.getMessage("guide_why_title"));
  $("#torpedo-guide-basic-why-description1").html(chrome.i18n.getMessage("guide_why_description"));
  $("#torpedo-guide-basic-why-description2").html(chrome.i18n.getMessage("guide_tooltips_case1"));
  $("#torpedo-guide-basic-why-description3").html(chrome.i18n.getMessage("guide_tooltips_case2"));
  $("#torpedo-guide-basic-why-description4").html(chrome.i18n.getMessage("guide_tooltips_case3"));
  $("#torpedo-guide-basic-why-usage-title").html(chrome.i18n.getMessage("guide_tooltips_case4"));
  $("#torpedo-guide-basic-why-usage-list").html(chrome.i18n.getMessage("guide_why_usage_list"));

  // page 4
  $("#torpedo_guide_settings_description1").html(chrome.i18n.getMessage("guide_settings_description1"));
  $("#torpedo_guide_settings_description2").html(chrome.i18n.getMessage("guide_settings_description2"));
  $("#torpedo_guide_settings_description3").html(chrome.i18n.getMessage("guide_settings_description3"));

}