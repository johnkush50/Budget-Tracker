/**
 * transactions.js - Transaction Management
 * Handles adding, editing, deleting, and filtering transactions
 */

// Transaction Modal Functions
function openAddTransactionModal() {
    modalTitle.textContent = 'Add Transaction';
    transactionForm.reset();
    transactionIdInput.value = '';
    dateInput.valueAsDate = new Date();
    deleteTransactionBtn.classList.add('hidden');
    transactionModal.classList.remove('hidden');
}

function openEditTransactionModal(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    modalTitle.textContent = 'Edit Transaction';
    transactionIdInput.value = transaction.id;
    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    dateInput.value = transaction.date;
    categorySelect.value = transaction.category;
    typeSelect.value = transaction.type;
    
    if (transaction.recurring) {
        recurringCheckbox.checked = true;
        recurrenceOptions.classList.remove('hidden');
        recurrenceIntervalSelect.value = transaction.recurrenceInterval;
    } else {
        recurringCheckbox.checked = false;
        recurrenceOptions.classList.add('hidden');
    }
    
    deleteTransactionBtn.classList.remove('hidden');
    transactionModal.classList.remove('hidden');
}

function closeModal() {
    transactionModal.classList.add('hidden');
}

function saveTransaction(e) {
    e.preventDefault();
    
    const id = transactionIdInput.value || generateID();
    const description = descriptionInput.value;
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;
    const category = categorySelect.value;
    const type = typeSelect.value;
    const recurring = recurringCheckbox.checked;
    const recurrenceInterval = recurring ? recurrenceIntervalSelect.value : '';
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }
    
    // Check if this is an edit or a new transaction
    const existingIndex = transactions.findIndex(t => t.id === id);
    
    const transaction = {
        id,
        description,
        amount,
        date,
        category,
        type,
        recurring,
        recurrenceInterval,
        month: parseInt(date.split('-')[1]),
        year: parseInt(date.split('-')[0])
    };
    
    if (existingIndex !== -1) {
        transactions[existingIndex] = transaction;
    } else {
        transactions.push(transaction);
    }
    
    updateLocalStorage();
    closeModal();
    updateUI();
}

function confirmDeleteTransaction() {
    const id = transactionIdInput.value;
    if (confirm('Are you sure you want to delete this transaction?')) {
        deleteTransaction(id);
        closeModal();
        updateUI();
    }
}

// Quick Add Transaction Function
function handleQuickAdd(e) {
    e.preventDefault();
    
    const description = quickDescriptionInput.value;
    const amount = parseFloat(quickAmountInput.value);
    const category = quickCategorySelect.value;
    const type = quickTypeSelect.value;
    const recurring = quickRecurringCheckbox.checked;
    const recurrenceInterval = recurring ? quickRecurrenceIntervalSelect.value : '';
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    
    const transaction = {
        id: generateID(),
        description,
        amount,
        date: today,
        category,
        type,
        recurring,
        recurrenceInterval,
        month: parseInt(today.split('-')[1]),
        year: parseInt(today.split('-')[0])
    };
    
    transactions.push(transaction);
    updateLocalStorage();
    quickForm.reset();
    quickRecurrenceOptions.classList.add('hidden');
    updateUI();
}

// Transaction CRUD Functions
function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactions() {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
}

// Recurrence Options Functions
function toggleRecurrenceOptions() {
    if (recurringCheckbox.checked) {
        recurrenceOptions.classList.remove('hidden');
    } else {
        recurrenceOptions.classList.add('hidden');
    }
}

function toggleQuickRecurrenceOptions() {
    if (quickRecurringCheckbox.checked) {
        quickRecurrenceOptions.classList.remove('hidden');
    } else {
        quickRecurrenceOptions.classList.add('hidden');
    }
}

// Transaction Filtering and Pagination
function filterTransactions() {
    const searchText = searchInput.value.toLowerCase();
    const typeFilter = filterTypeSelect.value;
    const categoryFilter = filterCategorySelect.value;
    
    // Reset to first page when filtering changes
    currentPage = 1;
    
    // Filter transactions for the current month/year
    filteredTransactions = transactions.filter(transaction => {
        const matchesMonthYear = transaction.month === currentMonth && transaction.year === currentYear;
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
        const matchesSearch = searchText === '' || 
            transaction.description.toLowerCase().includes(searchText) || 
            transaction.category.toLowerCase().includes(searchText);
        
        return matchesMonthYear && matchesType && matchesCategory && matchesSearch;
    });
    
    updateTransactionTable();
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
    currentPage += direction;
    
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    updateTransactionTable();
}

// Transaction summary calculations
function calculateTotalIncome() {
    return transactions
        .filter(t => t.type === 'income' && t.month === currentMonth && t.year === currentYear)
        .reduce((total, transaction) => total + transaction.amount, 0);
}

function calculateTotalExpenses() {
    return transactions
        .filter(t => t.type === 'expense' && t.month === currentMonth && t.year === currentYear)
        .reduce((total, transaction) => total + transaction.amount, 0);
}
