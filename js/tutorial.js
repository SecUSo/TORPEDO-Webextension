var slideIndex = 1;
var lang = "en";
var prev = 13;
var pages = {
  1: ['guide-page-welcome', 'basic'],
  2: ['guide-page-why', 'basic'],
  3: ['guide-page-tooltips-case1', 'tooltips'],
  4: ['guide-page-tooltips-case2', 'tooltips'],
  5: ['guide-page-tooltips-case3', 'tooltips'],
  6: ['guide-page-tooltips-URL', 'extras'],
  7: ['guide-page-tooltips-specialcase', 'specialcases'],
  8: ['guide-page-tooltips-specialcase1', 'specialcases'],
  9: ['guide-page-tooltips-specialcase2', 'specialcases'],
  10: ['guide-page-tooltips-specialcase3', 'specialcases'],
  11: ['guide-page-tooltips-menu', 'menu'],
  12: ['guide-page-tooltips-menu1', 'menu'],
  13: ['guide-page-settings-delay', 'settings'],
  14: ['guide-page-settings-domains', 'settings'],
  15: ['guide-page-settings-referrer', 'settings'],
};

$(document).ready(function() {
  lang = chrome.i18n.getUILanguage().substr(0,2);

  $("#prev").html(chrome.i18n.getMessage("back"));
  $("#next").html(chrome.i18n.getMessage("next"));
  $("#finish").html(chrome.i18n.getMessage("finish"));

  $("#prev").on("click", function(e){ if(slideIndex > 1) show(--slideIndex) } );
  $("#next").on("click", function(e){ if(slideIndex < 15) show(++slideIndex) } );
  $("#finish").on("click", function(e){ chrome.runtime.sendMessage({"name":"close"}); } );
  
  init();
  show(slideIndex);    
});

function show(n) {
  $("#prev").prop( "disabled", false );
  $("#next").prop( "disabled", false );
  $("#finish").prop( "disabled", true );
  
  var node = document.getElementById(pages[n][0]);
  var section = document.getElementById("section-" + pages[n][1] + "-item");
  console.log(section);
  console.log("section-" +  pages[n][1] + "-item");
  node.classList.add("active");
  section.classList.add("active");  
  document.getElementById(pages[prev][0]).classList.remove("active");
  if(pages[prev][1] != pages[n][1]) document.getElementById("section-" + pages[prev][1] + "-item").classList.remove("active");
  prev = n;

  if(n==15){
    $("#next").prop( "disabled", true );
    $("#finish").prop( "disabled", false );
  }
  if(n==1) $("#prev").prop( "disabled", true );
}

function init(){
  // images
  document.getElementById("guide-page-why-img").src = chrome.extension.getURL("img/start_"+ lang + ".png");
  document.getElementById("guide-page-tooltips-case1-img").src = chrome.extension.getURL("img/google_"+ lang + ".png");
  document.getElementById("guide-page-tooltips-case2-img").src = chrome.extension.getURL("img/secuso_"+ lang + ".png");
  document.getElementById("guide-page-tooltips-case3-img").src = chrome.extension.getURL("img/grey_"+ lang + ".png");
  document.getElementById("guide-page-tooltips-specialcase1-img").src = chrome.extension.getURL("img/phish_"+ lang + ".png");
  document.getElementById("guide-page-tooltips-specialcase2-img").src = chrome.extension.getURL("img/tinyurl_"+ lang + ".png");
  document.getElementById("guide-page-tooltips-specialcase3-img").src = chrome.extension.getURL("img/deref_"+ lang + ".png");
  document.getElementById("guide-page-tooltips-menu-img").src = chrome.extension.getURL("img/menu_"+ lang + ".png");
  document.getElementById("guide-page-settings-delay-img").src = chrome.extension.getURL("img/delay_"+ lang + ".png");
  document.getElementById("guide-page-settings-domains-img").src = chrome.extension.getURL("img/domains_"+ lang + ".png");
  document.getElementById("guide-page-settings-referrer-img").src = chrome.extension.getURL("img/referrer_"+ lang + ".png");

  // side bar
  $("#section-basic-item").html(chrome.i18n.getMessage("guide_basic"));
  $("#section-tooltips-item").html(chrome.i18n.getMessage("guide_tooltips"));
  $("#section-extras-item").html(chrome.i18n.getMessage("guide_extras"));
  $("#section-specialcases-item").html(chrome.i18n.getMessage("guide_specialcases"));
  $("#section-menu-item").html(chrome.i18n.getMessage("guide_menu"));
  $("#section-settings-item").html(chrome.i18n.getMessage("guide_settings"));

  // page 1
  $("#torpedo-guide-basic-welcome-title").html(chrome.i18n.getMessage("guide_welcome_title"));
  $("#torpedo-guide-basic-welcome-intro1").html(chrome.i18n.getMessage("guide_welcome_intro1"));
  $("#torpedo-guide-basic-welcome-intro2").html(chrome.i18n.getMessage("guide_welcome_intro2"));
  $("#torpedo-guide-basic-welcome-footnote").html(chrome.i18n.getMessage("guide_welcome_footnote"));
  
  // page 2
  $("#torpedo-guide-basic-why-title").html(chrome.i18n.getMessage("guide_why_title"));
  $("#torpedo-guide-basic-why-description1").html(chrome.i18n.getMessage("guide_why_description1"));
  $("#torpedo-guide-basic-why-description2").html(chrome.i18n.getMessage("guide_why_description2"));
  $("#torpedo-guide-basic-why-description3").html(chrome.i18n.getMessage("guide_why_description3"));
  $("#torpedo-guide-basic-why-description4").html(chrome.i18n.getMessage("guide_why_description4"));
  $("#torpedo-guide-basic-why-usage-title").html(chrome.i18n.getMessage("guide_why_usage_title"));
  $("#torpedo-guide-basic-why-usage-list").html(chrome.i18n.getMessage("guide_why_usage_list"));
   
  // page 3
  $("#torpedo-guide-tooltips-case1-title").html(chrome.i18n.getMessage("guide_tooltips_case1_title"));
  $("#torpedo-guide-tooltips-case1-description").html(chrome.i18n.getMessage("guide_tooltips_case1_description"));

  // page 4
  $("#torpedo-guide-tooltips-case2-title").html(chrome.i18n.getMessage("guide_tooltips_case2_title"));
  $("#torpedo-guide-tooltips-case2-description1").html(chrome.i18n.getMessage("guide_tooltips_case2_description1"));
  $("#torpedo-guide-tooltips-case2-description2").html(chrome.i18n.getMessage("guide_tooltips_case2_description2"));
  $("#torpedo-guide-tooltips-case2-description3").html(chrome.i18n.getMessage("guide_tooltips_case2_description3"));  
  
  // page 5
  $("#torpedo-guide-tooltips-case3-title").html(chrome.i18n.getMessage("guide_tooltips_case3_title"));
  $("#torpedo-guide-tooltips-case3-description").html(chrome.i18n.getMessage("guide_tooltips_case3_description"));
 
  // page 6
  $("#torpedo-guide-extras-URL-title").html(chrome.i18n.getMessage("guide_extras_URL_title"));
  $("#torpedo-guide-extras-URL-title1").html(chrome.i18n.getMessage("guide_extras_URL_title1"));
  $("#torpedo-guide-extras-URL-description").html(chrome.i18n.getMessage("guide_extras_URL_description"));
  $("#torpedo-guide-extras-URL-tooltipinfo").html(chrome.i18n.getMessage("guide_extras_URL_tooltipinfo"));
  
  // page 7
  $("#torpedo-guide-tooltips-specialcase-title").html(chrome.i18n.getMessage("guide_tooltips_specialcase_title"));
  $("#torpedo-guide-tooltips-specialcase-description").html(chrome.i18n.getMessage("guide_tooltips_specialcase_description"));
  
  // page 8
  $("#torpedo-guide-tooltips-specialcase1-title").html(chrome.i18n.getMessage("guide_tooltips_specialcase1_title"));
  $("#torpedo-guide-tooltips-specialcase1-description").html(chrome.i18n.getMessage("guide_tooltips_specialcase1_description"));
  
  // page 9
  $("#torpedo-guide-tooltips-specialcase2-title").html(chrome.i18n.getMessage("guide_tooltips_specialcase2_title"));
  $("#torpedo-guide-tooltips-specialcase2-description").html(chrome.i18n.getMessage("guide_tooltips_specialcase2_description"));
 
  // page 10
  $("#torpedo-guide-tooltips-specialcase3-title").html(chrome.i18n.getMessage("guide_tooltips_specialcase3_title"));
  $("#torpedo-guide-tooltips-specialcase3-description").html(chrome.i18n.getMessage("guide_tooltips_specialcase3_description"));
 
  // page 11
  $("#torpedo-guide-tooltips-menu-title").html(chrome.i18n.getMessage("guide_tooltips_menu_title"));
  $("#torpedo-guide-tooltips-menu-description1").html(chrome.i18n.getMessage("guide_tooltips_menu_description1"));
  $("#torpedo-guide-tooltips-menu-description2").html(chrome.i18n.getMessage("guide_tooltips_menu_description2"));
  
  // page 12
  $("#torpedo-guide-tooltips-menu1-title").html(chrome.i18n.getMessage("guide_tooltips_menu1_title"));
  $("#torpedo-guide-tooltips-menu1-description1").html(chrome.i18n.getMessage("guide_tooltips_menu1_description1"));
  
  // page 13
  $("#torpedo-guide-settings-delay-title").html(chrome.i18n.getMessage("guide_settings_delay_title"));
  $("#torpedo-guide-settings-delay-description").html(chrome.i18n.getMessage("guide_settings_delay_description"));

  // page 14
  $("#torpedo-guide-settings-domains-title").html(chrome.i18n.getMessage("guide_settings_domains_title"));
  $("#torpedo-guide-settings-domains-description").html(chrome.i18n.getMessage("guide_settings_domains_description"));
  
  // page 15
  $("#torpedo-guide-settings-referrer-title").html(chrome.i18n.getMessage("guide_settings_referrer_title"));
  $("#torpedo-guide-settings-referrer-description").html(chrome.i18n.getMessage("guide_settings_referrer_description"));
}