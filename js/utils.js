/**
 * utils.js - Utility Functions
 * Contains helper functions used throughout the application
 */

// Helper function to format currency values
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Parse a date string or default to today's date
function parseOrDefaultDate(dateString) {
    if (!dateString) {
        return new Date();
    }
    return new Date(dateString);
}

// Check if two dates are in the same month and year
function isSameMonthYear(date1, date2) {
    return date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
}

// Helper to get month year key string for storage
function getMonthYearKey(month, year) {
    return `${month}-${year}`;
}
