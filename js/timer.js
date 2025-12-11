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
    clearInterval(torpedo.timerInterval);

    if (torpedo.target.classList.contains("torpedoTimerFinished")) time = 0;

    const timerEl = torpedo.tooltip.querySelector(".torpedo-timer");
    timerEl.style.display = "block";

    const updateTimerText = (remainingTime) => {
        timerEl.textContent = browser.i18n.getMessage("verbleibendeZeit", "" + remainingTime);
    }

    updateTimerText(time);
    if (time > 0) time--;

    torpedo.timerInterval = setInterval(async () => {
        updateTimerText(time);
        if (time === 0) {
            clearInterval(torpedo.timerInterval);
            if (!await isRedirect(torpedo.domain) && state !== "T4" && state !== "T4a") {
                torpedo.target.classList.add("torpedoTimerFinished");
            }

            Utils.reactivateEvents(torpedo.target, clickLinkEventTypes)

            if (torpedo.tooltip !== null) {
                Utils.reactivateEvents(torpedo.tooltip.querySelector(".torpedo-URL"), ["click"])
            }
        } else {
            time--;
        }
    }, 1000);
}
