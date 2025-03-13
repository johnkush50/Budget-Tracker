/**
 * storage.js - Handles data persistence with localStorage
 */

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {boolean} Success status
 */
export function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Failed to save data (${key}):`, error);
        return false;
    }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Retrieved data or default value
 */
export function loadData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Failed to load data (${key}):`, error);
        return defaultValue;
    }
}

/**
 * Check if localStorage is available
 * @returns {boolean} Availability status
 */
export function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Clear all budget tracker data from localStorage
 */
export function clearAllData() {
    try {
        localStorage.removeItem('transactions');
        localStorage.removeItem('budgetGoal');
        localStorage.removeItem('appSettings');
    } catch (error) {
        console.error('Failed to clear data:', error);
    }
}

/**
 * Storage keys used in the application
 */
export const STORAGE_KEYS = {
    TRANSACTIONS: 'transactions',
    BUDGET_GOAL: 'budgetGoal',
    SETTINGS: 'appSettings'
};
