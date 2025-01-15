/**
 * script.js
 */
 
// ---------------------------
//  STORAGE KEYS
// ---------------------------
const STORAGE_KEY_DAYS = 'poopDays';
const STORAGE_KEY_LAST_DECREMENT = 'poopLastDecrementHST'; 
const STORAGE_KEY_LAST_NOTIFICATION = 'poopLastNotificationHST';

// ---------------------------
//  DOM ELEMENTS
// ---------------------------
const poopDaysSpan    = document.getElementById('poopDays');
const lastPoopDaySpan = document.getElementById('lastPoopDay');
const addButton       = document.getElementById('addButton');
const removeButton    = document.getElementById('removeButton');
const addDaysInput    = document.getElementById('addDays');
const removeDaysInput = document.getElementById('removeDays');

// ---------------------------
//  LOAD INITIAL VALUES
// ---------------------------
let poopDays = parseInt(localStorage.getItem(STORAGE_KEY_DAYS), 10) || 0;

// ---------------------------
//  HELPER FUNCTIONS
// ---------------------------

/**
 * Returns a JS Date object representing the current time in HST (UTC-10).
 * Note: HST does not observe DST.
 */
function getNowHST() {
  const now = new Date();
  // Convert UTC time to HST by subtracting 10 hours from UTC
  // (We'll do it by adjusting the hours in the date’s UTC-based time)
  const hst = new Date(now.getTime() - 10 * 60 * 60 * 1000);
  return hst;
}

/**
 * Returns a string 'YYYY-MM-DD' for the given Date object, using its local time.
 * We’ll interpret the local time as the HST time in the `hst` object.
 */
function formatDateYYYYMMDD(dateObj) {
  const year  = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day   = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Updates the displayed poopDays and lastPoopDay in the UI.
 */
function updateUI() {
  poopDaysSpan.textContent = poopDays;

  // Calculate Last Poop Day if poopDays > 0
  if (poopDays > 0) {
    const todayHST  = getNowHST(); 
    const lastPoop  = new Date(todayHST);
    // Add poopDays to today's date
    lastPoop.setDate(lastPoop.getDate() + poopDays);

    lastPoopDaySpan.textContent = lastPoop.toDateString(); 
  } else {
    lastPoopDaySpan.textContent = 'N/A';
  }
}

/**
 * Persists the current poopDays count to localStorage and updates the UI.
 */
function saveAndRefreshUI() {
  localStorage.setItem(STORAGE_KEY_DAYS, poopDays);
  updateUI();
}

// ---------------------------
//  CORE LOGIC
// ---------------------------

/**
 * Check if we should decrement for a new day (in HST).
 */
function checkDailyDecrement() {
  const lastDecDateStr = localStorage.getItem(STORAGE_KEY_LAST_DECREMENT) || '';
  const nowHST         = getNowHST();
  const todayHSTStr    = formatDateYYYYMMDD(nowHST);

  // If we haven't decremented today (in HST), do so once
  if (lastDecDateStr !== todayHSTStr) {
    // new day in HST — decrement if poopDays > 0
    if (poopDays > 0) {
      poopDays--;
    }
    localStorage.setItem(STORAGE_KEY_LAST_DECREMENT, todayHSTStr);
    saveAndRefreshUI();
  }
}

/**
 * Check if we should send the daily 7 AM HST notification.
 * - If the current time is >= 7:00 HST, and we haven't sent one today, send it.
 * - iOS may or may not allow the notification if the user is not actively using the PWA.
 */
function checkDailyNotification() {
  if (!('Notification' in window)) return; // Not supported
  if (Notification.permission !== 'granted') return; // Permission not granted

  const nowHST         = getNowHST();
  const hoursHST       = nowHST.getHours();
  const minutesHST     = nowHST.getMinutes();
  const todayHSTStr    = formatDateYYYYMMDD(nowHST);
  const lastNotDateStr = localStorage.getItem(STORAGE_KEY_LAST_NOTIFICATION) || '';

  // We only send it if it's after 7:00 AM HST.
  // If you prefer *exactly* at 7:00, you could check (hoursHST === 7 && minutesHST === 0).
  if (
    (hoursHST > 7) ||
    (hoursHST === 7 && minutesHST >= 0)
  ) {
    // If we haven't sent a notification yet today, send one.
    if (lastNotDateStr !== todayHSTStr) {
      new Notification("Zach's Poop Days Tracker", {
        body: `You have ${poopDays} poop day(s) left!`,
      });
      localStorage.setItem(STORAGE_KEY_LAST_NOTIFICATION, todayHSTStr);
    }
  }
}

// ---------------------------
//  EVENT HANDLERS
// ---------------------------

/**
 * Handle Add Poop Days
 */
addButton.addEventListener('click', () => {
  const addValue = parseInt(addDaysInput.value, 10);
  if (Number.isNaN(addValue) || addValue <= 0) {
    alert('Please enter a valid positive number to add.');
    return;
  }
  if (confirm(`Are you sure you want to ADD ${addValue} poop day(s)?`)) {
    poopDays += addValue;
    saveAndRefreshUI();
    addDaysInput.value = '';
  }
});

/**
 * Handle Remove Poop Days
 */
removeButton.addEventListener('click', () => {
  const removeValue = parseInt(removeDaysInput.value, 10);
  if (Number.isNaN(removeValue) || removeValue <= 0) {
    alert('Please enter a valid positive number to remove.');
    return;
  }
  if (removeValue > poopDays) {
    alert(`You only have ${poopDays} poop day(s). You cannot remove ${removeValue}.`);
    return;
  }
  if (confirm(`Are you sure you want to REMOVE ${removeValue} poop day(s)?`)) {
    poopDays -= removeValue;
    saveAndRefreshUI();
    removeDaysInput.value = '';
  }
});

// ---------------------------
//  INITIALIZE
// ---------------------------

// Request notification permission on first load (if not granted/denied)
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// 1) Check if we need to decrement for a new day
checkDailyDecrement();

// 2) Immediately update UI
updateUI();

// 3) Check daily notification on load
checkDailyNotification();

// 4) Also check daily notification periodically if user leaves the tab open
//    (checks every 5 mins, for example)
setInterval(() => {
  checkDailyDecrement();
  checkDailyNotification();
}, 5 * 60 * 1000);
