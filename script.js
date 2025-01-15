/****************************************
 * script.js
 ****************************************/

/**
 * 1) Replace with your actual Make.com webhook URL if needed
 */
const WEBHOOK_URL = "https://hook.us1.make.com/7s5ca42rsj2dxb6k88wmlp2e90unp0b5";

// DOM references
const poopDaysSpan = document.getElementById("poopDays");
const lastPoopDaySpan = document.getElementById("lastPoopDay");

const addDaysInput = document.getElementById("addDays");
const removeDaysInput = document.getElementById("removeDays");
const addButton = document.getElementById("addButton");
const removeButton = document.getElementById("removeButton");

const allowBtn = document.getElementById("allowNotificationsBtn");
const refreshBtn = document.getElementById("refreshButton");

/****************************************
 * We'll store the last-known value from
 * Make/Google Sheets in 'poopDays'.
 * The "source of truth" is the sheet.
 ****************************************/
let poopDays = 0;

/****************************************
 * On load, fetch the current poop days
 ****************************************/
window.addEventListener("load", () => {
  getPoopDays();
});

/****************************************
 * Refresh Button -> getPoopDays()
 ****************************************/
refreshBtn.addEventListener("click", () => {
  getPoopDays();
});

/****************************************
 * Function: getPoopDays
 * - Tells Make.com scenario "please GET
 *   the poopDays from A2."
 ****************************************/
async function getPoopDays() {
  try {
    const body = { action: "getPoopDays" };
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to get poopDays: ${response.status}`);
    }
    const data = await response.json();
    console.log("getPoopDays response:", data);

    // e.g., data might look like { "poopDays": 10 }
    if (data.poopDays !== undefined) {
      poopDays = data.poopDays;
      updateUI();
    }
  } catch (err) {
    console.error("Error in getPoopDays:", err);
  }
}

/****************************************
 * Function: updatePoopDays
 * - Tells Make.com scenario "please set
 *   poopDays to newTotal in A2."
 ****************************************/
async function updatePoopDays(newTotal) {
  try {
    const body = {
      action: "updatePoopDays",
      poopDays: newTotal,
    };
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to update poopDays: ${response.status}`);
    }
    const data = await response.json();
    console.log("updatePoopDays response:", data);

    // e.g., data might look like { "success": true, "poopDays": 12 }
    if (data.poopDays !== undefined) {
      poopDays = data.poopDays;
      updateUI();
    }
  } catch (err) {
    console.error("Error in updatePoopDays:", err);
  }
}

/****************************************
 * updateUI: show the new poopDays on
 * screen, recalc last poop day
 ****************************************/
function updateUI() {
  poopDaysSpan.textContent = poopDays;

  if (poopDays > 0) {
    const today = new Date();
    const future = new Date(today);
    future.setDate(today.getDate() + poopDays);
    lastPoopDaySpan.textContent = future.toDateString();
  } else {
    lastPoopDaySpan.textContent = "N/A";
  }
}

/****************************************
 * ADD Button
 ****************************************/
addButton.addEventListener("click", async () => {
  const val = parseInt(addDaysInput.value, 10);
  if (Number.isNaN(val) || val <= 0) {
    alert("Please enter a valid positive number of days to add.");
    return;
  }
  if (confirm(`Add ${val} poop day(s)?`)) {
    const newTotal = poopDays + val;
    await updatePoopDays(newTotal);
    addDaysInput.value = "";
  }
});

/****************************************
 * REMOVE Button
 ****************************************/
removeButton.addEventListener("click", async () => {
  const val = parseInt(removeDaysInput.value, 10);
  if (Number.isNaN(val) || val <= 0) {
    alert("Please enter a valid positive number of days to remove.");
    return;
  }
  if (val > poopDays) {
    alert(`You only have ${poopDays} day(s). Can't remove ${val}.`);
    return;
  }
  if (confirm(`Remove ${val} poop day(s)?`)) {
    const newTotal = poopDays - val;
    await updatePoopDays(newTotal);
    removeDaysInput.value = "";
  }
});

/****************************************
 * ALLOW NOTIFICATIONS Button
 ****************************************/
allowBtn.addEventListener("click", () => {
  if (!("Notification" in window)) {
    alert("Notifications are not supported on this device/browser.");
    return;
  }
  Notification.requestPermission().then((perm) => {
    if (perm === "granted") {
      alert("Notifications have been enabled!");
    } else if (perm === "denied") {
      alert("Notifications have been denied.");
    } else {
      alert("Notification permission prompt was dismissed.");
    }
  });
});
