$(document).ready(function () {
  chrome.runtime.sendMessage({ name: "TLD" }, function (r) {
    torpedo.publicSuffixList.parse(r, punycode.toASCII);
  });

  torpedo.location = window.location.host;
  var mouseenter = "";
  var iframe = "";
  torpedo.opened = false;
  torpedo.progUrl = false;
  torpedo.hasTooltip = false;

  switch (torpedo.location) {
    case "mail.yahoo.com":
      mouseenter = ['div[data-test-id="message-view"]'];
      break;
    case "mail.google.com":
      mouseenter = [".adn"];
      break;
    case "owa.kit.edu":
      mouseenter = ['div[role="list"]', " div.isMessageBodyInPopout"];
      break;
    // not yet active due to issues with click handling
    case "outlook.live.com":
      mouseenter = ['div[role="main"]'];
      break;
    case "mail.aol.com":
      mouseenter = ["#displayMessage"];
      break;
    case "email.t-online.de":
      iframe = ["mailreadview"];
      break;
    default:
      iframe = ["mailbody"];
      break;
  }

  $("body").unbind();

  if (iframe == "") {
    $("body").on(
      "mouseenter",
      mouseenter.map((selector) => selector + " a").join(),
      function (e) {
        openTooltip(e, "a");
      }
    );
    $("body").on(
      "mouseenter",
      mouseenter.map((selector) => selector + " form").join(),
      function (e) {
        openTooltip(e, "form");
        torpedo.progUrl = true;
      }
    );
    // adding corresponding icon for working or error
    if ($("body").find(mouseenter.join())[0]) {
      chrome.runtime.sendMessage({ name: "ok", location: torpedo.location });
    } else {
      // set icon to ERROR
      chrome.runtime.sendMessage({ name: "error", location: torpedo.location });
    }
  } else {
    $("body").on("mouseenter", "a", function (e) {
      var location = e.view.location.href;
      if (location.indexOf(iframe) > -1) {
        openTooltip(e, "a");
      }
    });
    // open tooltip in iframe mail panel
    if (window.location.href.indexOf(iframe) > -1) {
      chrome.runtime.sendMessage({ name: "ok", location: torpedo.location });
    } else {
      chrome.runtime.sendMessage({ name: "error", location: torpedo.location });
    }
  }
});

function openTooltip(e, type) {
  torpedo.target = e.currentTarget;
  torpedo.progUrl = false;
  torpedo.hasTooltip = false;

  const eventTypes = ["click", "contextmenu", "mouseup", "mousedown"];
  preventClickEvent(torpedo.target, eventTypes);

  if (type == "a") {
    if (
      torpedo.target.href.indexOf("mailto:") > -1 ||
      torpedo.opened ||
      $(torpedo.target).hasClass("qtip-close")
    )
      return;
    if (torpedo.target.href == "") {
      try {
        $(torpedo.target).attr("href", e.relatedTarget.href);
      } catch (err) { }
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

      // checks for programmed tooltip (if there, then assigned to tooltipURL)
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

      $(torpedo.target).on("mouseenter", function (event) {
        if (torpedo.timerInterval != null) {
          clearInterval(torpedo.timerInterval);
        }
      });

      const instance = tippy(torpedo.target, {
        allowHTML: true,
        content: tooltipText(),
        interactive: true,

        trigger: "mouseenter",
        appendTo: document.body,
        delay: [20, 200],

        placement: "bottom-start",
        arrow: false,
        theme: "torpedoTooltip",

        onShow: (inst) => {
          tippy.hideAll({ exclude: inst });

          torpedo.api = inst;
          torpedo.tooltip = inst.popper.querySelector(".tippy-content");

          const urlEl = torpedo.tooltip.querySelector("#torpedoURL");
          preventClickEvent(urlEl, ["click"]);

          torpedo.tooltip.addEventListener("mouseenter", () => { torpedo.opened = true; });
          torpedo.tooltip.addEventListener("mouseleave", () => { torpedo.opened = false; });

          browser.runtime.sendMessage({ name: "ok" });
          initTooltip(torpedo.target);
          updateTooltip(torpedo.target);
        },
        onHide: () => {
          if (torpedo.timerInterval) {
            clearInterval(torpedo.timerInterval);
          }
        }
      });

      instance.show();
    } catch (err) {
      console.log(torpedo.target.href);
      console.log(err);
      // set the icon to "ERROR" because TORPEDO doesn't work on this page
      chrome.runtime.sendMessage({ name: "error" });
    }
  });
}
