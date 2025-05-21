let port;
document.getElementById("startBtn").addEventListener("click", async () => {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
});

document.getElementById("stopBtn").addEventListener("click", async () => {
    if (port) await port.close();
});
const toggle = document.getElementById("themeToggle");
const body = document.body;

toggle.addEventListener("change", () => {
    if (toggle.checked) {
        body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
    } else {
        body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
    }
});

// Load stored theme on refresh
if (localStorage.getItem("theme") === "dark") {
    toggle.checked = true;
    body.classList.add("dark-mode");
}

async function readSensorData() {
    const reader = port.readable.getReader();
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        document.getElementById("sensorValue").textContent = new TextDecoder().decode(value);
    }
}
