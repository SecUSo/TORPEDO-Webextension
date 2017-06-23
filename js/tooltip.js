var torpedo = torpedo || {};
torpedo.domain = "";
torpedo.uri = "";
torpedo.url = "";
torpedo.tooltip;
/**
* fill tooltip with html structure
*/
function tooltipText(url){
  torpedo.uri = url;
  torpedo.url = url.href;
  torpedo.domain = extractDomain(url.hostname);
  var text = "<p id='torpedoWarningText' hidden> \
                <img id='torpedoWarningImage' src='"+chrome.extension.getURL("img/warning.png")+"'> \
              </p>\
              <a href='"+torpedo.url+"' id='torpedoURL''>" + torpedo.url.replace(torpedo.domain, '<span id="torpedoDomain">' + torpedo.domain + '</span>') + "</a> \
              <p id='torpedoSecurityStatus'></p> \
              <p id='torpedoAdviceText'> \
                <img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'> \
              </p> \
              <p id='torpedoInfoText'>  \
                <img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'> \
              </p>\
              <p id='torpedoInfo' hidden></p> \
              <button id='torpedoInfoButton' type='button' hidden></button> \
              <button id='torpedoRedirectButton' type='button' hidden></button> \
              <p id='torpedoLinkDelay'></p> \
              <p id='torpedoTimer'></p>";
  return text;
};

/**
* fill the basic tooltip structure with corresponding texts
*/
function fillTooltip(){
  var t = torpedo.tooltip;
  $(t.find("#torpedoInfo")[0]).hide();
  $(t.find("#torpedoInfoButton")[0]).hide();
  $(t.find("#torpedoInfoText")[0]).click(function(event){showInfo(event)});
  $(t.find("#torpedoInfoButton")[0]).click(function(event){openInfoImage(event)});
  $(t.find("#torpedoRedirectButton")[0]).click(function(event){resolveRedirect(event)});
  chrome.extension.sendRequest('show', function(r){
    getSecurityStatus(torpedo.domain, r, false);
    switch(torpedo.status){
      case "trusted":
        $(".torpedoTooltip").addClass("torpedoTrusted");
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("lowRiskDomain"));
        $(t.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("lowRiskInfo"));
        $(t.find("#torpedoAdviceText")[0]).hide();
        $(t.find("#torpedoInfo")[0]).html(chrome.i18n.getMessage("moreInfoLowRisk"));
        if(r.trustedTimerActivated=="true") countdown(r.timer);
        break;
      case "userdefined":
        $(".torpedoTooltip").addClass("torpedoUserDefined");
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("userDefinedDomain"));
        $(t.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("moreInfo"));
        $(t.find("#torpedoAdviceText")[0]).hide();
        $(t.find("#torpedoInfo")[0]).html(chrome.i18n.getMessage("moreInfoUserDefined"));
        if(r.userTimerActivated=="true") countdown(r.timer);
        break;
      case "unknown":
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("unknownDomain"));
        $(t.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("moreInfo"));
        $(t.find("#torpedoAdviceText")[0]).html("<img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'>"+chrome.i18n.getMessage("unknownAdvice"));
        countdown(r.timer);
        break;
      case "redirect":
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("redirectDomain"));
        $(t.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("specialCaseInfo"));
        $(t.find("#torpedoAdviceText")[0]).html("<img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'>"+chrome.i18n.getMessage("redirectAdvice"));
        $(t.find("#torpedoInfo")[0]).html(chrome.i18n.getMessage("moreInfoRedirect"));
        $(t.find("#torpedoRedirectButton")[0]).html(chrome.i18n.getMessage("deduceURL"));
        $(t.find("#torpedoRedirectButton")[0]).show();
        countdown(r.timer);
        break;
      case "encrypted":
        $(t.find("#torpedoWarningText")[0]).show();
        $(t.find("#torpedoWarningText")[0]).html(chrome.i18n.getMessage("encryptedDomain"));
        $(t.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("specialCaseInfo"));
        $(t.find("#torpedoInfo")[0]).html(chrome.i18n.getMessage("moreInfoEncrypted"));
        countdown(r.timer);
        updateTooltip(resolveReferrer(r.referrerPart1,r.referrerPart2));
        break;
      case "phish":
        $(".torpedoTooltip").addClass("torpedoPhish");
        $(t.find("#torpedoWarningText")[0]).show();
        $(t.find("#torpedoWarningText")[0]).html("<img id='torpedoWarningImage' src='"+chrome.extension.getURL("img/warning.png")+"'>"+chrome.i18n.getMessage("phishWarning"));
        $(t.find("#torpedoAdviceText")[0]).html("<img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'>"+chrome.i18n.getMessage("redirectAdvice"));
        $(t.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("specialCaseInfo"));
        $(t.find("#torpedoInfo")[0]).html(chrome.i18n.getMessage("moreInfoPhish"));
        countdown(r.timer+2);
      }
    });
};

/**
*   update tooltip after resolving a redirect
*/
function updateTooltip(url){
  var t = torpedo.tooltip;
  $(t.find("#torpedoURL")[0]).html(url.href.replace(extractDomain(url.hostname), '<span id="torpedoDomain">' + extractDomain(url.hostname) + '</span>') );
  $(t.find("#torpedoRedirectButton")[0]).hide();
  chrome.extension.sendRequest('show', function(r){
    getSecurityStatus(url.href,r, true);
    switch(torpedo.status){
      case "trusted":
        $(".torpedoTooltip").addClass("torpedoTrusted");
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("lowRiskDomain"));
        $(t.find("#torpedoAdviceText")[0]).hide();
        break;
      case "userdefined":
        $(".torpedoTooltip").addClass("torpedoUserDefined");
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("userDefinedDomain"));
        $(t.find("#torpedoAdviceText")[0]).hide();
        break;
      case "unknown":
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("unknownDomain"));
        $(t.find("#torpedoAdviceText")[0]).html("<img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'>"+chrome.i18n.getMessage("unknownAdvice"));
        break;
      case "redirect":
        $(t.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("redirectDomain"));
        $(t.find("#torpedoAdviceText")[0]).html("<img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'>"+chrome.i18n.getMessage("redirectAdvice"));
        $(t.find("#torpedoRedirectButton")[0]).html(chrome.i18n.getMessage("deduceURL"));
        $(t.find("#torpedoRedirectButton")[0]).show();
        break;
      case "encrypted":
        $(t.find("#torpedoWarningText")[0]).show();
        $(t.find("#torpedoWarningText")[0]).html(chrome.i18n.getMessage("encryptedDomain"));
        break;
      }
    });
};
/**
* open info panel after a click on the "more info" field
*/
function showInfo(event){
  var t = torpedo.tooltip;
  if(torpedo.status != "unknown"){
    $(t.find("#torpedoInfo")[0]).toggle();
  }
  else openInfoImage(event);
  if(torpedo.status == "redirect" || torpedo.status == "encrypted" || torpedo.status == "phish"){
    $(t.find("#torpedoInfoButton")[0]).html(chrome.i18n.getMessage("checkURL"));
    $(t.find("#torpedoInfoButton")[0]).toggle();
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
      text: "<img id='torpedoPopupImage' src='"+chrome.extension.getURL(chrome.i18n.getMessage("infoImage"))+"'> "
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
