/**
 * main.js - Consolidated Budget Tracker functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Debug mode
    const DEBUG = true;
    
    // Debug logging function
    function debugLog(message) {
        if (DEBUG) {
            console.log(`[DEBUG] ${message}`);
        }
    }
    
    // Error handler for localStorage operations
    function handleStorageError(action, error) {
        console.error(`[Storage Error] Failed to ${action}: ${error.message}`);
        alert(`Storage Error: ${error.message}\n\nYour browser may have localStorage disabled or in private browsing mode.`);
    }
    
    // Check localStorage availability
    function isLocalStorageAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.error('localStorage is not available:', e);
            return false;
        }
    }
    
    // Show warning if localStorage is not available
    if (!isLocalStorageAvailable()) {
        alert('Warning: Local storage is not available. Your data will not be saved between sessions. Try using a different browser or disable private browsing mode.');
    } else {
        debugLog('localStorage is available and working');
    }

    // Global variables
    let transactions = [];
    let filteredTransactions = [];
    let currentMonth;
    let currentYear;
    let currentPage = 1;
    const itemsPerPage = 10;

    // Chart variables
    let summaryChart = null;
    let categoryChart = null;
    let summaryChartCtx;
    let categoryChartCtx;

    // DOM Elements
    // Month navigation
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // Summary elements
    const balanceElement = document.getElementById('balance-value');
    const incomeElement = document.getElementById('income-value');
    const expenseElement = document.getElementById('expense-value');
    const transactionCountElement = document.getElementById('transaction-count');

    // Transaction elements
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const transactionModal = document.getElementById('transaction-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.querySelector('#transaction-modal .close-btn');
    const transactionForm = document.getElementById('transaction-form');
    const transactionIdInput = document.getElementById('transaction-id');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');
    const categorySelect = document.getElementById('category');
    const typeSelect = document.getElementById('type');
    const recurringCheckbox = document.getElementById('recurring');
    const recurrenceOptions = document.getElementById('recurrence-options');
    const recurrenceIntervalSelect = document.getElementById('recurrence-interval');
    const deleteTransactionBtn = document.getElementById('delete-transaction');

    // Quick add elements
    const quickForm = document.getElementById('quick-add-form');
    const quickDescriptionInput = document.getElementById('quick-description');
    const quickAmountInput = document.getElementById('quick-amount');
    const quickCategorySelect = document.getElementById('quick-category');
    const quickTypeSelect = document.getElementById('quick-type');
    const quickRecurringCheckbox = document.getElementById('quick-recurring');
    const quickRecurrenceOptions = document.getElementById('quick-recurrence-options');
    const quickRecurrenceIntervalSelect = document.getElementById('quick-recurrence-interval');

    // Filter and pagination elements
    const searchInput = document.getElementById('search-input');
    const filterTypeSelect = document.getElementById('filter-type');
    const filterCategorySelect = document.getElementById('filter-category');
    const transactionsList = document.getElementById('transactions-list');
    const noTransactionsMessage = document.getElementById('no-transactions');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');

    // Goal elements
    const goalForm = document.getElementById('goal-form');
    const goalTypeSelect = document.getElementById('goal-type');
    const goalAmountInput = document.getElementById('goal-amount');
    const goalPeriodContainer = document.getElementById('goal-period-container');
    const goalPeriodInput = document.getElementById('goal-period');
    const goalDisplay = document.getElementById('goal-display');
    const noGoalMessage = document.getElementById('no-goal-message');
    const goalTypeDisplay = document.getElementById('goal-type-display');
    const goalCurrentValue = document.getElementById('goal-current-value');
    const goalProgressContainer = document.getElementById('goal-progress-container');
    const goalProgressBar = document.getElementById('goal-progress-bar');
    const goalPercentage = document.getElementById('goal-percentage');

    // Category breakdown elements
    const categoriesContainer = document.getElementById('categories-container');

    // Helper Functions
    function generateID() {
        return Math.random().toString(36).substr(2, 9);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    // Initialize the application
    function initializeApp() {
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

    // Month Navigation Functions
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

    function updateMonthDisplay() {
        const date = new Date(currentYear, currentMonth - 1, 1);
        currentMonthElement.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    // Transactions Functions
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
        
        // Get month and year from the date
        const dateObj = new Date(date);
        const month = dateObj.getMonth() + 1; // JavaScript months are 0-based
        const year = dateObj.getFullYear();
        
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
            month,
            year
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
        
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        const dateStr = today.toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
        
        const transaction = {
            id: generateID(),
            description,
            amount,
            date: dateStr,
            category,
            type,
            recurring,
            recurrenceInterval,
            month,
            year
        };
        
        transactions.push(transaction);
        updateLocalStorage();
        quickForm.reset();
        quickRecurrenceOptions.classList.add('hidden');
        updateUI();
    }

    function deleteTransaction(id) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        updateLocalStorage();
    }

    function updateLocalStorage() {
        try {
            localStorage.setItem('transactions', JSON.stringify(transactions));
        } catch (e) {
            handleStorageError('save transactions', e);
        }
    }

    function loadTransactions() {
        try {
            const savedTransactions = localStorage.getItem('transactions');
            if (savedTransactions) {
                transactions = JSON.parse(savedTransactions);
            }
        } catch (e) {
            handleStorageError('load transactions', e);
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

    // Transaction Filtering and UI
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

    function updateTransactionTable() {
        // Clear existing rows
        transactionsList.innerHTML = '';
        
        if (filteredTransactions.length === 0) {
            noTransactionsMessage.classList.remove('hidden');
            transactionsList.parentElement.classList.add('hidden');
            prevPageBtn.disabled = true;
            nextPageBtn.disabled = true;
            pageIndicator.textContent = 'Page 1 of 1';
            return;
        }
        
        // Show the table and hide the no transactions message
        noTransactionsMessage.classList.add('hidden');
        transactionsList.parentElement.classList.remove('hidden');
        
        // Calculate pagination
        const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredTransactions.length);
        const paginatedTransactions = filteredTransactions.slice(start, end);
        
        // Update pagination controls
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        
        // Render transactions
        paginatedTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            // Date column
            const dateCell = document.createElement('td');
            const dateObj = new Date(transaction.date);
            dateCell.textContent = dateObj.toLocaleDateString();
            row.appendChild(dateCell);
            
            // Description column
            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = transaction.description;
            if (transaction.recurring) {
                const recurringBadge = document.createElement('span');
                recurringBadge.className = 'badge recurring';
                recurringBadge.textContent = 'Recurring';
                descriptionCell.appendChild(recurringBadge);
            }
            row.appendChild(descriptionCell);
            
            // Category column
            const categoryCell = document.createElement('td');
            categoryCell.textContent = transaction.category;
            row.appendChild(categoryCell);
            
            // Type column
            const typeCell = document.createElement('td');
            typeCell.textContent = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
            row.appendChild(typeCell);
            
            // Amount column
            const amountCell = document.createElement('td');
            amountCell.textContent = `$${transaction.amount.toFixed(2)}`;
            amountCell.className = transaction.type === 'income' ? 'positive' : 'negative';
            row.appendChild(amountCell);
            
            // Actions column
            const actionsCell = document.createElement('td');
            actionsCell.className = 'transaction-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'small-btn';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => openEditTransactionModal(transaction.id));
            actionsCell.appendChild(editBtn);
            
            row.appendChild(actionsCell);
            
            transactionsList.appendChild(row);
        });
    }

    // General UI update function
    function updateUI() {
        filterTransactions(); // This will also update the transaction table
        updateSummary();
        updateCategoryBreakdown();
        updateGoalDisplay();
    }

    // Summary calculations
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

    function updateSummary() {
        const currentMonthTransactions = transactions.filter(
            t => t.month === currentMonth && t.year === currentYear
        );
        
        const totalIncome = calculateTotalIncome();
        const totalExpenses = calculateTotalExpenses();
        const balance = totalIncome - totalExpenses;
        
        incomeElement.textContent = `$${totalIncome.toFixed(2)}`;
        expenseElement.textContent = `$${totalExpenses.toFixed(2)}`;
        balanceElement.textContent = `$${balance.toFixed(2)}`;
        balanceElement.className = balance >= 0 ? 'summary-value positive' : 'summary-value negative';
        
        transactionCountElement.textContent = currentMonthTransactions.length;
        
        updateSummaryChart(totalIncome, totalExpenses);
    }

    // Chart Functions
    function updateSummaryChart(income, expenses) {
        if (summaryChartCtx) {
            if (summaryChart) {
                summaryChart.destroy();
            }
            
            summaryChart = new Chart(summaryChartCtx, {
                type: 'bar',
                data: {
                    labels: ['Income', 'Expenses'],
                    datasets: [{
                        label: 'Amount ($)',
                        data: [income, expenses],
                        backgroundColor: ['rgba(40, 167, 69, 0.7)', 'rgba(220, 53, 69, 0.7)'],
                        borderColor: ['rgba(40, 167, 69, 1)', 'rgba(220, 53, 69, 1)'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value;
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    function updateCategoryBreakdown() {
        // Clear previous categories
        categoriesContainer.innerHTML = '';
        
        // Get all expense transactions for the current month
        const expenseTransactions = transactions.filter(
            t => t.type === 'expense' && t.month === currentMonth && t.year === currentYear
        );
        
        if (expenseTransactions.length === 0) {
            categoriesContainer.innerHTML = '<p>No expenses for this month yet.</p>';
            updateCategoryChart([]);
            return;
        }
        
        // Group by category and sum amounts
        const categories = {};
        const totalExpenses = calculateTotalExpenses();
        
        expenseTransactions.forEach(transaction => {
            if (!categories[transaction.category]) {
                categories[transaction.category] = 0;
            }
            categories[transaction.category] += transaction.amount;
        });
        
        // Sort categories by amount (descending)
        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: (amount / totalExpenses) * 100
            }));
        
        // Create category items
        sortedCategories.forEach(item => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            
            const categoryInfo = document.createElement('div');
            categoryInfo.className = 'category-info';
            
            const categoryName = document.createElement('div');
            categoryName.className = 'category-name';
            categoryName.textContent = item.category.charAt(0).toUpperCase() + item.category.slice(1);
            
            const categoryPercentage = document.createElement('div');
            categoryPercentage.className = 'category-percentage';
            categoryPercentage.textContent = `${item.percentage.toFixed(1)}%`;
            
            categoryInfo.appendChild(categoryName);
            categoryInfo.appendChild(categoryPercentage);
            
            const categoryBarContainer = document.createElement('div');
            categoryBarContainer.className = 'category-bar-container';
            
            const categoryBar = document.createElement('div');
            categoryBar.className = 'category-bar';
            categoryBar.style.width = `${item.percentage}%`;
            
            categoryBarContainer.appendChild(categoryBar);
            
            const categoryAmount = document.createElement('div');
            categoryAmount.className = 'category-amount';
            categoryAmount.textContent = `$${item.amount.toFixed(2)}`;
            
            categoryItem.appendChild(categoryInfo);
            categoryItem.appendChild(categoryBarContainer);
            categoryItem.appendChild(categoryAmount);
            
            categoriesContainer.appendChild(categoryItem);
        });
        
        updateCategoryChart(sortedCategories);
    }

    function updateCategoryChart(categories) {
        if (categoryChartCtx) {
            if (categoryChart) {
                categoryChart.destroy();
            }
            
            if (categories.length === 0) {
                return;
            }
            
            // Limit to top 5 categories for clarity
            const topCategories = categories.slice(0, 5);
            
            categoryChart = new Chart(categoryChartCtx, {
                type: 'doughnut',
                data: {
                    labels: topCategories.map(c => c.category),
                    datasets: [{
                        data: topCategories.map(c => c.amount),
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 12,
                                font: {
                                    size: 10
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw;
                                    const percentage = ((value / categories.reduce((sum, cat) => sum + cat.amount, 0)) * 100).toFixed(1);
                                    return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // Goal Functions
    function toggleGoalPeriodSection() {
        if (goalTypeSelect.value === 'period') {
            goalPeriodContainer.classList.remove('hidden');
        } else {
            goalPeriodContainer.classList.add('hidden');
        }
    }

    function saveGoalSettings(e) {
        if (e) e.preventDefault();
        
        const goalType = goalTypeSelect.value;
        const goalAmount = parseFloat(goalAmountInput.value);
        
        if (isNaN(goalAmount) || goalAmount <= 0) {
            alert('Please enter a valid goal amount');
            return;
        }
        
        let goal = {
            type: goalType,
            amount: goalAmount,
            days: 0,
            difference: 0
        };
        
        if (goalType === 'period') {
            const days = parseInt(goalPeriodInput.value);
            
            if (isNaN(days) || days <= 0) {
                alert('Please enter a valid number of days for your goal period');
                return;
            }
            
            goal.days = days;
            goal.difference = parseFloat(goalPeriodInput.value) || 0;
        }
        
        // Save goal settings to localStorage with the month and year
        const monthYearKey = `${currentMonth}-${currentYear}`;
        try {
            localStorage.setItem(`monthlyGoal-${monthYearKey}`, JSON.stringify(goal));
        } catch (e) {
            handleStorageError('save goal settings', e);
        }
        
        updateGoalDisplay();
        alert('Goal set successfully!');
    }

    function loadGoalSettings() {
        const monthYearKey = `${currentMonth}-${currentYear}`;
        try {
            const savedGoal = localStorage.getItem(`monthlyGoal-${monthYearKey}`);
            if (savedGoal) {
                const goal = JSON.parse(savedGoal);
                
                goalTypeSelect.value = goal.type;
                goalAmountInput.value = goal.amount;
                
                if (goal.type === 'period') {
                    goalPeriodContainer.classList.remove('hidden');
                    goalPeriodInput.value = goal.days;
                } else {
                    goalPeriodContainer.classList.add('hidden');
                }
                
                goalDisplay.classList.remove('hidden');
                noGoalMessage.classList.add('hidden');
            } else {
                goalDisplay.classList.add('hidden');
                noGoalMessage.classList.remove('hidden');
                
                // Reset goal form
                goalAmountInput.value = '';
                goalTypeSelect.value = 'positive';
                goalPeriodInput.value = '';
                goalPeriodContainer.classList.add('hidden');
            }
        } catch (e) {
            handleStorageError('load goal settings', e);
        }
        
        updateGoalDisplay();
    }

    function updateGoalDisplay() {
        const monthYearKey = `${currentMonth}-${currentYear}`;
        try {
            const savedGoal = localStorage.getItem(`monthlyGoal-${monthYearKey}`);
            if (!savedGoal) {
                return;
            }
        } catch (e) {
            handleStorageError('load goal settings', e);
            return;
        }
        
        const goal = JSON.parse(savedGoal);
        
        // Calculate current progress based on goal type
        const totalIncome = calculateTotalIncome();
        const totalExpenses = calculateTotalExpenses();
        const balance = totalIncome - totalExpenses;
        
        let goalDescription = '';
        let currentValue = 0;
        let targetValue = goal.amount;
        let percentage = 0;
        let onTrack = false;
        
        if (goal.type === 'positive') {
            // Goal: Be above a certain amount
            goalDescription = `Goal: Achieve Balance Above $${goal.amount.toFixed(2)}`;
            currentValue = balance;
            percentage = Math.min((balance / goal.amount) * 100, 100);
            onTrack = balance >= goal.amount;
        } else if (goal.type === 'negative') {
            // Goal: Be below a certain amount (typically for expense tracking)
            goalDescription = `Goal: Keep Expenses Below $${goal.amount.toFixed(2)}`;
            currentValue = totalExpenses;
            percentage = (1 - Math.min(totalExpenses / goal.amount, 1)) * 100;
            onTrack = totalExpenses <= goal.amount;
        } else if (goal.type === 'period') {
            // Goal: Achieve target difference after X days
            const startDate = new Date(currentYear, currentMonth - 1, 1);
            const currentDate = new Date();
            const daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const daysRemaining = goal.days - daysPassed;
            
            goalDescription = `Goal: ${goal.difference >= 0 ? 'Increase' : 'Decrease'} by $${Math.abs(goal.difference).toFixed(2)} in ${goal.days} days`;
            currentValue = balance;
            percentage = (daysPassed / goal.days) * 100;
            
            // Check if on track based on daily rate needed
            const dailyRateNeeded = goal.difference / goal.days;
            const currentDailyRate = daysPassed > 0 ? balance / daysPassed : 0;
            onTrack = (goal.difference >= 0 && currentDailyRate >= dailyRateNeeded) || 
                     (goal.difference < 0 && currentDailyRate <= dailyRateNeeded);
        }
        
        // Update the goal display
        goalTypeDisplay.textContent = goalDescription;
        goalCurrentValue.textContent = `$${currentValue.toFixed(2)}`;
        
        // Update progress bar
        percentage = Math.min(100, Math.max(0, percentage));
        goalProgressBar.style.width = `${percentage}%`;
        goalPercentage.textContent = `${percentage.toFixed(1)}%`;
        
        // Set progress bar color based on whether we're on track
        if (onTrack) {
            goalProgressBar.className = 'progress-bar success';
        } else {
            goalProgressBar.className = 'progress-bar danger';
        }
    }

    initializeApp();
});
