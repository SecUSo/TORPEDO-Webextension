/**
* countdown function for the temporal deactivation of URLs
*/
function countdown(startTime, tooltip, aElement) {
    var time = startTime;
    /**
    * assert time to tooltip text
    */
    function showTime() {
      try{
        tooltip.find("#torpedoTimer")[0].remove();
      }catch(e){}
      console.log(tooltip.html());
      $('<p id="torpedoTimer">'+chrome.i18n.getMessage("waitingTime", ""+time)+'</p>').appendTo(tooltip);
      console.log(tooltip.html());
    }

    // TODO: user preferences for timer, link deactivation

    // deactivate link
    $(aElement).unbind("click");
    $(aElement).bind("click", function(event){event.preventDefault();});
    try{
      $(tooltip.find("#torpedoURL")[0]).unbind("click");
      $(tooltip.find("#torpedoURL")[0]).bind("click", function(event){event.preventDefault();});
    }catch(e){}

    showTime();
    --time;
    var timerInterval = setInterval(function timer() {
      showTime();
      if(time == 0){
        clearInterval(timerInterval);

        // reactivate link
        $(aElement).unbind("click");
        try{
          $(tooltip.find("#torpedoURL")[0]).unbind("click");
        }catch(e){}
      }
      else{
        --time;
      }
    }, 1000);
}
