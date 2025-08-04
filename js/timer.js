torpedo.timerInterval = null;

function preventClickEvent(eventTarget, eventTypes) {
  eventTypes.forEach(function (eventType) {
    $(eventTarget).unbind(eventType);
  });

  eventTypes.forEach(function (eventType) {
    $(eventTarget).on(eventType, function (event) {
      event.preventDefault();
      return false;
    });
  });
}

function reactivateLink(eventTarget, eventTypes) {
  eventTypes.forEach(function (eventType) {
    $(eventTarget).unbind(eventType);
  });

  $(torpedo.target).bind("click", function (event) {
    processClick();
  });
}

function reactivateTooltipURL(tooltipURL) {
  try {
    const clone = tooltipURL.cloneNode(true);
    tooltipURL.parentNode.replaceChild(clone, tooltipURL);

    tooltipURL.addEventListener("click", async function (event) {
      event.preventDefault()
      const storage = await browser.storage.sync.get();
      const urlToOpen = storage.privacyModeActivated ? torpedo.oldUrl : torpedo.url;
      browser.runtime.sendMessage({name: "open", url: urlToOpen});
      processClick();
      return false;
    })

  } catch (e) {
    console.log(e)
  }
}

function isTimerActivated(storage, securityStatus) {
  switch (securityStatus) {
    case "T1":
      return storage.trustedTimerActivated;
    case "T2":
      return storage.userTimerActivated;
    default:
      return true;
  }
}

/**
 * countdown function for the temporal deactivation of URLs
 */

function countdown(time, state, clickLinkEventTypes) {
  if (torpedo.target.classList.contains("torpedoTimerFinished")) time = 0;

  const tooltip = torpedo.tooltip;

  const timerEl = tooltip.querySelector("#torpedoTimer");
  timerEl.style.display = "block";

  /**
   * assert time to tooltip text
   */
  function showTime() {
    try {
      const t = tooltip.querySelector("#torpedoTimer");
      t.textContent = browser.i18n.getMessage("verbleibendeZeit", "" + time);
    } catch (e) {}
  }

  torpedo.target.classList.add("torpedoTimerShowing");
  

  const onWebsite = new URL(window.location.href);
  if (onWebsite.hostname === "owa.kit.edu") {
    document.querySelectorAll("div._rp_U4.ms-font-weight-regular.ms-font-color-neutralDark.rpHighlightAllClass.rpHighlightBodyClass").
    forEach(el => {
      const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
    })
    // document.removeEventListener('click', getEventListeners(document).click[0].listener)
    /* 
      once script from owa can be used to remove eventlistener properly - insert here
    */
  }

  showTime();
  if (time > 0) time--;

  const timerInterval = setInterval(function timer() {
    showTime();
    if (time === 0) {
      clearInterval(timerInterval);
      if (!isRedirect(torpedo.domain) && state !== "T4" && state !== "T4a") {
        torpedo.target.classList.add("torpedoTimerFinished");
      }

      reactivateLink(torpedo.target, clickLinkEventTypes);
      reactivateTooltipURL(tooltip.querySelector("#torpedoURL"));
    } else {
      --time;
    }
  }, 1000);

  torpedo.timerInterval = timerInterval;
}
