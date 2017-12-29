var torpedo = torpedo || {};
torpedo.tooltip;

/**
* fill tooltip with html structure
*/
function tooltipText(){
  var text = "<div id='torpedoWarning'> \
                <img id='torpedoWarningImage' src='"+chrome.extension.getURL("img/warning.png")+"'> \
                <p id='torpedoWarningText'></p>\
              </div>\
              <div><a href='"+torpedo.url+"' id='torpedoURL''></a></div> \
              <div style='display:none' id='torpedoContextMenu'>\
                  <ul>\
                      <li id='torpedoMarkTrusted'></li>\
                      <li id='torpedoGoogle'></li>\
                      <li id='torpedoOpenSettings'></li>\
                      <li id='torpedoOpenTutorial'></li>\
                  </ul>\
              </div>\
              <div><p id='torpedoSecurityStatus'></p></div> \
              <div id='torpedoAdvice'> \
                <img id='torpedoAdviceImage' src='"+chrome.extension.getURL("img/advice.png")+"'> \
                <p id='torpedoAdviceText'></p> \
              </div> \
              <div id='torpedoInfo'>  \
                <img id='torpedoInfoImage' src='"+chrome.extension.getURL("img/info.png")+"'> \
                <p id='torpedoInfoText'></p> \
              </div>\
              <div id='torpedoInfoDiv'><p id='torpedoMoreInfo'></p></div> \
              <div><button id='torpedoMoreInfoButton' type='button'></button></div> \
              <div><button id='torpedoRedirectButton' type='button''></button></div> \
              <div><p id='torpedoLinkDelay'></p></div> \
              <p id='torpedoTimer'></p>";
  return text;
};

function initTooltip(){
  // context menu
  var t = torpedo.tooltip;
  $(t).contextmenu(function(event) {
    $(t.find("#torpedoContextMenu")[0]).toggle();
    $(t.find("#torpedoContextMenu")[0]).css({position: "absolute"});
    event.preventDefault();
  });
  $(t).on("click", "div:not(.torpedoContextMenu)", function(e){
    if(!$(t.find("#torpedoContextMenu")[0]).is(':hidden')){
      $(t.find("#torpedoContextMenu")[0]).toggle();
    }
  });

  $(t.find("#torpedoMarkTrusted")[0]).click( function(event){
    chrome.storage.sync.get(null,function(r) {
      var arr = r.userDefinedDomains;
      arr.push(torpedo.domain);
      chrome.storage.sync.set({ 'userDefinedDomains': arr }, function() {
         updateTooltip();
      });
    });
  });
  $(t.find("#torpedoGoogle")[0]).click( function(event){ chrome.runtime.sendMessage({name: "google", url: torpedo.domain}); } );
  $(t.find("#torpedoOpenSettings")[0]).click( function(event){ chrome.runtime.sendMessage({name: "settings"}); } );
  $(t.find("#torpedoOpenTutorial")[0]).click( function(event){ chrome.runtime.sendMessage({name: "tutorial"}); } );

  $(t.find("#torpedoInfoText")[0]).click( function(event){ $(t.find("#torpedoInfoDiv")[0]).toggle() } );
  $(t.find("#torpedoMoreInfoButton")[0]).click( function(event){ openInfoImage(event) } );
  $(t.find("#torpedoRedirectButton")[0]).click( function(event){ resolveRedirect(event); torpedo.api.get("hide.event","onfocus") } );
}

/**
* fill the basic tooltip structure with corresponding texts
*/
function updateTooltip(){
  chrome.storage.sync.get(null,function(r) {
      getSecurityStatus(r);
      var state = torpedo.state;

      var t = torpedo.tooltip;
      var url = torpedo.url;
      var pathname = torpedo.pathname;
      if(pathname.length > 100){
        var replace = pathname.substring(0,100) + "...";
        url = url.replace(pathname, replace);
      }
      $(t.find("#torpedoURL")[0]).html(url.replace(torpedo.domain, '<span id="torpedoDomain">' + torpedo.domain + '</span>'));
      
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
      $(t.find("#torpedoWarningText")[0]).html(ueberschrift);
      $(t.find("#torpedoSecurityStatus")[0]).html(erklaerung);
      $(t.find("#torpedoAdviceText")[0]).html(gluehbirneText);
      $(t.find("#torpedoInfoText")[0]).html(mehrInfo);
      $(t.find("#torpedoMoreInfo")[0]).html(infotext);
      $(t.find("#torpedoRedirectButton")[0]).html(button);
      $(t.find("#torpedoLinkDelay")[0]).html(linkDeaktivierung);
      $(t.find("#torpedoMoreInfoButton")[0]).html(infoCheck);

      // hide certain elements
      $(t.find("#torpedoWarningImage")[0]).hide();
      $(t.find("#torpedoTimer")[0]).hide();
      $(t.find("#torpedoInfoDiv")[0]).hide();
      $(t.find("#torpedoLinkDelay")[0]).hide();
      $(t.find("#torpedoAdvice")[0]).hide();
      $(t.find("#torpedoMoreInfoButton")[0]).hide();
      $(t.find("#torpedoRedirectButton")[0]).hide();

      if(r.referrerPart1.indexOf(torpedo.domain)  > -1 || r.userDefinedDomains.indexOf(torpedo.domain)  > -1 || r.trustedDomains.indexOf(torpedo.domain)  > -1 || r.redirectDomains.indexOf(torpedo.domain)  > -1 ){
        $(t.find("#torpedoMarkTrusted")[0]).hide();
      }
      else $(t.find("#torpedoMarkTrusted")[0]).show();

      if(isRedirect(torpedo.domain)){
        $(torpedo.tooltip.find("#torpedoRedirectButton")[0]).show();
      }
      // hide light bulb if no text is there
      if(gluehbirneText) $(t.find("#torpedoAdvice")[0]).show();
      if(linkDeaktivierung) $(t.find("#torpedoLinkDelay")[0]).show();
      else{
        $(t.find("#torpedoInfo")[0]).css("margin-bottom","0");
        $(t.find("#torpedoInfo")[0]).css("padding-bottom","0");
      }
      $(t.find("#torpedoMarkTrusted")[0]).html(chrome.i18n.getMessage('markAsTrusted'));
      $(t.find("#torpedoGoogle")[0]).html(chrome.i18n.getMessage('googleCheck'));
      $(t.find("#torpedoOpenSettings")[0]).html(chrome.i18n.getMessage('openSettings'));
      $(t.find("#torpedoOpenTutorial")[0]).html(chrome.i18n.getMessage('openTutorial'));
      $(".torpedoTooltip").removeClass("torpedoUserDefined torpedoTrusted torpedoPhish");

      switch(torpedo.state){
        case "T3":
        case "T3Stern":
        case "T3TH":
        case "T3PH":
        case "T3PHTH":
          $(".torpedoTooltip").addClass("torpedoUserDefined");
          if(r.userTimerActivated=="true") countdown(r.timer);
          break;
        case "T2":
        case "T2Stern":
        case "T2TH":
        case "T2PH":
        case "T2PHTH":
          $(".torpedoTooltip").addClass("torpedoTrusted");
          if(r.trustedTimerActivated=="true") countdown(r.timer);
          break;
        case "ShortURL":
          countdown(r.timer);
          break;
        case "T1TH":
          $(".torpedoTooltip").addClass("torpedoPhish");
          countdown(r.timer);
          break;
        case "T1":
        case "T1Stern":
        case "T1PH":
          $(t.find("#torpedoMarkTrusted")[0]).show();
          countdown(r.timer);
          break;
        case "T1TH":
        case "T1PHTH":
        case "WarnungPhish":
          $(".torpedoTooltip").addClass("torpedoPhish");
          $(t.find("#torpedoMarkTrusted")[0]).show();
          $(t.find("#torpedoWarningImage")[0]).show();
          $(t.find("#torpedoWarningText")[0]).show();
          countdown(r.timer+2);
          break;
        default:
          countdown(r.timer);
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
  var psl = torpedo.publicSuffixList.getDomain(url);
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
