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
  chrome.storage.sync.get(null,function(r) {
      getSecurityStatus(r);
      var state = torpedo.state;
      console.log(state);

      var t = torpedo.tooltip;
      var url = torpedo.url;
      var pathname = torpedo.pathname;
      if(pathname.length > 100){
        var replace = pathname.substring(0,100) + "...";
        url = url.replace(pathname, replace);
      }
      $(t.find("#torpedoURL")[0]).html(url.replace(torpedo.domain, '<span id="torpedoDomain">' + torpedo.domain + '</span>'));
      $(t.find("#torpedoWarningImage")[0]).hide();
      $(t.find("#torpedoMoreInfo")[0]).hide();
      $(t.find("#torpedoMoreInfoButton")[0]).hide();
      $(t.find("#torpedoRedirectButton")[0]).hide();
      $(t.find("#torpedoInfoText")[0]).click( function(event){ $(t.find("#torpedoMoreInfo")[0]).toggle() } );
      $(t.find("#torpedoMoreInfoButton")[0]).click( function(event){ openInfoImage(event) } );
      $(t.find("#torpedoRedirectButton")[0]).click( function(event){ resolveRedirect(event) } );

      // get texts from textfile
      var button = chrome.i18n.getMessage('ButtonWeiterleitung');
      var ueberschrift = chrome.i18n.getMessage(state+"Ueberschrift");
      var erklaerung = chrome.i18n.getMessage(state+"Erklaerung");
      var mehrInfo = chrome.i18n.getMessage("MehrInfo");
      var infotext = chrome.i18n.getMessage(state+"Infotext").replace("<URL>", url);
      var infoCheck = chrome.i18n.getMessage("Info");
      var gluehbirneText = chrome.i18n.getMessage(state+"GluehbirneText");
      var linkDeaktivierung = chrome.i18n.getMessage(state+"LinkDeaktivierung");

      // assign texts
      $("#torpedoWarningText").html(ueberschrift);
      $("#torpedoSecurityStatus").html(erklaerung);
      $("#torpedoAdviceText").html(gluehbirneText);
      $("#torpedoInfoText").html(mehrInfo);
      $("#torpedoMoreInfo").html(infotext);
      $("#torpedoRedirectButton").html(button);
      $("#torpedoLinkDelay").html(linkDeaktivierung);
      $("#torpedoMoreInfoButton").html(infoCheck);

      console.log(ueberschrift);
      console.log(erklaerung);
      console.log(gluehbirneText);
      console.log(mehrInfo);
      console.log(infotext);
      console.log(linkDeaktivierung);
      console.log(infoCheck);

      // hide light bulb if no text is there
      if(gluehbirneText) $("#torpedoAdvice").show();
      else $("#torpedoAdvice").hide();

      switch(torpedo.state){
        case "T3":
        case "T3TH":
        case "T3PH":
        case "T3PH":
          $(".torpedoTooltip").addClass("torpedoUserDefined");
          if(r.userTimerActivated=="true") countdown(r.timer);
          break;
        case "T2":
        case "T2TH":
        case "T2PH":
        case "T2PHTH":
          $(".torpedoTooltip").addClass("torpedoTrusted");
          if(r.trustedTimerActivated=="true") countdown(r.timer);
          break;
        case "ShortURL":
          $(t.find("#torpedoRedirectButton")[0]).show();
          countdown(r.timer);
          break;
        case "T1TH":
          $(t.find("#torpedoRedirectButton")[0]).show();
          countdown(r.timer);
          break;
        case "URLnachErmittelnButton2":
          $(t.find("#torpedoRedirectButton")[0]).show();
          countdown(r.timer);
          break;
        case "T1":
        case "T1PH":
          $(".torpedoTooltip").addClass("torpedoUnknown");
          countdown(r.timer);
          break;
        case "T1TH":
        case "T1PHTH":
        case "WarnungPhish":
          $(".torpedoTooltip").addClass("torpedoPhish");
          $(t.find("#torpedoWarningImage")[0]).show();
          $(t.find("#torpedoWarningText")[0]).show();
          countdown(r.timer+2);
          break;
        }
    });
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
  var psl = window.publicSuffixList.getDomain(url);
  // psl empty -> url is already a valid domain
  return psl != ""? psl : url;
};

/**
* set given url as new global torpedo url
*/
function setNewUrl(uri){
  torpedo.uri = uri;
  torpedo.url = uri.href;
  torpedo.domain = extractDomain(uri.hostname);
  var index = torpedo.url.indexOf(torpedo.domain);
  torpedo.pathname = torpedo.url.substring(index+torpedo.domain.length, torpedo.url.length);
}


/**
* user has clicked on a link via the tooltip
*/
function processClick(){
  if(torpedo.status == "unknown"){
    chrome.storage.sync.get(null, function(r) {
      var domains = r.onceClickedDomains;
      // was domain clicked before ?
      if(domains.indexOf(torpedo.domain) > -1){
          // remove domain from once clicked domains
          var index = domains.indexOf(torpedo.domain);
          domains.splice(index, 1);
          chrome.storage.sync.set({ 'onceClickedDomains': domains });
          // add domain to user defined domains
          domains = r.userDefinedDomains;
          domains[domains.length] = torpedo.domain;
          chrome.storage.sync.set({ 'userDefinedDomains': domains });
      }
      // add domain to once clicked domains
      else {
        domains[domains.length] = torpedo.domain;
        chrome.storage.sync.set({ 'onceClickedDomains': domains });
      }
    });
  }
};
