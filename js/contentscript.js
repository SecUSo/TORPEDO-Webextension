var torpedo = torpedo || {};
torpedo.target = null;
torpedo.api;
var loc = "";
var target = "event";
var body = "body";
var hide = "mouseleave";
var mouseenter = "";
var outer = "";

function processPage(){
  jQuery(function($){
    $(document).ready(function(){
      loc = window.location.host;
      target = "event";
      body = "body";
      hide = "mouseleave";
      mouseenter = "";
      outer = "";

      switch(loc){
        case "mg.mail.yahoo.com":
        outer = "#shellinner ";
        mouseenter = ".email-wrapped ";
        break;
        case "mail.google.com":
        mouseenter=".adn ";
        outer = ".BltHke"
        break;
        case "outlook.live.com":
        mouseenter = "._n_Y ";
        break;
        case "email.t-online.de":
          mouseenter = "a";
          if(window.location.href.indexOf("showReadmail")>-1){
            try{
              body = window.frames["messageBody"].contentWindow.document.body;
            }catch(e){
              chrome.extension.sendRequest({"name": "error", "case": loc},function(r){});
            }
          }
        target = [10,10];
        hide = false;
        break;
      }
      /*if(location=="navigator.web.de" || location=="navigator.gmx.net"){
      body = document.getElementById("app-contents-wrapper").getElementsByTagName("pos-app-stack")[0];
      var d = body.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
      console.log(d);
      $(body).on("click", function(){console.log("click")});
      }*/

      $(body).unbind();
      // set icon to error if element is not found
      if($(body).find(mouseenter)[0] == undefined){
        chrome.extension.sendRequest({"name": "error", "case": loc},function(r){});
        if(outer && $(body).find(outer)[0]){
          // set icon to normal if everything works fine
          chrome.extension.sendRequest({"name": "ok", "case": loc},function(r){});
          // open tooltip
          $(body).on('mouseenter', outer+"a", function(e){openTooltip(e)});
        }
      }
      else{
        // set icon to normal if everything works fine
        chrome.extension.sendRequest({"name": "ok", "case": loc},function(r){});
        // open tooltip
        mouseenter = mouseenter == "a"? "a" : mouseenter+"a";
        $(body).on('mouseenter', mouseenter, function(e){openTooltip(e)});
      }
    });
  });
}

function openTooltip(e){
  torpedo.target = e.currentTarget;
  if (torpedo.target.href != "#" && !torpedo.target.href.startsWith("javascript:void(0)") && !torpedo.target.href.startsWith("mailto:") && torpedo.target.id != 'torpedoURL') {
    try{
      const url = new URL(torpedo.target.href);
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
          delay: 200
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
        style: { classes: 'torpedoTooltip' },
        events: {
          show: function(event, api){
            // TODO: right click
            if(event.originalEvent.button) {
              console.log(event.originalEvent.button);
            }
          },
          render: function(event, api) {
            torpedo.api = api;
            torpedo.tooltip = api.elements.content;
            fillTooltip();
          }
          //hide: function(event, api) {
          //}
        }
      });
    }catch(err){console.log(err)}
  }
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {processPage();});
