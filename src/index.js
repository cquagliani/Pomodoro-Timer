// Select all elements
const playButton = document.querySelector('#playButton');
const resetButton = document.getElementById('resetButton');
const settingsButton = document.getElementById('settingsButton');
const mainTitle = document.getElementById('pomodoroTitle');
const timer = {
    pomodoro: .1,
    shortBreak: .1,
    longBreak: .1,
    longBreakInterval: 4,
    rounds: 0
};

let interval;

// Handle play/pause selection
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

// Handles change in timer selection 
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

    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;

    updateClock();
};

function handleMode(event) {
    const { mode } = event.target.dataset;

    if (!mode) {
        return;
    }

    switchMode(mode);
    stopTimer();
}

function displayRounds() {
    const roundsDisplay = document.getElementById('roundsDisplay');
    roundsDisplay.textContent = "Round " + timer.rounds;
}

// Start timer
function startTimer() {
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
}

// Stop timer
function stopTimer() {
    clearInterval(interval);

    playButton.dataset.action = 'play';
    playButton.classList.remove('active');
}

function updateClock() {
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('currMin');
    const sec = document.getElementById('currSec');
    min.textContent = minutes;
    sec.textContent = seconds;
}

// Restart timer
if (resetButton) {
    resetButton.addEventListener('click', (event) => {
        timer.rounds = 0;
        switchMode('pomodoro');
        displayRounds();
        playButton.click();
    });
}

// Return remaining time (continuously called)
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

// Track progress of the timer shown on the current card (want to implement a liquid fill animation in the current card)

// On page load/reload, set pomodoro timer as default card
document.addEventListener('DOMContentLoaded', () => {
    switchMode('pomodoro');
});