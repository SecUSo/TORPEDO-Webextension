security = "unknown";

jQuery(function($){
    $('body').on('mouseenter', 'a', function(e) {
        var o = this;
        if ( o.href != '#' && o.href != 'javascript:void(0)' && o.id != 'torpedoURL') {
            chrome.extension.sendRequest('show', function(r) {
                $(o).qtip({
                    overwrite: false,
                    content:  {
                      text: tooltipText(o.href)
                  },
                    show: {
                        event: e.type,
                        ready: true,
                        solo: true
                    },
                    hide: {
                        fixed: true,
                        delay: 1500
                    },
                    position: {
                        at: 'center bottom',
                        my: 'top left',
                        target: 'mouse',
                        viewport: $(window),
                        adjust: {
                          mouse: false
                        }
                    },
                    style: { classes: 'torpedoTooltip' },
                    events: {
                      render: function(event, api) {
                        //var iframe = $('iframe', this)[0];
                        //var tooltip = $(this);
                        countdown(3,api.elements.content,o);
                        console.log(api.elements.content.html());

                      },
                      hide: function(event, api) {
                      }
                    }
                }, e);
            })
        }
    }).on('mouseleave', 'a', function(e){
        $(this).qtip('destroy');
    })
});

/**
* get domain out of the URI
* URI is the original URL cut off after the domain
*/
function extractDomain(domain){
  var split = domain.split(".");
  if(split.length > 2) domain = split[split.length-2]+"."+split[split.length-1];
  return domain;
};

/**
* fill tooltip with text
*/
function tooltipText(href){
  var uri = $.url.parse(href);
  var domain = extractDomain(uri.host);
  var top = "";
  var url = '<a href="'+uri.source+'" id="torpedoURL">' + uri.source.replace(uri.host, '<span id="torpedoDomain">' + domain + '</span>') + '</a>';
  var securityStatus = "";
  var warning = "";
  var advice = "";
  var wait = "<p id='torpedoLinkDelay'>" + chrome.i18n.getMessage("linkDelay") + '</p>';
  var timer = "<p id='torpedoTimer'>" + chrome.i18n.getMessage("waitingTime", "3") + '</p>';
  // TODO: user preferences for timer

  switch(getSecurityStatus(url)){
    case "lowrisk":
      securityStatus = "<p id='torpedoSecurityStatus'>" + chrome.i18n.getMessage("unknownDomain") + '</p>';
      wait = ""; timer = "";
      // TODO: connect waitingTime with user settings
      break;
    case "userdefined":
      securityStatus = "<p id='torpedoSecurityStatus'>" + chrome.i18n.getMessage("userDefinedDomain") + '</p>';
      wait = ""; timer = "";
      // TODO: connect waitingTime with user settings
      break;
    case "unknown":
      securityStatus = "<p id='torpedoSecurityStatus'>" + chrome.i18n.getMessage("lowRiskDomain") + '</p>';
      break;
    case "redirect":
      securityStatus = "<p id='torpedoSecurityStatus'>" + chrome.i18n.getMessage("redirectDomain") + '</p>';
      break;
    case "encrypted":
      top = "<p id='torpedoTop'>" + chrome.i18n.getMessage("encryptedDomain") + '</p>';
      // TODO: switch case to other security statuses
      break;
    case "phish":
      warning = '<p id="warning"'+chrome.i18n.getMessage("phishWarning") + '</p>';
      // TODO: 2 more secs for phish case timer
  }
  return ""+top+url+securityStatus+warning+advice+wait+timer;
};

function getSecurityStatus(domain){
  security = "unknown";
  return "unknown";
}
