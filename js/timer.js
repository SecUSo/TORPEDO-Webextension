/**
 * Prevents the default action of an event.
 */
function preventDefaultHandler(event) {
    event.preventDefault();
    event.stopPropagation();
}

/**
 * Prevents click events on a target element.
 */
function preventClickEvent(eventTarget, eventTypes) {
    eventTypes.forEach(eventType => {
       eventTarget.addEventListener(eventType, preventDefaultHandler, { capture: true });
    });
}

/**
 * Re-enables click events on a target element.
 */
function reactivateLink(eventTarget, eventTypes) {
    eventTypes.forEach(eventType => {
        eventTarget.removeEventListener(eventType, preventDefaultHandler, { capture: true });
    });

    eventTarget.addEventListener("click", () => TooltipManager.processClick());
}

/**
 * Re-enables the tooltip URL link.
 */
function reactivateTooltipURL(tooltipURL) {
    try {
        const clone = tooltipURL.cloneNode(true);
        tooltipURL.parentNode.replaceChild(clone, tooltipURL);

        tooltipURL.addEventListener("click", async (event) => {
            event.preventDefault()
            const storage = await browser.storage.sync.get();
            const urlToOpen = storage.privacyModeActivated ? torpedo.oldUrl : torpedo.url;
            browser.runtime.sendMessage({ name: "open", url: urlToOpen });
            TooltipManager.processClick();
        });

    } catch (e) {
        console.log(e)
    }
}

/**
 * Checks if the timer is activated for a given security status.
 */
function isTimerActivated(storage, securityStatus) {
    switch (securityStatus) {
        case "T1": return storage.trustedTimerActivated;
        case "T2": return storage.userTimerActivated;
        default: return true;
    }
}

/**
 * Starts a countdown timer to delay link activation.
 */
function countdown(time, state, clickLinkEventTypes) {
    if (torpedo.target.classList.contains("torpedoTimerFinished")) time = 0;

    const timerEl = torpedo.tooltip.querySelector("#torpedoTimer");
    timerEl.style.display = "block";

    const updateTimerText = (remainingTime) => {
        timerEl.textContent = browser.i18n.getMessage("verbleibendeZeit", "" + remainingTime);
    }

    updateTimerText(time);
    torpedo.target.classList.add("torpedoTimerShowing");

    if (time > 0) time--;

    torpedo.timerInterval = setInterval(async () => {
        updateTimerText(time);
        if (time === 0) {
            clearInterval(torpedo.timerInterval);
            if (!await isRedirect(torpedo.domain) && state !== "T4" && state !== "T4a") {
                torpedo.target.classList.add("torpedoTimerFinished");
            }

            reactivateLink(torpedo.target, clickLinkEventTypes);
            reactivateTooltipURL(torpedo.tooltip.querySelector("#torpedoURL"));
        } else {
            time--;
        }
    }, 1000);
}
