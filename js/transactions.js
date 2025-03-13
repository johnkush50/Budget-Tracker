/**
 * transactions.js - Handles transaction management
 */

import { generateId, formatDate, getCurrentDateISOString } from './utils.js';
import { saveData, loadData, STORAGE_KEYS } from './storage.js';

// Local state
let transactions = [];
let filteredTransactions = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

/**
 * Initialize transactions module
 * @param {number} month - Current month (1-12)
 * @param {number} year - Current year
 */
export function initTransactions(month, year) {
    loadAllTransactions();
    filterTransactionsByMonth(month, year);
}

/**
 * Load all transactions from storage
 */
export function loadAllTransactions() {
    transactions = loadData(STORAGE_KEYS.TRANSACTIONS, []);
}

/**
 * Filter transactions by month and year
 * @param {number} month - Month to filter by (1-12)
 * @param {number} year - Year to filter by
 */
export function filterTransactionsByMonth(month, year) {
    filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
    
    // Reset pagination when filtering
    currentPage = 1;
    
    // Dispatch event to notify of updates
    dispatchTransactionsUpdated();
}

/**
 * Filter transactions by search criteria
 * @param {string} searchText - Text to search for
 * @param {string} type - Transaction type filter (all, income, expense)
 * @param {string} category - Category filter
 * @param {number} month - Current month (1-12)
 * @param {number} year - Current year
 */
export function filterTransactions(searchText, type, category, month, year) {
    // Start with transactions for the current month
    let filtered = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
    
    // Apply text search if provided
    if (searchText.trim()) {
        const search = searchText.toLowerCase().trim();
        filtered = filtered.filter(t => 
            t.description.toLowerCase().includes(search) ||
            t.category.toLowerCase().includes(search)
        );
    }
    
    // Apply type filter if not 'all'
    if (type !== 'all') {
        filtered = filtered.filter(t => t.type === type);
    }
    
    // Apply category filter if not 'all'
    if (category !== 'all') {
        filtered = filtered.filter(t => t.category === category);
    }
    
    filteredTransactions = filtered;
    currentPage = 1; // Reset to first page
    
    // Dispatch event to notify of updates
    dispatchTransactionsUpdated();
}

/**
 * Add a new transaction
 * @param {Object} transaction - Transaction data
 */
export function addTransaction(transaction) {
    const newTransaction = {
        id: generateId(),
        ...transaction,
        date: transaction.date || getCurrentDateISOString()
    };
    
    transactions.push(newTransaction);
    saveTransactions();
    
    // Re-apply current filter
    const date = new Date(newTransaction.date);
    filterTransactionsByMonth(date.getMonth() + 1, date.getFullYear());
}

/**
 * Update an existing transaction
 * @param {string} id - Transaction ID
 * @param {Object} updates - Fields to update
 */
export function updateTransaction(id, updates) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        saveTransactions();
        
        // Re-apply current filter using the updated transaction's date
        const date = new Date(transactions[index].date);
        filterTransactionsByMonth(date.getMonth() + 1, date.getFullYear());
    }
}

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 */
export function deleteTransaction(id) {
    // Store the date before removing the transaction
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    const date = new Date(transaction.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // Remove the transaction
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    
    // Re-apply filter with the same month/year
    filterTransactionsByMonth(month, year);
}

/**
 * Save all transactions to storage
 */
function saveTransactions() {
    saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
}

/**
 * Get a transaction by ID
 * @param {string} id - Transaction ID
 * @returns {Object|null} Transaction object or null if not found
 */
export function getTransactionById(id) {
    return transactions.find(t => t.id === id) || null;
}

/**
 * Calculate total income for a specific month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {number} Total income
 */
export function calculateTotalIncome(month, year) {
    return transactions
        .filter(t => {
            const date = new Date(t.date);
            return (
                t.type === 'income' &&
                date.getMonth() + 1 === month &&
                date.getFullYear() === year
            );
        })
        .reduce((total, t) => total + parseFloat(t.amount), 0);
}

/**
 * Calculate total expenses for a specific month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {number} Total expenses
 */
export function calculateTotalExpenses(month, year) {
    return transactions
        .filter(t => {
            const date = new Date(t.date);
            return (
                t.type === 'expense' &&
                date.getMonth() + 1 === month &&
                date.getFullYear() === year
            );
        })
        .reduce((total, t) => total + parseFloat(t.amount), 0);
}

/**
 * Get paginated transactions for the current filter
 * @returns {Object} Pagination information and transactions
 */
export function getPaginatedTransactions() {
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, filteredTransactions.length);
    const paginatedItems = filteredTransactions.slice(start, end);
    
    return {
        items: paginatedItems,
        currentPage,
        totalPages,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        totalItems: filteredTransactions.length
    };
}

/**
 * Change the current page
 * @param {number} direction - Direction to change page (1 for next, -1 for previous)
 */
export function changePage(direction) {
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    
    if (direction === 1 && currentPage < totalPages) {
        currentPage++;
    } else if (direction === -1 && currentPage > 1) {
        currentPage--;
    }
    
    // Dispatch event to notify of pagination change
    dispatchTransactionsPaginated();
}

/**
 * Get expense breakdown by category for a specific month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Array} Category breakdown data
 */
export function getCategoryBreakdown(month, year) {
    // Get expenses for the specified month/year
    const expenses = transactions.filter(t => {
        const date = new Date(t.date);
        return (
            t.type === 'expense' && 
            date.getMonth() + 1 === month && 
            date.getFullYear() === year
        );
    });
    
    // Group by category
    const categories = {};
    expenses.forEach(expense => {
        const category = expense.category || 'other';
        if (!categories[category]) {
            categories[category] = 0;
        }
        categories[category] += parseFloat(expense.amount);
    });
    
    // Convert to array and sort by amount
    return Object.entries(categories)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
}

/**
 * Get all filtered transactions
 * @returns {Array} All filtered transactions
 */
export function getAllFilteredTransactions() {
    return filteredTransactions;
}

// Custom events for application communication
function dispatchTransactionsUpdated() {
    window.dispatchEvent(new CustomEvent('transactionsUpdated'));
}

function dispatchTransactionsPaginated() {
    window.dispatchEvent(new CustomEvent('transactionsPaginated'));
}
