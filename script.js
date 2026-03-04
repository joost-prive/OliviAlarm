const startButton = document.getElementById("startButton");
const countdownElement = document.getElementById("countdown");

let timerId = null;
let targetTimestamp = null;

const BRUSSELS_TIME_ZONE = "Europe/Brussels";

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
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    return;
  }

  countdownElement.textContent = formatDuration(remaining);
}

function startCountdown() {
  targetTimestamp = getNextTargetInBrussels().getTime();
  startButton.querySelector(".button-text").textContent = "LOOPT!";
  updateCountdown();

  if (timerId) {
    clearInterval(timerId);
  }

  timerId = setInterval(updateCountdown, 1000);
}

startButton.addEventListener("click", startCountdown);
