/**
 * Determines whether to trigger the countdown timer or immediately reactivate the link listeners.
 */
function handleTimerLogic(target, dict, storage, secStatus) {
    const eventTypes = ["click", "contextmenu", "mouseup", "mousedown"];

    if (isTimerActivated(storage, secStatus)) {
        countdown(target, dict, storage.timer, eventTypes);

    } else {
        dict.tooltip.querySelector(".torpedo-timer").style.display = "none";
        reactivateEvents(target, eventTypes);

        const urlElement = dict.tooltip.querySelector(".torpedo-URL");
        urlElement.addEventListener("click", async (event) => {
            event.stopPropagation();
            event.preventDefault();
            await browser.runtime.sendMessage({ name: "open", url: urlElement.href });
        }, true);
    }
}


/**
 * Evaluates whether the link delay timer should be activated based on user preferences.
 * @returns {boolean} - True if the countdown timer should be enforced, false if not.
 */
function isTimerActivated(storage, securityStatus) {
    switch (securityStatus) {
        case "T1": return storage.trustedTimerActivated;
        case "T2": return storage.userTimerActivated;
        default: return true;
    }
}


/**
 * Starts an asynchronous countdown timer that temporarily blocks link interactions.
 */
function countdown(target, dict, time, clickLinkEventTypes) {
    if (dict.timerInterval) clearInterval(dict.timerInterval);
    if (target.classList.contains("torpedoTimerFinished")) time = 0;

    const timerEl = dict.tooltip.querySelector(".torpedo-timer");
    timerEl.style.display = "block";

    const updateTimerText = (remainingTime) => {
        timerEl.textContent = browser.i18n.getMessage("verbleibendeZeit", "" + remainingTime);
    }

    updateTimerText(time);

    dict.timerInterval = setInterval(async () => {
        time--;

        if (time <= 0) {
            if (time === 0) updateTimerText(time);
            clearInterval(dict.timerInterval);
            if (!(await isRedirect(dict.domain))) target.classList.add("torpedoTimerFinished");

            reactivateEvents(target, clickLinkEventTypes);
            reactivateEvents(dict.tooltip.querySelector(".torpedo-URL"), ["click"]);
        } else {
            updateTimerText(time);
        }
    }, 1000);
}
