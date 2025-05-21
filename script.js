let port;
const sensorValue = document.getElementById("sensorValue");
const toggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
const body = document.body;
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

// Initialize Chart.js for real-time sensor data
const ctx = document.getElementById("sensorChart").getContext("2d");
const sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Time labels
        datasets: [{
            label: 'Sensor Data',
            data: [],
            borderColor: '#238636', // Green line (GitHub theme)
            backgroundColor: 'rgba(35, 134, 54, 0.2)',
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { type: 'linear', position: 'bottom' },
            y: { beginAtZero: true }
        }
    }
});

// Function to switch themes
function updateTheme(isDark) {
    if (isDark) {
        body.classList.add("dark-mode");
        body.classList.remove("light-mode");
        themeLabel.textContent = "Switch to Light Mode";
    } else {
        body.classList.add("light-mode");
        body.classList.remove("dark-mode");
        themeLabel.textContent = "Switch to Dark Mode";
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Handle theme toggle event
toggle.addEventListener("change", () => {
    const isDarkMode = toggle.checked;
    const userConfirmed = confirm(`Do you want to switch to ${isDarkMode ? "Dark" : "Light"} Mode?`);
    
    if (userConfirmed) {
        updateTheme(isDarkMode);
    } else {
        toggle.checked = !isDarkMode;
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

            // Parse and display sensor data
            const sensorReading = parseInt(new TextDecoder().decode(value));
            sensorValue.textContent = sensorReading;

            // Update chart
            const time = new Date().toLocaleTimeString();
            sensorChart.data.labels.push(time);
            sensorChart.data.datasets[0].data.push(sensorReading);

            // Keep only last 20 readings for smoother graph
            if (sensorChart.data.labels.length > 20) {
                sensorChart.data.labels.shift();
                sensorChart.data.datasets[0].data.shift();
            }

            sensorChart.update();
        }
    } catch (error) {
        console.error("Error reading data:", error);
    } finally {
        reader.releaseLock();
    }
}
