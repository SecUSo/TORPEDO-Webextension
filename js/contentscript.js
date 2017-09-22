var torpedo = torpedo || {};
torpedo.target = null;
torpedo.api;
torpedo.uri = "";
torpedo.url = "";
torpedo.domain = "";
torpedo.pathname = "";

$(document).ready(function(){
  chrome.runtime.sendMessage({name:"TLD"}, function(r){
    window.publicSuffixList.parse(r, punycode.toASCII);
  });
  chrome.runtime.sendMessage('show', function(r){
      if(r.firstRun){
        chrome.runtime.sendMessage({name:"firstRun",value:"false"});
      }
    });

  loc = window.location.host;
  var mouseenter = "";
  var outer = "";
  var iframe = "";

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
    iframe = "mailreadview";
    break;
    default:
    iframe = "mailbody";
    break;
  }
  $("body").unbind();

  // if mouseenter not found: try to open tooltip on "outer" frame
  if($("body").find(mouseenter)[0] && iframe==""){
    if(outer && $("body").find(outer)[0]){
      // set icon to normal if everything works fine
      chrome.runtime.sendMessage({"name": "ok"});
      // open tooltip
      $("body").on('mouseenter', mouseenter+' a', function(e){ openTooltip(e) });
    }
    else {
      // set icon to ERROR
      chrome.runtime.sendMessage({"name": "error"});
    }
  }
  else{
    // open tooltip in normal mail panel
    if(iframe==""){
      // set icon to normal if everything works fine
      chrome.runtime.sendMessage({"name": "ok"});
      $("body").on('mouseenter', mouseenter+" a", function(e){ openTooltip(e) });
    }
    // open tooltip in iframe mail panel
    else{
      if(window.location.href.indexOf(iframe)>-1){
        chrome.runtime.sendMessage({"name": "ok"});
      } else{
        chrome.runtime.sendMessage({"name": "error"});
      }
      $("body").on("mouseenter", "a", function(e){
        var location = e.view.location.href;
        if(location.indexOf(iframe) > -1) {openTooltip(e);}
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
              console.log("render");
              updateTooltip();
            }
          }
        });
    }catch(err){console.log(err); chrome.runtime.sendMessage({"name": "error"},function(r){});}
  }
}
