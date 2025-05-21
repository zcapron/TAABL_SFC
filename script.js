let port;
const toggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel"); // Label for theme toggle
const body = document.body;
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const sensorValue = document.getElementById("sensorValue");

// Function to switch themes
function updateTheme(isDark) {
    if (isDark) {
        body.classList.add("dark-mode");
        body.classList.remove("light-mode");
        themeLabel.textContent = "Switch to Light Mode"; // ✅ Button now asks for Light Mode
    } else {
        body.classList.add("light-mode");
        body.classList.remove("dark-mode");
        themeLabel.textContent = "Switch to Dark Mode"; // ✅ Button now asks for Dark Mode
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Handle theme toggle event
toggle.addEventListener("change", () => {
    const isDarkMode = toggle.checked;
    
    // ✅ Ask user before switching
    const userConfirmed = confirm(`Do you want to switch to ${isDarkMode ? "Dark" : "Light"} Mode?`);
    
    if (userConfirmed) {
        updateTheme(isDarkMode);
    } else {
        toggle.checked = !isDarkMode; // Undo change if canceled
    }
});

// Load stored theme on page load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    toggle.checked = true;
    updateTheme(true);
} else {
    toggle.checked = false;
    updateTheme(false);
}

// Handle Serial Connection for Arduino
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
