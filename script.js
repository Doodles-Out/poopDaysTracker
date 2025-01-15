// Keys
const STORAGE_KEY = 'poopDays';

// DOM
const poopDaysSpan    = document.getElementById('poopDays');
const lastPoopDaySpan = document.getElementById('lastPoopDay');
const addDaysInput    = document.getElementById('addDays');
const removeDaysInput = document.getElementById('removeDays');
const addButton       = document.getElementById('addButton');
const removeButton    = document.getElementById('removeButton');

// Read existing poopDays or default to 0
let poopDays = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;

// Init UI on load
updateUI();

/*-----------------------------------------
  HELPER: updateUI
  - Shows current poopDays
  - Calculates + shows lastPoopDay
------------------------------------------*/
function updateUI() {
  // Update poopDays display
  poopDaysSpan.textContent = poopDays;

  // Calculate lastPoopDay
  if (poopDays > 0) {
    // Example logic: last day is "today + poopDays"
    const today = new Date();
    const future = new Date(today);
    future.setDate(today.getDate() + poopDays);

    lastPoopDaySpan.textContent = future.toDateString();
  } else {
    lastPoopDaySpan.textContent = 'N/A';
  }
}

/*-----------------------------------------
  HELPER: savePoopDays
  - Save poopDays to localStorage
  - Refresh UI
------------------------------------------*/
function savePoopDays() {
  localStorage.setItem(STORAGE_KEY, poopDays);
  updateUI();
}

/*-----------------------------------------
  ADD Button
------------------------------------------*/
addButton.addEventListener('click', () => {
  const val = parseInt(addDaysInput.value, 10);
  if (Number.isNaN(val) || val <= 0) {
    alert('Please enter a positive number of days to add.');
    return;
  }

  // Confirm
  if (confirm(`Add ${val} poop day(s)?`)) {
    poopDays += val;            // This is the key logic
    savePoopDays();             // Save to storage + update UI
    addDaysInput.value = '';    // Clear input
  }
});

/*-----------------------------------------
  REMOVE Button
------------------------------------------*/
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

  // Confirm
  if (confirm(`Remove ${val} poop day(s)?`)) {
    poopDays -= val;              // Key logic
    savePoopDays();               // Save to storage + update UI
    removeDaysInput.value = '';   // Clear input
  }
});
