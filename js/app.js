/**
 * app.js - Core application functionality
 * Handles initialization and global state management
 */

// Global variables
let transactions = [];
let filteredTransactions = [];
let currentMonth;
let currentYear;
let currentPage = 1;
const itemsPerPage = 10;

// Chart variables
let summaryChartCtx;
let categoryChartCtx;
let summaryChart = null;
let categoryChart = null;

// Initialize the application
function initializeApp() {
    // Check if DOM elements are loaded
    if (!document.getElementById('current-month')) {
        console.error('DOM elements not loaded yet. Retrying in 100ms...');
        setTimeout(initializeApp, 100);
        return;
    }
    
    // Set current date
    const currentDate = new Date();
    currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    currentYear = currentDate.getFullYear();
    updateMonthDisplay();
    
    // Load saved data
    loadTransactions();
    loadGoalSettings();
    
    // Initialize Chart.js contexts
    summaryChartCtx = document.getElementById('summary-chart')?.getContext('2d');
    categoryChartCtx = document.getElementById('category-chart')?.getContext('2d');
    
    // Set up event listeners 
    setupEventListeners();
    
    // Initial UI update
    updateUI();
}

// Set up all event listeners
function setupEventListeners() {
    // Month navigation
    prevMonthBtn.addEventListener('click', goToPreviousMonth);
    nextMonthBtn.addEventListener('click', goToNextMonth);
    
    // Transactions
    addTransactionBtn.addEventListener('click', openAddTransactionModal);
    closeModalBtn.addEventListener('click', closeModal);
    transactionForm.addEventListener('submit', saveTransaction);
    deleteTransactionBtn.addEventListener('click', confirmDeleteTransaction);
    
    // Quick Add Transaction
    quickForm.addEventListener('submit', handleQuickAdd);
    
    // Recurrence
    recurringCheckbox.addEventListener('change', toggleRecurrenceOptions);
    quickRecurringCheckbox.addEventListener('change', toggleQuickRecurrenceOptions);
    
    // Filters
    searchInput.addEventListener('input', filterTransactions);
    filterTypeSelect.addEventListener('change', filterTransactions);
    filterCategorySelect.addEventListener('change', filterTransactions);
    
    // Pagination
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    
    // Goal settings
    goalForm.addEventListener('submit', saveGoalSettings);
    goalTypeSelect.addEventListener('change', toggleGoalPeriodSection);
}

// General UI update function
function updateUI() {
    filterTransactions(); // This will also update the transaction table
    updateSummary();
    updateCategoryBreakdown();
    updateGoalDisplay();
}

// Helper function to generate a unique ID
function generateID() {
    return Math.random().toString(36).substr(2, 9);
}

// Start app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
