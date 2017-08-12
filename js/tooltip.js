var torpedo = torpedo || {};
torpedo.tooltip;

/**
* fill tooltip with html structure
*/
function tooltipText(){
  var text = "<div id='torpedoWarning' class='torpedoBlock'> \
                <img id='torpedoWarningImage' src='"+chrome.extension.getURL("img/warning.png")+"'> \
                <p id='torpedoWarningText'></p>\
              </div>\
              <a href='"+torpedo.url+"' id='torpedoURL''></a> \
              <p id='torpedoSecurityStatus' class='torpedoBlock'></p> \
              <div id='torpedoAdvice' class='torpedoBlock'> \
                <img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'> \
                <p id='torpedoAdviceText'></p> \
              </div> \
              <div id='torpedoInfo' class='torpedoBlock'>  \
                <img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'> \
                <p id='torpedoInfoText'></p> \
              </div>\
              <p id='torpedoMoreInfo' class='torpedoBlock'></p> \
              <button id='torpedoMoreInfoButton' type='button' class='torpedoBlock'></button> \
              <button id='torpedoRedirectButton' type='button' class='torpedoBlock''></button> \
              <p id='torpedoLinkDelay' class='torpedoBlock'></p> \
              <p id='torpedoTimer' class='torpedoBlock'></p>";
  return text;
};

/**
* fill the basic tooltip structure with corresponding texts
*/
function updateTooltip(){
  var t = torpedo.tooltip;
  $(t.find("#torpedoURL")[0]).html(torpedo.url.replace(torpedo.domain, '<span id="torpedoDomain">' + torpedo.domain + '</span>'));
  $(t.find("#torpedoWarningImage")[0]).hide();
  $(t.find("#torpedoMoreInfo")[0]).hide();
  $(t.find("#torpedoMoreInfoButton")[0]).hide();
  $(t.find("#torpedoRedirectButton")[0]).hide();
  $(t.find("#torpedoInfoText")[0]).click(function(event){showInfo(event)});
  $(t.find("#torpedoMoreInfoButton")[0]).click(function(event){openInfoImage(event)});
  $(t.find("#torpedoRedirectButton")[0]).click(function(event){resolveRedirect(event)});

  chrome.runtime.sendMessage('show', function(r){
    getSecurityStatus(r);
    switch(torpedo.status){
      case "trusted":
        $(".torpedoTooltip").addClass("torpedoTrusted");
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("lowRiskDomain"));
        $(t.find("#torpedoInfoText")[0]).html(chrome.i18n.getMessage("lowRiskInfo"));
        $(t.find("#torpedoAdvice")[0]).hide();
        $(t.find("#torpedoMoreInfo")[0]).html(chrome.i18n.getMessage("moreInfoLowRisk"));
        if(r.trustedTimerActivated=="true") countdown(r.timer);
        break;
      case "userdefined":
        $(".torpedoTooltip").addClass("torpedoUserDefined");
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("userDefinedDomain"));
        $(t.find("#torpedoInfoText")[0]).html(chrome.i18n.getMessage("moreInfo"));
        $(t.find("#torpedoAdvice")[0]).hide();
        $(t.find("#torpedoMoreInfo")[0]).html(chrome.i18n.getMessage("moreInfoUserDefined"));
        if(r.userTimerActivated=="true") countdown(r.timer);
        break;
      case "unknown":
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("unknownDomain"));
        $(t.find("#torpedoInfoText")[0]).html(chrome.i18n.getMessage("moreInfo"));
        $(t.find("#torpedoAdviceText")[0]).html(chrome.i18n.getMessage("unknownAdvice"));
        countdown(r.timer);
        break;
      case "redirect":
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("redirectDomain"));
        $(t.find("#torpedoInfoText")[0]).html(chrome.i18n.getMessage("specialCaseInfo"));
        $(t.find("#torpedoAdviceText")[0]).html(chrome.i18n.getMessage("redirectAdvice"));
        $(t.find("#torpedoMoreInfo")[0]).html(chrome.i18n.getMessage("moreInfoRedirect"));
        $(t.find("#torpedoRedirectButton")[0]).html(chrome.i18n.getMessage("deduceURL"));
        $(t.find("#torpedoRedirectButton")[0]).show();
        countdown(r.timer);
        break;
      case "encrypted":
        $(t.find("#torpedoWarningText")[0]).show();
        $(t.find("#torpedoWarningText")[0]).html(chrome.i18n.getMessage("encryptedDomain"));
        $(t.find("#torpedoInfoText")[0]).html(chrome.i18n.getMessage("specialCaseInfo"));
        $(t.find("#torpedoMoreInfo")[0]).html(chrome.i18n.getMessage("moreInfoEncrypted"));
        countdown(r.timer);
        resolveReferrer(r.referrerPart1,r.referrerPart2);
        break;
      case "phish":
        $(".torpedoTooltip").addClass("torpedoPhish");
        $(t.find("#torpedoWarningImage")[0]).show();
        $(t.find("#torpedoWarningText")[0]).show();
        $(t.find("#torpedoWarningText")[0]).html(chrome.i18n.getMessage("phishWarning"));
        $(t.find("#torpedoAdviceText")[0]).html(chrome.i18n.getMessage("redirectAdvice"));
        $(t.find("#torpedoInfoText")[0]).html(chrome.i18n.getMessage("specialCaseInfo"));
        $(t.find("#torpedoMoreInfo")[0]).html(chrome.i18n.getMessage("moreInfoPhish"));
        countdown(r.timer+2);
      }
    });
};

/**
* open info panel after a click on the "more info" field
*/
function showInfo(event){
  var t = torpedo.tooltip;
  if(torpedo.status != "unknown"){
    $(t.find("#torpedoMoreInfo")[0]).toggle();
  }
  else openInfoImage(event);
  if(torpedo.status == "redirect" || torpedo.status == "encrypted" || torpedo.status == "phish"){
    $(t.find("#torpedoMoreInfoButton")[0]).html(chrome.i18n.getMessage("checkURL"));
    $(t.find("#torpedoMoreInfoButton")[0]).toggle();
  }
};

/**
* opens an image containing information on URL checking
*/
function openInfoImage(event){
  var t = torpedo.tooltip;
  $(t.find("#torpedoInfoImage")[0]).qtip({
    overwrite: false,
    content:  {
      text: "<img id='torpedoPopupImage' src='"+chrome.extension.getURL(chrome.i18n.getMessage("infoImage"))+"'> ",
      button: true
    },
    show: {
      event: event.type,
      ready: true
    },
    hide: {
        event: 'unfocus'
    },
    position: {
      at: 'center',
      my: 'center',
      target: jQuery(window)
    },
    style:{
      classes: "torpedoPopup"
    }
  });
};

/**
* get domain out of hostname
*/
function extractDomain(url){
  var split = url.split(".");
  if(split.length > 2) url = split[split.length-2] + "." + split[split.length-1];
  return url;
};
