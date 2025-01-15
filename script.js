// Local storage key
const STORAGE_KEY = 'poopDays';
const poopDaysElement = document.getElementById('poopDays');

// Load poop days
let poopDays = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
updateDisplay();

// Add poop day
document.getElementById('addButton').addEventListener('click', () => {
  if (confirm('Are you sure you want to add a poop day?')) {
    poopDays++;
    saveAndUpdate();
  }
});

// Remove poop day
document.getElementById('removeButton').addEventListener('click', () => {
  if (poopDays > 0 && confirm('Are you sure you want to remove a poop day?')) {
    poopDays--;
    saveAndUpdate();
  } else if (poopDays === 0) {
    alert('No poop days left to remove!');
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
      body: `You have ${poopDays} poop days left!`,
    });
  }
}, 60000); // Check every minute
