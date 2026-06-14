import { API_URL } from "../config/constants.js";

let currentStatus = '0';

async function checkStatus() {
    try {
        const response = await fetch(`${API_URL}/status`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const text = await response.text()

        if (text.trim() === 'STOPPED') {
            currentStatus = 'STOPPED'
        } else {
            currentStatus = Number(text) ? text : '0'
        }

    } catch (err) {
        console.error('Status check failed:', err);
        currentStatus = 'UNKNOWN';
    }
}

export function getStatus() {
    return currentStatus;
}

export function startStatusPolling() {
    checkStatus();
    setInterval(checkStatus, 5000);
}
