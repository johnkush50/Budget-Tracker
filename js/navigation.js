/**
 * navigation.js - Month Navigation
 * Handles month navigation and display
 */

// Navigate to the previous month
function goToPreviousMonth() {
    if (currentMonth === 1) {
        currentMonth = 12;
        currentYear--;
    } else {
        currentMonth--;
    }
    updateMonthDisplay();
    updateUI();
}

// Navigate to the next month
function goToNextMonth() {
    if (currentMonth === 12) {
        currentMonth = 1;
        currentYear++;
    } else {
        currentMonth++;
    }
    updateMonthDisplay();
    updateUI();
}

// Update the month display with current month and year
function updateMonthDisplay() {
    const date = new Date(currentYear, currentMonth - 1, 1);
    currentMonthElement.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
