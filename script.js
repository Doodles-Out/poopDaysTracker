/****************************************
 * script.js
 ****************************************/

// 1) REPLACE with your Make.com webhook URL
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

// We'll track the displayed value in the DOM, but the "source of truth" is in Make/Google Sheets
// because we fetch or update via the webhook scenario.
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
 * - Tells Make to "get" from the sheet
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

    // e.g. data might be { poopDays: 10 }
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
 * - Tells Make to "update" the cell with new value
 ****************************************/
async function updatePoopDays(newTotal) {
  try {
    const body = {
      action: "updatePoopDays",
      poopDays: newTotal,
    }
