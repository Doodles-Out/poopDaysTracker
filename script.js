/****************************************
 * script.js
 ****************************************/

/**
 * 1) Replace this with your deployed Google Apps Script URL.
 *    Example: "https://script.google.com/macros/s/AKfycbxy.../exec"
 */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz0LpzzqxyZ5uozv8aZWuxL3986fJr_0I4mcQjewsCj-s0pu27LKKJyafeEEgMnDL4sgg/exec";

// DOM references
const poopDaysSpan    = document.getElementById('poopDays');
const lastPoopDaySpan = document.getElementById('lastPoopDay');
const addDaysInput    = document.getElementById('addDays');
const removeDaysInput = document.getElementById('removeDays');
const addButton       = document.getElementById('addButton');
const removeButton    = document.getElementById('removeButton');
const allowBtn        = document.getElementById('allowNotificationsBtn');

// We'll track poopDays in a JS variable, but the "source of truth" is in the Google Sheet.
let poopDays = 0;

/****************************************
 * On Load: fetch the current poopDays
 ****************************************/
init();

async function init() {
  try {
    // GET the current count from your Apps Script
    const response = await fetch(WEB_APP_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();  // e.g. { poopDays: 5 }
    poopDays = data.poopDays || 0;
    updateUI();
  } catch (err) {
    console.error("Failed to load from Google Sheet:", err);
  }
}

/****************************************
 * updateUI()
 * - Refresh displayed poopDays
 * - Recalculate & display lastPoopDay
 ****************************************/
function updateUI() {
  poopDaysSpan.textContent = poopDays;

  if (poopDays > 0) {
    const today = new Date();
    const future = new Date(today);
    future.setDate(today.getDate() + poopDays);
    lastPoopDaySpan.textContent = future.toDateString();
  } else {
    lastPoopDaySpan.textContent = 'N/A';
  }
}

/****************************************
 * saveToSheet()
 * - POST the updated poopDays to your
 *   Google Apps Script web app
 ****************************************/
async function saveToSheet() {
  try {
    await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poopDays: poopDays })
    });
    console.log("Saved poopDays to sheet:", poopDays);
  } catch (err) {
    console.error("Failed to save to Google Sheet:", err);
  }
}

/****************************************
 * ADD Button
 ****************************************/
addButton.addEventListener('click', async () => {
  const val = parseInt(addDaysInput.value, 10);
  if (Number.isNaN(val) || val <= 0) {
    alert('Please enter a positive number of days to add.');
    return;
  }
  if (confirm(`Add ${val} poop day(s)?`)) {
    poopDays += val;
    updateUI();
    await saveToSheet();
    addDaysInput.value = '';
  }
});

/****************************************
 * REMOVE Button
 ****************************************/
removeButton.addEventListener('click', async () => {
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
    updateUI();
    await saveToSheet();
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
  Notification.requestPermission().then((perm) => {
    if (perm === 'granted') {
      alert('Notifications have been enabled!');
    } else if (perm === 'denied') {
      alert('Notifications have been denied.');
    } else {
      alert('Notification permission prompt was dismissed.');
    }
  });
});
