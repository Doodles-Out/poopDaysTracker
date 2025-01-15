const WEBHOOK_URL = "https://hook.us1.make.com/7s5ca42rsj2dxb6k88wmlp2e90unp0b5";

const poopDaysSpan = document.getElementById("poopDays");
const lastPoopDaySpan = document.getElementById("lastPoopDay");

const addDaysInput = document.getElementById("addDays");
const removeDaysInput = document.getElementById("removeDays");
const addButton = document.getElementById("addButton");
const removeButton = document.getElementById("removeButton");

const allowBtn = document.getElementById("allowNotificationsBtn");
const refreshBtn = document.getElementById("refreshButton");

let poopDays = 0;

window.addEventListener("load", () => {
  getPoopDays();
});

refreshBtn.addEventListener("click", () => {
  getPoopDays();
});

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

    if (data.poopDays !== undefined) {
      poopDays = data.poopDays;
      updateUI();
    }
  } catch (err) {
    console.error("Error in updatePoopDays:", err);
  }
}

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
