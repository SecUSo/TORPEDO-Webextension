var slideIndex = 1;
var lang = "en";
$(document).ready(function() {
  lang = chrome.i18n.getUILanguage().substr(0,2);

  $("#prev").html(chrome.i18n.getMessage("back"));
  $("#next").html(chrome.i18n.getMessage("next"));
  $("#finish").html(chrome.i18n.getMessage("finish"));

  $("#prev").on("click", function(e){ if(slideIndex > 1) show(--slideIndex) } );
  $("#next").on("click", function(e){ if(slideIndex < 13) show(++slideIndex) } );
  $("#finish").on("click", function(e){  window.close();  } );
  
  // workaround for firefox
  if(window.origin.indexOf("moz-extension://") > -1) $("#finish").hide();
  show(slideIndex);
});

function show(n) {
  $("#prev").prop( "disabled", false );
  $("#next").prop( "disabled", false );
  document.getElementsByTagName("img")[0].src = "img/tutorial"+n+"_" + lang +".png";
  if(n==13) $("#next").prop( "disabled", true );
  if(n==1) $("#prev").prop( "disabled", true );

}
