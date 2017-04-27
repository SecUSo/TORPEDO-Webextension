jQuery(function($){
    $('body').on('mouseenter', 'a', function(e) {
        var o = this;
        if ( o.href != '#' ) {
            chrome.extension.sendRequest('show', function(r) {
                var uri = $.url.parse(o.href),
                    position,
                    text = uri.source.replace(uri.host, uri.host.replace(extractDomain(uri.host),"")+'<span style="color:#0033cc">' + extractDomain(uri.host) + '</span>');
                    position = {
                        at: 'center bottom',
                        my: 'top left',
                        target: 'mouse',
                        viewport: $(window),
                        adjust: {
                          mouse: false
                        }
                    }
                // Is the target a new window?
                if ( $(o).attr('target') == '_blank' ) text = '<i class="fa fa-external-link-square" style="padding-right: 5px;"></i>' + text;
                // Show the qtip
                $(o).qtip({
                    overwrite: false,
                    content: {
                        text: text
                    },
                    show: {
                        event: e.type,
                        ready: true,
                        solo: true,
                        effect: function() {
                          $(this).slideDown(100);
                        }
                    },
                    hide: {
                        fixed: true,
                        delay: 1000,
                        effect: function() {
                          $(this).slideUp(300);
                        }
                    },
                    position: position,
                    style: { classes: 'torpedoTooltip' }
                }, e);
            })
        }
    }).on('mouseleave', 'a', function(e){
        $(this).qtip('destroy');
    })
});

function extractDomain(domain){
  var split = domain.split(".");
  if(split.length > 2) domain = split[split.length-2]+"."+split[split.length-1];
  return domain;
};
