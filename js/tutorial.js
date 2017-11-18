var slideIndex = 1;
var lang = "en";
$(document).ready(function() {
  lang = chrome.i18n.getUILanguage().substr(0,2);

  $("#prev").html(chrome.i18n.getMessage("back"));
  $("#next").html(chrome.i18n.getMessage("next"));
  $("#finish").html(chrome.i18n.getMessage("finish"));

  $("#prev").on("click", function(e){ if(slideIndex > 1) show(--slideIndex) } );
  $("#next").on("click", function(e){ if(slideIndex < 13) show(++slideIndex) } );
  $("#finish").on("click", function(e){ chrome.runtime.sendMessage({"name":"close"}); } );
  
  show(slideIndex);
});

function show(n) {
  $("#prev").prop( "disabled", false );
  $("#next").prop( "disabled", false );
  $("#finish").prop( "disabled", true );
  document.getElementsByTagName("img")[0].src = "img/tutorial"+n+"_" + lang +".png";
  if(n==13){
    $("#next").prop( "disabled", true );
    $("#finish").prop( "disabled", false );
  }
  if(n==1) $("#prev").prop( "disabled", true );

}
