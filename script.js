/****************************************
 * script.js
 ****************************************/
// Key for localStorage
const STORAGE_KEY = 'poopDays';

// DOM references
const poopDaysSpan    = document.getElementById('poopDays');
const lastPoopDaySpan = document.getElementById('lastPoopDay');
const addDaysInput    = document.getElementById('addDays');
const removeDaysInput = document.getElementById('removeDays');
const addButton       = document.getElementById('addButton');
const removeButton    = document.getElementById('removeButton');
const allowBtn        = document.getElementById('allowNotificationsBtn');

// Read existing poopDays from localStorage
let poopDays = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;

// On load, update the UI
updateUI();

/****************************************
 * updateUI() 
 * - Refreshes displayed values
 ****************************************/
function updateUI() {
  poopDaysSpan.textContent = poopDays;

  if (poopDays > 0) {
    // "Last Poop Day" = today + poopDays
    const today  = new Date();
    const future = new Date(today);
    future.setDate(today.getDate() + poopDays);
    lastPoopDaySpan.textContent = future.toDateString();
  } else {
    lastPoopDaySpan.textContent = 'N/A';
  }
}

/****************************************
 * savePoopDays()
 * - Save current poopDays to localStorage
 * - Update UI
 ****************************************/
function savePoopDays() {
  localStorage.setItem(STORAGE_KEY, poopDays);
  updateUI();
}

/****************************************
 * ADD Button: Add multiple days
 ****************************************/
addButton.addEventListener('click', () => {
  const val = parseInt(addDaysInput.value, 10);
  if (Number.isNaN(val) || val <= 0) {
    alert('Please enter a positive number of days to add.');
    return;
  }

  if (confirm(`Add ${val} poop day(s)?`)) {
    poopDays += val;
    savePoopDays();
    addDaysInput.value = '';
  }
});

/****************************************
 * REMOVE Button: Remove multiple days
 ****************************************/
removeButton.addEventListener('click', () => {
  const val = parseInt(removeDaysInput.value, 10);
  if (Number.isNaN(val) || val <= 0) {
    alert('Please enter a positive number of days to remove.');
    return;
  }

  if (val > poopDays) {
    alert(`You only have ${poopDays} day(s) left. Can't remove ${val}.`);
    return;
  }

  if (confirm(`Remove ${val} poop day(s)?`)) {
    poopDays -= val;
    savePoopDays();
    removeDaysInput.value = '';
  }
});

/****************************************
 * ALLOW NOTIFICATIONS Button
 ****************************************/
allowBtn.addEventListener('click', () => {
  if (!('Notification' in window)) {
    alert('Notifications are not supported on this device/browser.');
    return;
  }

  // If permission is not yet granted or denied, request it
  Notification.requestPermission().then((perm) => {
    if (perm === 'granted') {
      alert('Notifications have been enabled!');
    } else if (perm === 'denied') {
      alert('Notifications have been denied. You can change this in your device settings.');
    } else {
      // 'default' means user closed the prompt
      alert('Notification permission prompt was dismissed.');
    }
  });
});

//---------------------------------------------------------
// PART 2: Daily Decrement & Notification (Optional)
//---------------------------------------------------------

// Let's define HST logic in a simpler way:
function getNowHST() {
  // HST = UTC-10
  const now = new Date();
  // Convert from local time to UTC (getTime() is already UTC-based)
  // then subtract 10 hours from that
  return new Date(now.getTime() - (10 * 60 * 60 * 1000));
}

// Format date as YYYY-MM-DD in HST
function formatHSTDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// We store the "last decrement date" so we only decrement once per day
const LAST_DECREMENT_KEY = 'poopLastDecrementHST';
let lastDecDate = localStorage.getItem(LAST_DECREMENT_KEY) || '';

// Check if we need to decrement for today
function dailyDecrementCheck() {
  const nowHST = getNowHST();
  const todayStr = formatHSTDate(nowHST);

  // If we haven't decremented yet today, do so once
  if (todayStr !== lastDecDate) {
    // Decrement if poopDays > 0
    if (poopDays > 0) {
      poopDays--;
      savePoopDays(); // re-save & update
    }
    // Update lastDecDate
    lastDecDate = todayStr;
    localStorage.setItem(LAST_DECREMENT_KEY, lastDecDate);
  }
}

// Notification logic
const LAST_NOTIFICATION_KEY = 'poopLastNotificationHST';
let lastNotDate = localStorage.getItem(LAST_NOTIFICATION_KEY) || '';

function dailyNotificationCheck() {
  // Must have notification permission
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const nowHST = getNowHST();
  const todayStr = formatHSTDate(nowHST);
  
  // Check if it's after 7 AM HST
  const hours = nowHST.getHours();
  if (hours >= 7) {
    // If we haven't notified yet today, do it
    if (todayStr !== lastNotDate) {
      new Notification("Zach's Poop Days Tracker", {
        body: `You have ${poopDays} poop day(s) left!`,
      });
      lastNotDate = todayStr;
      localStorage.setItem(LAST_NOTIFICATION_KEY, lastNotDate);
    }
  }
}

// 1) Run the daily checks on load
dailyDecrementCheck();
dailyNotificationCheck();

// 2) If you want to keep checking if the user leaves the app open
setInterval(() => {
  dailyDecrementCheck();
  dailyNotificationCheck();
}, 5 * 60 * 1000);

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
