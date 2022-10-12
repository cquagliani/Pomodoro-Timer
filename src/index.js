/* ----- START ELEMENTS ----- */
/* Select all elements needed for program */
const playButton = document.querySelector('#playButton');
const resetButton = document.getElementById('resetButton');
const settingsButton = document.getElementById('settingsButton');
const mainTitle = document.getElementById('mainTitle');
const timer = {
    pomodoro: .1,
    shortBreak: .1,
    longBreak: .1,
    longBreakInterval: 4,
    rounds: 0,
    maxRounds: 4
};

let interval;

/* ----- END ELEMENTS ----- */

/* ----- START SUPPORTING FUNCTIONS ----- */

// Displays the current round #
function displayRounds() {
    const roundsDisplay = document.getElementById('roundsDisplay');
    roundsDisplay.textContent = "Round " + timer.rounds;
}

/* Play Button event listener */
if (playButton) {
    playButton.addEventListener('click', () => {
        playButton
            .querySelector("svg > path:nth-of-type(1)")
            .classList.toggle("invisible");
        playButton
            .querySelector("svg > path:nth-of-type(2)")
            .classList.toggle("invisible");
        
        const { action } = playButton.dataset;

        if (action === 'play') {
            startTimer();
        } else {
            stopTimer();
        }
    });
}

/* "Activates" a button to indicate which timer is live */
function activateButton(mode) {
    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    
    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.add('notActive'));

    document.querySelector(`[data-mode="${mode}"]`).classList.remove('notActive');
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
}

/* ----- END SUPPORTING FUNCTIONS ----- */

/* ----- START TIMER FUNCTIONS ----- */

/* Updates the time displayed to the user */
function updateClock() {
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('currMin');
    const sec = document.getElementById('currSec');
    min.textContent = minutes;
    sec.textContent = seconds;
}

/* Returns remaining time (continuously called) */
function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds,
    };
}

/* Start timer */
function startTimer() {
    // If set amount of rounds has not been reached, run the timer. Otherwise, reset the rounds and timer.
    if (timer.rounds <= timer.maxRounds) { 
        let { total } = timer.remainingTime;
        const endTime = Date.parse(new Date()) + total * 1000;

        const roundsDisplay = document.getElementById('roundsDisplay');
        if (timer.mode === 'pomodoro' && timer.rounds === 0) {
            timer.rounds++;
        }
        displayRounds();

        playButton.dataset.action = 'pause';
        playButton.classList.add('active');

        interval = setInterval(function() {
            timer.remainingTime = getRemainingTime(endTime);
            updateClock();

            total = timer.remainingTime.total;
            if (total <= 0) {
            clearInterval(interval);

            switch (timer.mode) {
                case 'pomodoro':
                    if (timer.rounds % timer.longBreakInterval === 0) {
                        switchMode('longBreak');
                    } else {
                        switchMode('shortBreak');
                    }
                break;
                default:
                    switchMode('pomodoro');
            }

            startTimer();
            }
        }, 1000);
    } else {
        resetTimer();
    }
}

/* Stop timer */
function stopTimer() {
    clearInterval(interval);

    playButton.dataset.action = 'play';
    playButton.classList.remove('active');
}

/* Reset timer */
function resetTimer() {
    timer.rounds = 0;
    switchMode('pomodoro');
    displayRounds();

    // If reset button is clicked while timer is running, click the playButton. Otherwise, leave it alone. 
    if (playButton.dataset.action === 'pause') {
        playButton.click();
    }
}
if (resetButton) {
    resetButton.addEventListener('click', (event) => {
        resetTimer();
    });
}

/* Handles change between different timers */
function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    }

    switch (timer.mode) {
        case 'pomodoro':
            mainTitle.textContent = "Pomodoro Timer";
            timer.rounds++;
            break;
        case 'shortBreak':
            mainTitle.textContent = "Short Break";
            break;
        case 'longBreak':
            mainTitle.textContent = "Long Break";
            break;
    }

    activateButton(timer.mode);
    updateClock();
};

/* ----- END TIMER FUNCTIONS ----- */

/* On page load/reload, set pomodoro timer as default card */
document.addEventListener('DOMContentLoaded', () => {
    switchMode('pomodoro');
});