var torpedo = torpedo || {};
torpedo.target = null;

jQuery(function($){
    $('body').on('mouseenter', 'a', function(e) {
        torpedo.target = this;
        if (this.href != "#" && this.href != "javascript:void(0);" && this.id != 'torpedoURL') {
          try{
            const url = new URL(torpedo.target.href);
            $(torpedo.target).qtip({
              overwrite: false,
              content:  {
                text: tooltipText(url)
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
                  fillTooltip(api.elements.content);
                },
                hide: function(event, api) {
                }
              }
          }, e);
        }catch(e){}
      }
    }).on('mouseleave', 'a', function(e){
        try{
          $(this).qtip('destroy');
        }catch(e){}
    })
});
