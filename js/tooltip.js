var torpedo = torpedo || {};
torpedo.domain = "";

/**
*
*/
function extractDomain(url){
  var split = url.split(".");
  if(split.length > 2) url = split[split.length-2] + "." + split[split.length-1];
  return url;
}
/**
* fill tooltip with basic structure
*/
function tooltipText(url){
  href = url.href;
  torpedo.domain = extractDomain(url.hostname);
  var text = "<p id='torpedoWarningText' hidden> \
                <img id='torpedoWarningImage' src='"+chrome.extension.getURL("img/warning.png")+"'> \
              </p>\
              <a href='"+href+"' id='torpedoURL''>" + href.replace(torpedo.domain, '<span id="torpedoDomain">' + torpedo.domain + '</span>') + "</a> \
              <p id='torpedoSecurityStatus'></p> \
              <p id='torpedoAdviceText'> \
                <img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'> \
              </p> \
              <p id='torpedoInfoText'>  \
                <img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'> \
              </p> \
              <p id='torpedoLinkDelay'></p> \
              <p id='torpedoTimer'></p>";
  return text;
};

/**
* fill the basic tooltip structure with corresponding texts
*/
function fillTooltip(tooltip){
  chrome.extension.sendRequest('show', function(r){
    getSecurityStatus(torpedo.domain,r.userDefinedDomains)
    switch(torpedo.status){
      case "trusted":
        $(".torpedoTooltip").addClass("torpedoTrusted");
        $(tooltip.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("lowRiskDomain"));
        $(tooltip.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("lowRiskInfo"));
        $(tooltip.find("#torpedoAdviceText")[0]).hide();
        break;
      case "userdefined":
        $(".torpedoTooltip").addClass("torpedoUserDefined");
        $(tooltip.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("userDefinedDomain"));
        $(tooltip.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("moreInfo"));
        $(tooltip.find("#torpedoAdviceText")[0]).hide();
        break;
      case "unknown":
        $(tooltip.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("unknownDomain"));
        $(tooltip.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("moreInfo"));
        $(tooltip.find("#torpedoAdviceText")[0]).html("<img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'>"+chrome.i18n.getMessage("unknownAdvice"));
        countdown(r.timer,tooltip);
        break;
      case "redirect":
        $(tooltip.find("#torpedoSecurityStatus")[0]).html(chrome.i18n.getMessage("redirectDomain"));
        $(tooltip.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("specialCaseInfo"));
        $(tooltip.find("#torpedoAdviceText")[0]).html("<img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'>"+chrome.i18n.getMessage("redirectAdvice"));
        countdown(r.timer,tooltip);
        break;
      case "encrypted":
        $(tooltip.find("#torpedoWarningText")[0]).show();
        $(tooltip.find("#torpedoWarningText")[0]).html(chrome.i18n.getMessage("encryptedDomain"));
        $(tooltip.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("specialCaseInfo"));
        countdown(r.timer,tooltip);
        // domain = decryptedDomain
        // fillTooltip(tooltip,aElement);
        // TODO: switch case to other security statuses
        break;
      case "phish":
        $(".torpedoTooltip").addClass("torpedoPhish");
        $(tooltip.find("#torpedoWarningText")[0]).show();
        $(tooltip.find("#torpedoWarningText")[0]).html("<img id='torpedoWarningImage' src='"+chrome.extension.getURL("img/warning.png")+"'>"+chrome.i18n.getMessage("phishWarning"));
        $(tooltip.find("#torpedoAdviceText")[0]).html("<img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'>"+chrome.i18n.getMessage("redirectAdvice"));
        $(tooltip.find("#torpedoInfoText")[0]).html("<img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'>"+chrome.i18n.getMessage("specialCaseInfo"));
        countdown(r.timer+2,tooltip);
      }
    });
};
