var torpedo = torpedo || {};
torpedo.target = null;
torpedo.api;
document.body.onclick = function() {console.log(this)};
console.log(document.getElementById("thirdPartyFrame_mail"));

jQuery(function($){
  $('body').click(function(e){console.log(this)});
    $('body').on('mouseenter', 'a', function(e) {
        torpedo.target = this;
        if (this.href != "#" && !this.href.startsWith("javascript:void(0)") && !this.href.startsWith("mailto:") && this.id != 'torpedoURL') {
          try{
            const url = new URL(torpedo.target.href);
            $(this).qtip({
              id: "torpedo",
              overwrite: true,
              suppress: true,
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
                event: "mouseleave",
                delay: 200
              },
              position: {
                at: 'center bottom',
                my: 'top left',
                target: 'event',
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
                  //if(event.originalEvent.button == 2) {
                    try { ///event.preventDefault();
                      console.log(event.originalEvent.button) } catch(e) {}
                  //}
                },
                render: function(event, api) {
                  torpedo.api = api;
                  torpedo.tooltip = api.elements.content;
                  fillTooltip();
                }
                //hide: function(event, api) {
                //}
              }
          }, e);
        }catch(e){}
      }
    });
});
