let port;
document.getElementById("startBtn").addEventListener("click", async () => {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
});

document.getElementById("stopBtn").addEventListener("click", async () => {
    if (port) await port.close();
});

async function readSensorData() {
    const reader = port.readable.getReader();
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        document.getElementById("sensorValue").textContent = new TextDecoder().decode(value);
    }
}
