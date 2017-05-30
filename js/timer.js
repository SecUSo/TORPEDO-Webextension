/**
* countdown function for the temporal deactivation of URLs
*/
function countdown(startTime) {
    var time = startTime;
    var t = torpedo.tooltip;
    $(t.find("#torpedoLinkDelay")[0]).html(chrome.i18n.getMessage("linkDelay"));
    /**
    * assert time to tooltip text
    */
    function showTime() {
      try{
        t.find("#torpedoTimer")[0].remove();
      }catch(e){}
      $('<p id="torpedoTimer">'+chrome.i18n.getMessage("waitingTime", ""+time)+'</p>').appendTo(t);
    }

    // deactivate link
    $(torpedo.target).unbind("click");
    $(torpedo.target).bind("click", function(event){event.preventDefault();});
    try{
      $(t.find("#torpedoURL")[0]).unbind("click");
      $(t.find("#torpedoURL")[0]).bind("click", function(event){event.preventDefault();});
    }catch(e){}

    showTime();
    --time;
    var timerInterval = setInterval(function timer() {
      showTime();
      if(time == 0){
        clearInterval(timerInterval);

        // reactivate link
        $(torpedo.target).unbind("click");
        $(torpedo.target).bind("click",function(event){processClick();});
        try{
          $(t.find("#torpedoURL")[0]).unbind("click");
          $(t.find("#torpedoURL")[0]).bind("click",function(event){processClick();});
        }catch(e){}
      }
      else{
        --time;
      }
    }, 1000);
}
