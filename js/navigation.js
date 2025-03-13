/**
 * navigation.js - Handles month/year navigation
 */

import { getMonthName } from './utils.js';
import { saveData, loadData, STORAGE_KEYS } from './storage.js';
import { filterTransactionsByMonth } from './transactions.js';

// Local state
let currentMonth;
let currentYear;

/**
 * Initialize date navigation
 */
export function initNavigation() {
    const today = new Date();
    
    // Start with current month/year
    currentMonth = today.getMonth() + 1; // Convert from 0-indexed to 1-indexed
    currentYear = today.getFullYear();
    
    // Update display
    updateMonthYearDisplay();
}

/**
 * Set up month navigation event listeners
 */
export function setupNavigationListeners() {
    // Previous month button
    const prevMonthBtn = document.getElementById('prev-month');
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', goToPreviousMonth);
    }
    
    // Next month button
    const nextMonthBtn = document.getElementById('next-month');
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', goToNextMonth);
    }
}

/**
 * Go to previous month
 */
export function goToPreviousMonth() {
    currentMonth--;
    
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    
    updateMonthYearDisplay();
    filterTransactionsByMonth(currentMonth, currentYear);
    dispatchMonthChanged();
}

/**
 * Go to next month
 */
export function goToNextMonth() {
    currentMonth++;
    
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }
    
    updateMonthYearDisplay();
    filterTransactionsByMonth(currentMonth, currentYear);
    dispatchMonthChanged();
}

/**
 * Update the month and year display
 */
function updateMonthYearDisplay() {
    const monthDisplay = document.getElementById('current-month');
    if (monthDisplay) {
        monthDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    }
}

/**
 * Get current month and year
 * @returns {Object} Object with month and year properties
 */
export function getCurrentMonthYear() {
    return { month: currentMonth, year: currentYear };
}

/**
 * Dispatch month changed event
 */
function dispatchMonthChanged() {
    const event = new CustomEvent('monthChanged', {
        detail: { month: currentMonth, year: currentYear }
    });
    window.dispatchEvent(event);
}
