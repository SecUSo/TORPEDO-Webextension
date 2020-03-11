var torpedo = torpedo || {};
torpedo.target = null;
torpedo.api = null;
torpedo.uri = "";
torpedo.url = "";
torpedo.domain = "";
torpedo.pathname = "";
torpedo.publicsuffixlist = "";
torpedo.event;
torpedo.location;
torpedo.opened = false;
torpedo.progUrl = false;
torpedo.hasTooltip = false;

$(document).ready(function () {
  chrome.runtime.sendMessage({ "name": "TLD" }, function (r) {
    torpedo.publicSuffixList.parse(r, punycode.toASCII);
  });
  torpedo.location = window.location.host;
  var mouseenter = "";
  var iframe = "";
  torpedo.opened = false;
  torpedo.progUrl = false;
  torpedo.hasTooltip = false;

  switch (torpedo.location) {
    case "mg.mail.yahoo.com":
    case "mail.yahoo.com":
      mouseenter = ".thread-body";
      break;
    case "mail.google.com":
      mouseenter = ".adn";
      break;
    case "outlook.live.com":
      mouseenter = ".conductorContent";
      break;
    case "mail.aol.com":
      mouseenter = "#displayMessage";
      break;
    case "email.t-online.de":
      iframe = "mailreadview";
      break;
    default:
      iframe = "mailbody";
      break;
  }
  $("body").unbind();

  if (iframe == "") {


    $("body").on('mouseenter', mouseenter + " a", function (e) { openTooltip(e, "a") });
    $("body").on('mouseenter', mouseenter + " form", function (e) {
      openTooltip(e, "form");
      torpedo.progUrl = true;
    });
    if ($("body").find(mouseenter)[0]) {
      chrome.runtime.sendMessage({ "name": "ok", "location": torpedo.location });
    }
    else {// set icon to ERROR
      chrome.runtime.sendMessage({ "name": "error", "location": torpedo.location });
    }
  }
  else {
    $("body").on("mouseenter", "a", function (e) {
      var location = e.view.location.href;
      if (location.indexOf(iframe) > -1) { openTooltip(e, "a"); }
    });
    // open tooltip in iframe mail panel
    if (window.location.href.indexOf(iframe) > -1) {
      chrome.runtime.sendMessage({ "name": "ok", "location": torpedo.location });
    } else {
      chrome.runtime.sendMessage({ "name": "error", "location": torpedo.location });
    }
  }
});

function openTooltip(e, type) {
  torpedo.target = e.currentTarget;
  torpedo.progUrl = false;
  torpedo.hasTooltip = false;

  if (type == "a") {
    if (torpedo.target.href.indexOf("mailto:") > -1 || torpedo.opened || $(torpedo.target).hasClass("qtip-close")) return;
    if (torpedo.target.href == "") {
      try {
        $(torpedo.target).attr("href", e.relatedTarget.href);
      } catch (e) { }
    }
  }
  torpedo.state = "unknown";
  chrome.storage.sync.get(null, function (r) {
    try {
      // try to construct a URL, this will fail if it's a non-valid URL
      var url;
      if (type == "form") {
        url = new URL(torpedo.target.action);
      } else {
        url = new URL(torpedo.target.href);
      }

      setNewUrl(url);

      var tooltipURL = hasTooltip(torpedo.target);
 
      if (tooltipURL != "<HAS_NO_TOOLTIP>") {
        torpedo.hasTooltip = isTooltipMismatch(tooltipURL, torpedo.url);
      }



      // if we are on a site that automatically redirects over its own servers
      if (r.referrerSites.indexOf(torpedo.location) > -1) {
        // resolve the url first and set as targets's href attribute
        resolveReferrer(r);
        torpedo.target.href = torpedo.url;
      }

      // open the qTip
      $(torpedo.target).qtip({
        id: "torpedo",
        content: {
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
          viewport: true,
          target: 'mouse',
          adjust: {
            y: 10,
            mouse: false,
            method: 'flip flip'
          }
        },
        style: {
          tip: false,
          classes: 'torpedoTooltip'
        },
        events: {
          render: function (event, api) {
            torpedo.api = api;
            torpedo.tooltip = api.elements.content;

            $(torpedo.tooltip).on("mouseover", function () { torpedo.opened = true; });
            $(torpedo.tooltip).on("mouseleave", function () { torpedo.opened = false; });

            // set the icon to "OK", because TORPEDO works on this page
            chrome.runtime.sendMessage({ "name": "ok" });

            // init the tooltip elements and texts
            initTooltip();
            updateTooltip();
          }
        }
      });
    } catch (err) {
      console.log(torpedo.target.href);
      console.log(err);
      // set the icon to "ERROR" because TORPEDO doesn't work on this page
      chrome.runtime.sendMessage({ "name": "error" });
    }
  });
}
