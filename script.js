const startButton = document.getElementById("startButton");
const countdownElement = document.getElementById("countdown");
const progressRing = document.getElementById("progressRing");

let timerId = null;
let targetTimestamp = null;
let countdownDurationMs = 0;

const BRUSSELS_TIME_ZONE = "Europe/Brussels";
const ringRadius = Number(progressRing.getAttribute("r"));
const ringCircumference = 2 * Math.PI * ringRadius;

progressRing.style.strokeDasharray = `${ringCircumference}`;
progressRing.style.strokeDashoffset = "0";

function getBrusselsNow() {
  const now = new Date();
  const brusselsNowAsString = now.toLocaleString("en-US", {
    timeZone: BRUSSELS_TIME_ZONE,
  });

  return new Date(brusselsNowAsString);
}

function getNextTargetInBrussels() {
  const brusselsNow = getBrusselsNow();
  const target = new Date(brusselsNow);

  target.setHours(6, 30, 0, 0);

  if (target <= brusselsNow) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

function updateCountdown() {
  const brusselsNow = getBrusselsNow();
  const remaining = targetTimestamp - brusselsNow.getTime();

  if (remaining <= 0) {
    countdownElement.textContent = "00:00:00";
    startButton.querySelector(".button-text").textContent = "OPNIEUW";
    progressRing.style.strokeDashoffset = `${ringCircumference}`;

    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }

    return;
  }

  const elapsedRatio = (countdownDurationMs - remaining) / countdownDurationMs;
  const progressOffset = ringCircumference * Math.min(Math.max(elapsedRatio, 0), 1);

  countdownElement.textContent = formatDuration(remaining);
  progressRing.style.strokeDashoffset = `${progressOffset}`;
}

function startCountdown() {
  const brusselsNow = getBrusselsNow();
  targetTimestamp = getNextTargetInBrussels().getTime();
  countdownDurationMs = targetTimestamp - brusselsNow.getTime();

  if (countdownDurationMs <= 0) {
    countdownDurationMs = 1;
  }

  startButton.querySelector(".button-text").textContent = "LOOPT!";
  progressRing.style.strokeDashoffset = "0";
  updateCountdown();

  if (timerId) {
    clearInterval(timerId);
  }

  timerId = setInterval(updateCountdown, 1000);
}

startButton.addEventListener("click", startCountdown);
