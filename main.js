let timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0,
};

let interval;

const buttonSound = new Audio('sounds/button-sound.mp3');
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
    buttonSound.play();
    myTimer();
});

function myTimer(){
    const { action } = mainButton.dataset;
    if (action === 'start') {
        startTimer();
    } else {
        stopTimer();
    }
}

const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

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

function startTimer() {
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if (timer.mode === 'pomodoro') timer.sessions++;

    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');

    interval = setInterval(function () {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if (total <= 0) {
            clearInterval(interval);

            switch (timer.mode) {
                case 'pomodoro':
                    if (timer.sessions % timer.longBreakInterval === 0) {
                        switchMode('longBreak');
                    } else {
                        switchMode('shortBreak');
                    }
                    break;
                default:
                    switchMode('pomodoro');
            }

            if (Notification.permission === 'granted') {
                const text =
                    timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
                new Notification(text);
            }

            document.querySelector(`[data-sound="${timer.mode}"]`).play();

            startTimer();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active');
}

function updateClock() {
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    const text =
        timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
    document.title = `${minutes}:${seconds} — ${text}`;

    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };

    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    document
        .getElementById('js-progress')
        .setAttribute('max', timer.remainingTime.total);

    updateClock();
}

function handleMode(event) {
    const { mode } = event.target.dataset;

    if (!mode) return;

    switchMode(mode);
    stopTimer();
}

document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
        if (
            Notification.permission !== 'granted' &&
            Notification.permission !== 'denied'
        ) {
            Notification.requestPermission().then(function (permission) {
                if (permission === 'granted') {
                    new Notification(
                        'Awesome! You will be notified at the start of each session'
                    );
                }
            });
        }
    }

    switchMode('pomodoro');
});

function applyNewTimes() {
    let workTimeInputMinutes = parseInt(document.getElementById('work-time-minutes').value);
    let workTimeInputSeconds = parseInt(document.getElementById('work-time-seconds').value);
    let workIntervalInputs = parseInt(document.getElementById('work-time-intervals').value);
    let restTimeInputMinutes = parseInt(document.getElementById('rest-time-minutes').value);
    let restTimeInputSeconds = parseInt(document.getElementById('rest-time-seconds').value);
    let longRestTimeInputMinutes = parseInt(document.getElementById('long-rest-time-minutes').value);
    let longRestTimeInputSeconds = parseInt(document.getElementById('long-rest-time-seconds').value);

    timer.pomodoro = workTimeInputMinutes + workTimeInputSeconds;
    timer.shortBreak = restTimeInputMinutes + restTimeInputSeconds;
    timer.longBreakInterval = workIntervalInputs;
    timer.longBreak = longRestTimeInputMinutes + longRestTimeInputSeconds;

    console.log(timer.pomodoro, timer.shortBreak, timer.longBreakInterval, timer.longBreak);

    switchMode(timer.mode);
    stopTimer()
}

function closeSettings() {
    let settingsList = document.querySelectorAll('.settings-list')[0];
    // settingsList.style.right = "-20vw";
    settingsList.style.visibility = "hidden";

}
function openSettings() {
    let settingsList = document.querySelectorAll('.settings-list')[0];
    // settingsList.style.right = "0";
    settingsList.style.visibility = "visible";
    stopTimer();
}
