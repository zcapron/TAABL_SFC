let port;
const toggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel"); // New: Label for the theme button
const body = document.body;
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const sensorValue = document.getElementById("sensorValue");

startBtn.addEventListener("click", async () => {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        readSensorData(); // Start reading sensor data
    } catch (error) {
        console.error("Failed to connect:", error);
    }
});

stopBtn.addEventListener("click", async () => {
    try {
        if (port) {
            await port.close();
            console.log("Port closed successfully");
        }
    } catch (error) {
        console.error("Error closing port:", error);
    }
});

// Toggle between themes and update button text
toggle.addEventListener("change", () => {
    if (toggle.checked) {
        body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
        themeLabel.textContent = "Light Mode"; // ✅ Button now says "Light Mode"
    } else {
        body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
        themeLabel.textContent = "Dark Mode"; // ✅ Button now says "Dark Mode"
    }
});

// Load stored theme on refresh
if (localStorage.getItem("theme") === "dark") {
    toggle.checked = true;
    body.classList.add("dark-mode");
    themeLabel.textContent = "Light Mode"; // ✅ Ensures correct text on reload
} else {
    themeLabel.textContent = "Dark Mode";
}

// Improved Sensor Data Reader Function
async function readSensorData() {
    if (!port) return;

    const reader = port.readable.getReader();
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done || !port) break;
            sensorValue.textContent = new TextDecoder().decode(value);
        }
    } catch (error) {
        console.error("Error reading data:", error);
    } finally {
        reader.releaseLock();
    }
}
