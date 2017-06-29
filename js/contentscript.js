var torpedo = torpedo || {};
torpedo.target = null;
torpedo.api;

jQuery(function($){
  $(document).ready(function(){
    var location = window.location.host;

    var target = "event";
    var body = "body";
    var hide = "mouseleave";
    var mouseenter = "a"
    console.log(location);

    if(location=="mg.mail.yahoo.com"){
      mouseenter = ".email-wrapped a";
    }
    else if(location=="mail.google.com"){
      mouseenter=".adn a";
    }
    else if(location=="outlook.live.com"){
      mouseenter="._n_Y a";
    }
    else if(location=="email.t-online.de"){
      body = window.frames["messageBody"].contentWindow.document.body;
      target = [10,10];
      hide = false;
    }
    else if(location=="navigator.web.de" || location=="navigator.gmx.net"){
        body = document.getElementById("app-contents-wrapper").getElementsByTagName("pos-app-stack")[0];
        var d = body.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
        console.log(d);
        $(body).on("click", function(){console.log("click")});
    }

    $(body).on('mouseenter', mouseenter, function(e) {
        torpedo.target = this;
        if (this.href != "#" && !this.href.startsWith("javascript:void(0)") && !this.href.startsWith("mailto:") && this.id != 'torpedoURL') {
          try{
            const url = new URL(torpedo.target.href);
            console.log(this);
            $(this).qtip({
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
                  console.log(event.originalEvent.button);
                  if(event.originalEvent.button == 2) {
                    event.preventDefault();
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
          }, e);
        }catch(e){}
      }
    });
  });
});
