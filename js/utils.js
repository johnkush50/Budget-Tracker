/**
 * utils.js - Utility functions for the Budget Tracker application
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Format a date as MM/DD/YYYY
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
}

/**
 * Get month name from month number (1-12)
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export function getMonthName(month) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1]; // Adjust for zero-based array
}

/**
 * Safely toggle a class on an element
 * @param {HTMLElement} element - The element to modify
 * @param {string} className - The class to toggle
 * @param {boolean} force - Whether to add or remove the class
 */
export function toggleClass(element, className, force) {
    if (element) {
        if (force === true) {
            element.classList.add(className);
        } else if (force === false) {
            element.classList.remove(className);
        } else {
            element.classList.toggle(className);
        }
    }
}

/**
 * Execute a callback when DOM is fully loaded
 * @param {Function} callback - Function to execute
 */
export function onDOMReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

/**
 * Get the current date in ISO format YYYY-MM-DD
 * @returns {string} Current date in ISO format
 */
export function getCurrentDateISOString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}
