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
      $('<p id="torpedoTimer">'+chrome.i18n.getMessage("waitingTime", ""+time)+'</p>').appendTo(tooltip);
    }

    // TODO: user preferences for timer, link deactivation

    showTime();
    --time;
    var timerInterval = setInterval(function timer() {
      showTime();
      if(time == 0){
        clearInterval(timerInterval);

        // reactivate link
        aElement.removeAttribute("onclick");
        try{
          tooltip.find("#torpedoURL")[0].removeAttribute("onclick");
        }catch(e){}
      }
      else{
        --time;

        // deactivate link
        aElement.setAttribute("onclick", "return false;");
        try{
          tooltip.find("#torpedoURL")[0].setAttribute("onclick", "return false;");
        }catch(e){}
      }
      console.log(tooltip.html());
    }, 1000);
}
