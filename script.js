const WEBHOOK_URL = "https://hook.us1.make.com/7s5ca42rsj2dxb6k88wmlp2e90unp0b5";

// Example DOM references
const refreshBtn = document.getElementById("refreshButton");
const poopDaysSpan = document.getElementById("poopDays");
const addDaysBtn = document.getElementById("addButton");
const removeDaysBtn = document.getElementById("removeButton");
const addDaysInput = document.getElementById("addDays");
const removeDaysInput = document.getElementById("removeDays");

/******************************************************
 * 1) On load or Refresh -> getPoopDays from Make
 ******************************************************/
async function getPoopDays() {
  try {
    // We POST action: 'getPoopDays' so that the Router
    // picks the correct route.
    const body = { action: "getPoopDays" };
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`GET poopDays failed: ${response.status}`);
    }
    const data = await response.json(); 
    console.log("getPoopDays response:", data);

    // e.g. data might be { "poopDays": 10 }
    if (data.poopDays !== undefined) {
      poopDaysSpan.textContent = data.poopDays;
    }
  } catch (err) {
    console.error("Failed to getPoopDays:", err);
  }
}

/******************************************************
 * 2) Update (Add/Remove) -> updatePoopDays in Make
 ******************************************************/
async function updatePoopDays(newValue) {
  try {
    // We send action: "updatePoopDays" so the Router knows
    // which route to follow, plus the new poopDays number
    const body = {
      action: "updatePoopDays",
      poopDays: newValue
    };
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`UPDATE poopDays failed: ${response.status}`);
    }
    const data = await response.json();
    console.log("updatePoopDays response:", data);

    // Example: data might be { "success": true, "poopDays": 12 }
    if (data.poopDays !== undefined) {
      poopDaysSpan.textContent = data.poopDays;
    }
  } catch (err) {
    console.error("Failed to updatePoopDays:", err);
  }
}

/******************************************************
 * Refresh Button Handler
 ******************************************************/
refreshBtn?.addEventListener('click', () => {
  getPoopDays();
});

/******************************************************
 * Add Button Handler
 ******************************************************/
addDaysBtn?.addEventListener('click', async () => {
  // We read the current text from poopDaysSpan or keep track in a var
  const currentVal = parseInt(poopDaysSpan.textContent, 10) || 0;
  const inputVal = parseInt(addDaysInput.value, 10);
  if (Number.isNaN(inputVal) || inputVal <= 0) {
    alert("Please enter a valid positive number of days to add.");
    return;
  }
  const newTotal = currentVal + inputVal;
  await updatePoopDays(newTotal);
  addDaysInput.value = '';
});

/******************************************************
 * Remove Button Handler
 ******************************************************/
removeDaysBtn?.addEventListener('click', async () => {
  const currentVal = parseInt(poopDaysSpan.textContent, 10) || 0;
  const inputVal = parseInt(removeDaysInput.value, 10);
  if (Number.isNaN(inputVal) || inputVal <= 0) {
    alert("Please enter a valid positive number of days to remove.");
    return;
  }
  if (inputVal > currentVal) {
    alert(`You only have ${currentVal} days, can't remove ${inputVal}.`);
    return;
  }
  const newTotal = currentVal - inputVal;
  await updatePoopDays(newTotal);
  removeDaysInput.value = '';
});

/******************************************************
 * On Load: Call getPoopDays to show current value
 ******************************************************/
window.addEventListener('load', () => {
  getPoopDays();
});
