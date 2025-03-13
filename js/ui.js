/**
 * ui.js - Handles UI updates and interactions
 */

import { formatCurrency, formatDate, getCurrentDateISOString } from './utils.js';
import { 
    getPaginatedTransactions, 
    getAllFilteredTransactions, 
    getTransactionById, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    changePage,
    filterTransactions
} from './transactions.js';
import { getCategoryColor } from './charts.js';

/**
 * Initialize UI elements
 */
export function initUI() {
    setupFormDefaults();
    setupModalHandlers();
    setupTransactionForm();
    setupFiltersAndSearch();
    setupPagination();
}

/**
 * Set up form defaults
 */
function setupFormDefaults() {
    // Set current date as default for transaction form
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = getCurrentDateISOString();
    }
    
    // Handle recurring checkbox toggle
    const recurringCheckbox = document.getElementById('recurring');
    const recurrenceOptions = document.getElementById('recurrence-options');
    
    if (recurringCheckbox && recurrenceOptions) {
        recurringCheckbox.addEventListener('change', function() {
            recurrenceOptions.classList.toggle('hidden', !this.checked);
        });
    }
    
    // Handle quick form recurring checkbox
    const quickRecurringCheckbox = document.getElementById('quick-recurring');
    const quickRecurrenceOptions = document.getElementById('quick-recurrence-options');
    
    if (quickRecurringCheckbox && quickRecurrenceOptions) {
        quickRecurringCheckbox.addEventListener('change', function() {
            quickRecurrenceOptions.classList.toggle('hidden', !this.checked);
        });
    }
    
    // Quick transaction form submission
    const quickForm = document.getElementById('quick-form');
    if (quickForm) {
        quickForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const description = document.getElementById('quick-description').value;
            const amount = parseFloat(document.getElementById('quick-amount').value);
            const category = document.getElementById('quick-category').value;
            const type = document.getElementById('quick-type').value;
            const recurring = document.getElementById('quick-recurring').checked;
            const recurrenceInterval = recurring ? 
                document.getElementById('quick-recurrence-interval').value : null;
            
            // Validate
            if (!description || isNaN(amount) || amount <= 0) {
                alert('Please enter a valid description and amount.');
                return;
            }
            
            // Create transaction object
            const transaction = {
                description,
                amount,
                category,
                type,
                date: getCurrentDateISOString(),
                recurring,
                recurrenceInterval
            };
            
            // Add transaction
            addTransaction(transaction);
            
            // Reset form
            quickForm.reset();
            quickRecurrenceOptions.classList.add('hidden');
        });
    }
}

/**
 * Set up modal handlers
 */
function setupModalHandlers() {
    // Add transaction button
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const transactionModal = document.getElementById('transaction-modal');
    const closeBtn = transactionModal ? transactionModal.querySelector('.close-btn') : null;
    
    if (addTransactionBtn && transactionModal) {
        addTransactionBtn.addEventListener('click', function() {
            // Reset form and open for new transaction
            resetTransactionForm();
            document.getElementById('modal-title').textContent = 'Add Transaction';
            document.getElementById('delete-transaction').classList.add('hidden');
            transactionModal.classList.remove('hidden');
        });
    }
    
    if (closeBtn && transactionModal) {
        closeBtn.addEventListener('click', function() {
            transactionModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        transactionModal.addEventListener('click', function(e) {
            if (e.target === transactionModal) {
                transactionModal.classList.add('hidden');
            }
        });
    }
}

/**
 * Reset transaction form
 */
function resetTransactionForm() {
    const form = document.getElementById('transaction-form');
    const transactionId = document.getElementById('transaction-id');
    const recurrenceOptions = document.getElementById('recurrence-options');
    
    if (form) form.reset();
    if (transactionId) transactionId.value = '';
    if (recurrenceOptions) recurrenceOptions.classList.add('hidden');
    
    // Set current date
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.value = getCurrentDateISOString();
}

/**
 * Set up transaction form handlers
 */
function setupTransactionForm() {
    const form = document.getElementById('transaction-form');
    const deleteBtn = document.getElementById('delete-transaction');
    const transactionModal = document.getElementById('transaction-modal');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const id = document.getElementById('transaction-id').value;
            const description = document.getElementById('description').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const date = document.getElementById('date').value;
            const category = document.getElementById('category').value;
            const type = document.getElementById('type').value;
            const recurring = document.getElementById('recurring').checked;
            const recurrenceInterval = recurring ? 
                document.getElementById('recurrence-interval').value : null;
            
            // Validate
            if (!description || isNaN(amount) || amount <= 0 || !date) {
                alert('Please fill all required fields with valid values.');
                return;
            }
            
            // Create transaction object
            const transaction = {
                description,
                amount,
                date,
                category,
                type,
                recurring,
                recurrenceInterval
            };
            
            // Add or update
            if (id) {
                updateTransaction(id, transaction);
            } else {
                addTransaction(transaction);
            }
            
            // Close modal and reset form
            if (transactionModal) transactionModal.classList.add('hidden');
            resetTransactionForm();
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const id = document.getElementById('transaction-id').value;
            
            if (id && confirm('Are you sure you want to delete this transaction?')) {
                deleteTransaction(id);
                
                // Close modal and reset form
                if (transactionModal) transactionModal.classList.add('hidden');
                resetTransactionForm();
            }
        });
    }
}

/**
 * Set up filters and search functionality
 */
function setupFiltersAndSearch() {
    const searchInput = document.getElementById('search-transactions');
    const filterType = document.getElementById('filter-type');
    const filterCategory = document.getElementById('filter-category');
    
    // Function to apply all filters
    const applyFilters = () => {
        const searchText = searchInput ? searchInput.value : '';
        const type = filterType ? filterType.value : 'all';
        const category = filterCategory ? filterCategory.value : 'all';
        
        // Get current month/year
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        
        filterTransactions(searchText, type, category, month, year);
    };
    
    // Apply filters when any filter changes
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    if (filterType) {
        filterType.addEventListener('change', applyFilters);
    }
    
    if (filterCategory) {
        filterCategory.addEventListener('change', applyFilters);
    }
    
    // Listen for transaction updates to refresh table
    window.addEventListener('transactionsUpdated', renderTransactionsTable);
    window.addEventListener('transactionsPaginated', renderTransactionsTable);
}

/**
 * Set up pagination controls
 */
function setupPagination() {
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            changePage(-1);
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            changePage(1);
        });
    }
}

/**
 * Render transactions table
 */
export function renderTransactionsTable() {
    const tableBody = document.getElementById('transactions-list');
    const pageIndicator = document.getElementById('page-indicator');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (!tableBody) return;
    
    // Get paginated transactions
    const pagination = getPaginatedTransactions();
    const { items, currentPage, totalPages, hasPreviousPage, hasNextPage } = pagination;
    
    // Clear current table
    tableBody.innerHTML = '';
    
    // Update pagination controls
    if (pageIndicator) {
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    }
    
    if (prevPageBtn) {
        prevPageBtn.disabled = !hasPreviousPage;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = !hasNextPage;
    }
    
    // If no transactions, show message
    if (items.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" class="empty-message">No transactions found for this period.</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Create table rows
    items.forEach(transaction => {
        const row = document.createElement('tr');
        row.className = transaction.type === 'income' ? 'income-row' : 'expense-row';
        
        // Format date
        const date = formatDate(transaction.date);
        
        // Create the row content
        row.innerHTML = `
            <td>${date}</td>
            <td>${transaction.description}</td>
            <td>
                <span class="category-tag" style="background-color: ${getCategoryColor(transaction.category)}">
                    ${transaction.category}
                </span>
                ${transaction.recurring ? '<span class="recurring-badge"><i class="fas fa-sync-alt"></i></span>' : ''}
            </td>
            <td>${transaction.type === 'income' ? 'Income' : 'Expense'}</td>
            <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">
                ${formatCurrency(transaction.amount)}
            </td>
            <td>
                <button class="action-btn edit-btn" data-id="${transaction.id}">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        
        // Add to table
        tableBody.appendChild(row);
        
        // Add edit functionality
        const editBtn = row.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                openEditTransactionModal(transaction.id);
            });
        }
    });
}

/**
 * Open transaction modal in edit mode
 * @param {string} id - Transaction ID to edit
 */
function openEditTransactionModal(id) {
    const transaction = getTransactionById(id);
    if (!transaction) return;
    
    const modal = document.getElementById('transaction-modal');
    if (!modal) return;
    
    // Set form fields
    document.getElementById('modal-title').textContent = 'Edit Transaction';
    document.getElementById('transaction-id').value = id;
    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('date').value = transaction.date;
    document.getElementById('category').value = transaction.category;
    document.getElementById('type').value = transaction.type;
    
    const recurringCheckbox = document.getElementById('recurring');
    const recurrenceOptions = document.getElementById('recurrence-options');
    
    if (recurringCheckbox && recurrenceOptions) {
        recurringCheckbox.checked = transaction.recurring || false;
        recurrenceOptions.classList.toggle('hidden', !transaction.recurring);
        
        if (transaction.recurring && transaction.recurrenceInterval) {
            document.getElementById('recurrence-interval').value = transaction.recurrenceInterval;
        }
    }
    
    // Show delete button and open modal
    document.getElementById('delete-transaction').classList.remove('hidden');
    modal.classList.remove('hidden');
}

/**
 * Update summary numbers display
 * @param {number} income - Total income
 * @param {number} expenses - Total expenses
 */
export function updateSummaryNumbers(income, expenses) {
    const incomeElement = document.getElementById('total-income');
    const expenseElement = document.getElementById('total-expense');
    const balanceElement = document.getElementById('balance');
    const transactionCount = document.getElementById('transaction-count');
    
    if (incomeElement) {
        incomeElement.textContent = formatCurrency(income);
    }
    
    if (expenseElement) {
        expenseElement.textContent = formatCurrency(expenses);
    }
    
    if (balanceElement) {
        const balance = income - expenses;
        balanceElement.textContent = formatCurrency(balance);
        balanceElement.className = balance >= 0 ? 'summary-value positive' : 'summary-value negative';
    }
    
    if (transactionCount) {
        const count = getAllFilteredTransactions().length;
        transactionCount.textContent = count;
    }
}
