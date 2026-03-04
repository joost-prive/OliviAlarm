const lampButton = document.getElementById("lampButton");
const timerScreen = document.getElementById("timerScreen");
const countdownElement = document.getElementById("countdown");
const progressRing = document.getElementById("progressRing");
const adminToggle = document.getElementById("adminToggle");
const fullscreenButton = document.getElementById("fullscreenButton");
const adminPanel = document.getElementById("adminPanel");
const adminForm = document.getElementById("adminForm");
const targetTimeInput = document.getElementById("targetTimeInput");
const currentYear = document.getElementById("currentYear");

let timerId = null;
let targetTimestamp = null;
let countdownDurationMs = 0;
let targetHour = 6;
let targetMinute = 30;

const BRUSSELS_TIME_ZONE = "Europe/Brussels";
const TARGET_TIME_STORAGE_KEY = "olivialarm-target-time";
const ringRadius = Number(progressRing.getAttribute("r"));
const ringCircumference = 2 * Math.PI * ringRadius;

progressRing.style.strokeDasharray = `${ringCircumference}`;
progressRing.style.strokeDashoffset = "0";

function loadTargetTime() {
  const storedValue = localStorage.getItem(TARGET_TIME_STORAGE_KEY);
  const isValidFormat = /^\d{2}:\d{2}$/.test(storedValue || "");

  if (!isValidFormat) {
    return;
  }

  const [hourText, minuteText] = storedValue.split(":");
  const parsedHour = Number(hourText);
  const parsedMinute = Number(minuteText);

  if (
    Number.isInteger(parsedHour) &&
    Number.isInteger(parsedMinute) &&
    parsedHour >= 0 &&
    parsedHour <= 23 &&
    parsedMinute >= 0 &&
    parsedMinute <= 59
  ) {
    targetHour = parsedHour;
    targetMinute = parsedMinute;
  }
}

function syncInputWithTargetTime() {
  targetTimeInput.value = `${String(targetHour).padStart(2, "0")}:${String(targetMinute).padStart(2, "0")}`;
}

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

  target.setHours(targetHour, targetMinute, 0, 0);

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

  progressRing.style.strokeDashoffset = "0";
  updateCountdown();

  if (timerId) {
    clearInterval(timerId);
  }

  timerId = setInterval(updateCountdown, 1000);
}

function showTimerAndStart() {
  lampButton.classList.add("is-hidden");
  timerScreen.classList.remove("is-hidden");
  startCountdown();
}

function requestFullscreenIfPossible() {
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    return;
  }

  const documentElement = document.documentElement;
  const requestMethod = documentElement.requestFullscreen || documentElement.webkitRequestFullscreen;

  if (typeof requestMethod === "function") {
    const maybePromise = requestMethod.call(documentElement);

    if (maybePromise && typeof maybePromise.catch === "function") {
      maybePromise.catch(() => {});
    }
  }
}

function handleAdminSave(event) {
  event.preventDefault();

  if (!targetTimeInput.value) {
    return;
  }

  const [hourText, minuteText] = targetTimeInput.value.split(":");
  targetHour = Number(hourText);
  targetMinute = Number(minuteText);
  localStorage.setItem(TARGET_TIME_STORAGE_KEY, `${hourText}:${minuteText}`);
  adminPanel.classList.add("is-hidden");

  if (!timerScreen.classList.contains("is-hidden")) {
    startCountdown();
  }
}

function toggleAdminPanel() {
  adminPanel.classList.toggle("is-hidden");
}

loadTargetTime();
syncInputWithTargetTime();
currentYear.textContent = String(new Date().getFullYear());

lampButton.addEventListener("click", showTimerAndStart);
fullscreenButton.addEventListener("click", requestFullscreenIfPossible);
adminToggle.addEventListener("click", toggleAdminPanel);
adminForm.addEventListener("submit", handleAdminSave);
