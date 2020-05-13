torpedo.time = 0;
/**
* countdown function for the temporal deactivation of URLs
*/
function countdown(startTime) {
  if (torpedo.target.classList.contains("torpedoTimerFinished")) startTime = 0;
  if (torpedo.target.classList.contains("torpedoTimerShowing")) startTime = torpedo.time;

  var time = startTime
  torpedo.time = time;
  var t = torpedo.tooltip;

  $(t.find("#torpedoTimer")[0]).show();
  /**
  * assert time to tooltip text
  */
  function showTime() {
    try {
      t.find("#torpedoTimer")[0].remove();
      $('<p id="torpedoTimer">' + chrome.i18n.getMessage("verbleibendeZeit", "" + time) + '</p>').appendTo(t);
    } catch (e) { }
  }

  // deactivate link
  $(torpedo.target).addClass("torpedoTimerShowing");
  $(torpedo.target).unbind("click");
  $(torpedo.target).bind("click", function (event) { event.preventDefault(); });
  try {
    $(t.find("#torpedoURL")[0]).unbind("click");
    $(t.find("#torpedoURL")[0]).bind("click", function (event) { event.preventDefault(); });
  } catch (e) { }

  showTime();
  if (time > 0) time--;
  torpedo.time = time;
  var timerInterval = setInterval(function timer() {
    showTime();
    if (time == 0) {
      clearInterval(timerInterval);
      $(torpedo.target).addClass("torpedoTimerFinished");
      // reactivate link
      $(torpedo.target).unbind("click");
      $(torpedo.target).bind("click", function (event) { processClick(); });
      try {
        $(t.find("#torpedoURL")[0]).unbind("click");
        $(t.find("#torpedoURL")[0]).bind("click", function (event) {
          event.preventDefault();
          chrome.storage.sync.get(null, function (r) {
            if (r.privacyModeActivated) {
              chrome.runtime.sendMessage({ name: "open", url: torpedo.oldUrl });
            } else {
              chrome.runtime.sendMessage({ name: "open", url: torpedo.url });
            }
          });
          processClick();
          return false;
        });
      } catch (e) { }
    }
    else {
      --time;
    }
  }, 1000);
}
