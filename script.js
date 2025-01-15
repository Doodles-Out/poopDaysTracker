// Local storage key
const STORAGE_KEY = 'poopDays';
const poopDaysElement = document.getElementById('poopDays');
const lastPoopDayElement = document.getElementById('lastPoopDay');

// Load poop days
let poopDays = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
updateDisplay();

// Add poop days
document.getElementById('addButton').addEventListener('click', () => {
  const addDays = parseInt(document.getElementById('addDays').value);
  if (addDays > 0 && confirm(`Are you sure you want to add ${addDays} poop day(s)?`)) {
    poopDays += addDays;
    saveAndUpdate();
  }
});

// Remove poop days
document.getElementById('removeButton').addEventListener('click', () => {
  const removeDays = parseInt(document.getElementById('removeDays').value);
  if (removeDays > 0) {
    if (poopDays >= removeDays && confirm(`Are you sure you want to remove ${removeDays} poop day(s)?`)) {
      poopDays -= removeDays;
      saveAndUpdate();
    } else if (poopDays < removeDays) {
      alert('You don’t have enough poop days to remove!');
    }
  }
});

// Save to local storage and update display
function saveAndUpdate() {
  localStorage.setItem(STORAGE_KEY, poopDays);
  updateDisplay();
}

// Update display
function updateDisplay() {
  poopDaysElement.textContent = poopDays;
  updateLastPoopDay();
}

// Calculate and display last poop day
function updateLastPoopDay() {
  if (poopDays > 0) {
    const today = new Date();
    const lastPoopDate = new Date(today);
    lastPoopDate.setDate(today.getDate() + poopDays);
    lastPoopDayElement.textContent = lastPoopDate.toDateString();
  } else {
    lastPoopDayElement.textContent = 'N/A';
  }
}

// Decrement at 12:01 AM HST
setInterval(() => {
  const now = new Date();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const isMidnightHST = (hours === 10 && minutes === 1); // 12:01 AM HST = 10:01 UTC
  if (isMidnightHST && poopDays > 0) {
    poopDays--;
    saveAndUpdate();
  }
}, 60000); // Check every minute

// Daily notification at 7:00 AM HST
if ('Notification' in window && Notification.permission !== 'denied') {
  Notification.requestPermission();
}

setInterval(() => {
  const now = new Date();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const is7AMHST = (hours === 17 && minutes === 0); // 7:00 AM HST = 17:00 UTC
  if (is7AMHST) {
    new Notification('Zach\'s Poop Days Tracker', {
      body: `You have ${poopDays} poop day(s) left!`,
    });
  }
}, 60000); // Check every minute
