document.addEventListener("click", (e) => {
  switch($(e.target).attr('id')){
    case "torpedoPage":
      chrome.tabs.create({ url: "https://www.secuso.informatik.tu-darmstadt.de/de/secuso/forschung/ergebnisse/torpedo/" });
      break;
    case "options":
      chrome.runtime.openOptionsPage();
      break;
    case "error":
      if(e.target.classList == "error"){
        chrome.extension.getBackgroundPage().sendEmail();
      }
      break;
  }
});

function init() {
  document.getElementById("torpedoPage").childNodes[0].nodeValue = chrome.i18n.getMessage("extensionName");
  document.getElementById("options").childNodes[0].nodeValue = chrome.i18n.getMessage("options");
  var loc = chrome.extension.getBackgroundPage().getStatus();
  if(loc.works){
    document.getElementById("error").setAttribute("class","working");
    document.getElementById("error").childNodes[0].nodeValue = chrome.i18n.getMessage("OK");
  }
  else{
    document.getElementById("error").setAttribute("class","error");
    document.getElementById("error").childNodes[0].nodeValue = chrome.i18n.getMessage("error");
  }
}

document.addEventListener('DOMContentLoaded', init);
