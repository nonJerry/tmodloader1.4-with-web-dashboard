import { sendCommand } from "../api/controllers/commands.controller.js";
import { API_URL } from "../config/constants.js";

let currentStatus = '0';
let lastPlayerSeen = Date.now()
const POLLING_INTERVAL = 5000
const DEFAULT_TIMEOUT = 10 * 60 * 1000; // 10 minutes
let INACTIVITY_TIMEOUT = DEFAULT_TIMEOUT;

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
            lastPlayerSeen = Date.now(); //ensure it does not shut down immediately
            return
        }

        if (isNumber(text)) {
            if (text === '0') {
                if (lastPlayerSeen < Date.now() - INACTIVITY_TIMEOUT) {
                    console.log('Stopping server because of inactivity')
                    await sendCommand('stop')
                }
            } else {
                lastPlayerSeen = Date.now();
                console.log(lastPlayerSeen)
            }
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

/**
 * 
 * @param timeout Timeout in ms
 */
export function setInactivityTimeout(timeout: number) {
    INACTIVITY_TIMEOUT = timeout;
    console.log(`Inactivity timeout updated to: ${timeout}`)
}

export function getInactivityTimeout() {
    return INACTIVITY_TIMEOUT;
}

export function getDefaultTimeout() {
    return DEFAULT_TIMEOUT;
}

export function setLastSeen(timestamp: number) {
    lastPlayerSeen = timestamp;
    console.log(`Last seen updated to: ${timestamp}`)
}

export function getLastSeen() {
    return lastPlayerSeen;
}

export function extendAllowedInactivity() {
    lastPlayerSeen = Date.now();
    console.log(`Inactivity extended to: ${lastPlayerSeen}`)
}

export function getStatus() {
    return currentStatus;
}

export function startStatusPolling() {
    checkStatus();
    setInterval(checkStatus, POLLING_INTERVAL);
}
