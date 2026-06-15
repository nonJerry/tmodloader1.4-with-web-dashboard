import { API_URL } from "../config/constants.js";

let currentStatus = '0';

async function checkStatus() {
    try {
        const response = await fetch(`${API_URL}/status`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const text = (await response.text()).trim()

        if (text === 'CHANGING') {

            if (currentStatus === 'STARTING' || currentStatus === 'STOPPING') {
                return
            }

            if (isNumber(currentStatus)) {
                currentStatus = 'STOPPING';
                return
            }

            // has to be starting from any other status
            currentStatus = 'STARTING';
            return 
        }

        currentStatus = text

    } catch (err) {
        console.error('Status check failed:', err);
        currentStatus = 'UNKNOWN';
    }
}

function isNumber(value?: string | number): boolean {
    return ((value != null) &&
        (value !== '') &&
        !Number.isNaN(Number(value.toString())));
}

export function getStatus() {
    return currentStatus;
}

export function startStatusPolling() {
    checkStatus();
    setInterval(checkStatus, 5000);
}
