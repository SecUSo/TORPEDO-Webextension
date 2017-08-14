var torpedo = torpedo || {};
torpedo.target = null;
torpedo.api;
torpedo.uri = "";
torpedo.url = "";
torpedo.domain = "";
torpedo.pathname = "";

var loc;
var target;
var body;
var hide;
var mouseenter;
var outer;
var iframe;

$(document).ready(function(){
  loc = window.location.host;
  target = "mouse";
  body = "body";
  hide = "mouseleave";
  mouseenter = "";
  outer = "";
  iframe = false;

  switch(loc){
    case "mg.mail.yahoo.com":
    outer = "#shellinner";
    mouseenter = ".email-wrapped";
    break;
    case "mail.google.com":
    mouseenter=".adn";
    outer = ".nH"
    break;
    case "outlook.live.com":
    mouseenter = "._n_Y";
    break;
    case "email.t-online.de":
    if(window.location.href.indexOf("showReadmail")>-1){
      try{
        window.frames["messageBody"].contentWindow.document.body;
        chrome.runtime.sendMessage({"name": "ok", "case": loc});
      }catch(e){
        chrome.runtime.sendMessage({"name": "error", "case": loc});
      }
    }
    mouseenter = "#messageBody";
    target = [10,10];
    iframe = true;
    hide = "unfocus";
    break;
    default:
    target = [10,10];
    hide = "unfocus";
    iframe = true;
    mouseenter = "#mail-detail";
    break;
  }
  console.log("iframe ? " + iframe);
  console.log("mouseenter ? " + mouseenter);
  console.log("mouseenter found? " + $(body).find(mouseenter)[0]);
  console.log("outer ? " + outer);
  console.log("outer found ? " + $(body).find(outer)[0]);
  $(body).unbind();
  // if mouseenter not found: try to open tooltip on "outer" frame
  if($(body).find(mouseenter)[0] && !iframe){
    if(outer && $(body).find(outer)[0]){
      // set icon to normal if everything works fine
      chrome.runtime.sendMessage({"name": "ok", "case": loc},function(r){});
      // open tooltip
      $(body).on('mouseenter', mouseenter+' a', function(e){ openTooltip(e) });
    }
    else {
      // set icon to ERROR
      chrome.runtime.sendMessage({"name": "error", "case": loc},function(r){});
    }
  }
  else{
    // set icon to normal if everything works fine
    chrome.runtime.sendMessage({"name": "ok", "case": loc},function(r){});
    // open tooltip
    // mail panel in iframe
    if(!iframe){
      $(body).on('mouseenter', mouseenter+" a", function(e){ openTooltip(e) });
    }
    // normal mail panel
    else{
      $(body).on("mouseenter", mouseenter, function(e){
        $(this.contentWindow.document.body).on("mouseenter", "a", function(a){openTooltip(a)})
      });
    }
  }
});

function openTooltip(e){
  torpedo.target = e.currentTarget;
  if (torpedo.target.href != "#" && !torpedo.target.href.startsWith("javascript:void(0)") && !torpedo.target.href.startsWith("mailto:") && torpedo.target.id != 'torpedoURL') {
    try{
      const url = new URL(torpedo.target.href);
      setNewUrl(url);
      $(torpedo.target).qtip({
        id: "torpedo",
        overwrite: true,
        suppress: true,
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
          event: hide,
          delay: 600
        },
        position: {
          at: 'center bottom',
          my: 'top left',
          target: target,
          viewport: $(window),
          adjust: {
            mouse: false,
            method: 'flipinvert flipinvert',
            scroll: false
          }
        },
        style: {
          classes: 'torpedoTooltip',
          def: false
        },
        events: {
          render: function(event, api) {
            torpedo.api = api;
            torpedo.tooltip = api.elements.content;
            updateTooltip();
          }
        }
      });
    }catch(err){console.log(err);chrome.runtime.sendMessage({"name": "error", "case": loc},function(r){});}
  }
}
