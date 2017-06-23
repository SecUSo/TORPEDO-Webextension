var torpedo = torpedo || {};
torpedo.target = null;
torpedo.api;

jQuery(function($){
  $(document).ready(function(){
    var location = window.location.host;

    // location: mail.google.com, mg.mail.yahoo.com,
    var target = "event";
    var body = "body";

    // location: email.t-online.de
    try {
      body = window.frames["messageBody"].contentWindow.document.body;
      target = [10,10];
    } catch(e){}

    // location: navigator.web.de
    try{
      var i = window.frames["thirdPartyFrame_mail"];
      console.log(i);
      console.log(i.attributes);
      console.log(i.attributes[0].ownerDocument.body);
      var b = i.attributes[0].ownerDocument.body;
      var d = b.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
      var e = d.firstChild.nextSibling.nextSibling;
      console.log(d);
      console.log(e);
      d.onclick = function(e){console.log("kflöajksldöfjlaödklaöfjeklö")};
      e.onclick = function(e){console.log("eeeeeeeeeeeeeeee")};
      d.addEventListener("click", function(){console.log("aaaaaaaaaa")});
      body = document.getElementById("app-contents-wrapper");
      body = body.getElementsByTagName("pos-app-stack")[0];
      console.log($(body).html());

      $(body).on("click", function(){console.log("click")});
      //body = window.frames["thirdPartyFrame_mail"].contentWindow.document.body;
      //id : panel-mail-display
    }catch(e){console.log(e);console.log("!!!!!!!!!!!!!!!!!!!!")}

    $(body).on('mouseenter', 'a', function(e) {
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
                  //if(event.originalEvent.button == 2) {
                  //  try { ///event.preventDefault();
                    //  console.log(event.originalEvent.button) } catch(e) {}
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
});
