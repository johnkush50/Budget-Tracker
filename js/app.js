/**
 * app.js - Main application file
 * Serves as the entry point for the Budget Tracker application
 */

// Import modules
import { formatCurrency } from './utils.js';
import { initTransactions, calculateTotalIncome, calculateTotalExpenses, filterTransactionsByMonth, getCategoryBreakdown } from './transactions.js';
import { initNavigation, setupNavigationListeners, getCurrentMonthYear } from './navigation.js';
import { initCharts, updateSummaryChart, updateCategoryChart } from './charts.js';
import { initGoals, setupGoalListeners, renderGoalsList } from './goals.js';
import { initUI, renderTransactionsTable, updateSummaryNumbers } from './ui.js';
import { onDOMReady } from './utils.js';
import { initTheme, setupThemeToggle } from './theme.js';

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Initializing Budget Tracker application');
    
    // Initialize all modules
    initNavigation();
    const { month, year } = getCurrentMonthYear();
    initTransactions(month, year);
    initCharts();
    initGoals();
    initUI();
    initTheme();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update UI with initial data
    updateDashboard();
    
    console.log('Application initialized successfully');
}

/**
 * Set up application event listeners
 */
function setupEventListeners() {
    // Set up module-specific event listeners
    setupNavigationListeners();
    setupGoalListeners();
    setupThemeToggle();
    
    // Listen for month changes to update dashboard
    window.addEventListener('monthChanged', updateDashboard);
    
    // Listen for transaction updates to refresh dashboard
    window.addEventListener('transactionsUpdated', updateDashboard);
}

/**
 * Update dashboard with current data
 */
function updateDashboard() {
    const { month, year } = getCurrentMonthYear();
    
    // Calculate summary numbers
    const totalIncome = calculateTotalIncome(month, year);
    const totalExpenses = calculateTotalExpenses(month, year);
    
    // Update UI components
    updateSummaryNumbers(totalIncome, totalExpenses);
    updateCharts(totalIncome, totalExpenses, month, year);
    renderTransactionsTable();
    renderGoalsList();
}

/**
 * Update charts with current data
 */
function updateCharts(income, expenses, month, year) {
    // Update summary chart with income vs expenses
    updateSummaryChart(income, expenses);
    
    // Get and update category breakdown
    const categoryData = getCategoryBreakdown(month, year);
    updateCategoryChart(categoryData);
}

// Initialize the application when DOM content is loaded
onDOMReady(initializeApp);
