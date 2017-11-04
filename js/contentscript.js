var torpedo = torpedo || {};
torpedo.target = null;
torpedo.api = null;
torpedo.uri = "";
torpedo.url = "";
torpedo.domain = "";
torpedo.pathname = "";
torpedo.event;
torpedo.iframeLocation;

$(document).ready(function(){
  chrome.runtime.sendMessage({name:"TLD"}, function(r){
      window.publicSuffixList.parse(r, punycode.toASCII);
  });
  loc = window.location.host;
  var mouseenter = "";
  var outer = "";
  var iframe = "";
  torpedo.iframeLocation = "";

  switch( loc ){
    case "mg.mail.yahoo.com":
      outer = "#shellinner";
      mouseenter = ".email-wrapped";
      break;
    case "mail.google.com":
      mouseenter=".adn";
      outer = ".nH"
      break;
    case "outlook.live.com":
      mouseenter = ".conductorContent";
      break;
    case "mail.aol.com":
      mouseenter="#displayMessage";
      outer = "#appContent"
      break;
    case "email.t-online.de":
      iframe = "mailreadview";
      break;
    default:
      iframe = "mailbody";
      break;
  }
  $("body").unbind();

  if(iframe == ""){
     $("body").on('mouseenter', mouseenter+" a", function(e){ openTooltip(e) });
   }
  else {
    $("body").on("mouseenter", "a", function(e){
      var location = e.view.location.href;
      torpedo.iframeLocation = location;
      if(location.indexOf(iframe) > -1) {openTooltip(e);}
    });
  }

  if(iframe==""){
    if($("body").find(mouseenter)[0]){
      chrome.runtime.sendMessage({"name": "ok", "location":loc});
    }
    else{// set icon to ERROR
      chrome.runtime.sendMessage({"name": "error", "location":loc});
    }
  }
  if(iframe != ""){
    // open tooltip in iframe mail panel
    if(window.location.href.indexOf(iframe)>-1){
      chrome.runtime.sendMessage({"name": "ok", "location":loc});
    } else{
      chrome.runtime.sendMessage({"name": "error", "location":loc});
    }
  }
});

function openTooltip(e){
  torpedo.target = e.currentTarget;
  torpedo.state = "unknown";
  if (torpedo.target.href != "#" && !torpedo.target.href.startsWith("javascript:void(0)") && !torpedo.target.href.startsWith("mailto:") && torpedo.target.id != 'torpedoURL') {
    chrome.storage.sync.get(null,function(r) {
      try{
        const url = new URL(torpedo.target.href);
        /*const iframeDomain = new URL(torpedo.iframeLocation);
        console.log(iframeDomain.hostname);
        console.log(url.hostname);
        if(r.referrerSites.indexOf(iframeDomain.hostname) > -1 && r.referrerSites.indexOf(url.hostname) > -1){
          // TODO
        }*/
        setNewUrl(url);
        $(torpedo.target).qtip({
          id: "torpedo",
          content:  {
            text: tooltipText(url),
            button: true
          },
          show: {
            event: e.type,
            ready: true,
            solo: true
          },
          hide: {
            fixed: true,
            event: "mouseleave",
            delay: 600
          },
          position: {
            at: 'center bottom',
            my: 'top left',
            viewport: $(window),
            adjust: {
              mouse: false,
              method: 'flipinvert flipinvert',
              scroll: false
            }
          },
          style: {
            tip:false,
            classes: 'torpedoTooltip',
            def: false
          },
          events: {
            render: function(event, api) {
              torpedo.api = api;
              torpedo.tooltip = api.elements.content;
              chrome.runtime.sendMessage({"name": "ok"});
              initTooltip();
              updateTooltip();
            }
          }
        });
      }catch(err){console.log(err); chrome.runtime.sendMessage({"name": "error"});}
    });
  }
}

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
   if (msg.name == 'reload') {
      updateTooltip();
   }
});
