/**
 * Personal Budget Tracker
 * 
 * This script handles all functionality for the Budget Tracker application:
 * - Adding and removing transactions
 * - Calculating income, expenses, and balance
 * - Persisting data using localStorage
 * - Updating the UI based on transactions
 * - Tracking spending by category
 * - Setting and monitoring monthly budget limits
 * - Implementing Monthly Goal logic
 * - Handling recurring transactions
 * - Separating transaction lists
 */

// Global Variables
let transactions = [];
let monthlyGoal = {
    amount: 0,
    type: 'positive',
    days: 0,
    difference: 0
};

// DOM Elements
const goalAmountInput = document.getElementById('goal-amount');
const goalTypeSelect = document.getElementById('goal-type');
const goalDaysInput = document.getElementById('goal-days');
const goalDifferenceInput = document.getElementById('goal-difference');
const periodOptions = document.getElementById('period-options');
const setGoalBtn = document.getElementById('set-goal-btn');
const currentGoalElement = document.getElementById('current-goal');
const goalProgressElement = document.getElementById('goal-progress');
const goalProgressBar = document.getElementById('goal-progress-bar');

const form = document.getElementById('form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const recurrenceSelect = document.getElementById('recurrence');
const recurrenceOptions = document.getElementById('recurrence-options');
const recurrenceIntervalInput = document.getElementById('recurrence-interval');

const incomeTransactionsList = document.getElementById('income-transactions');
const expenseTransactionsList = document.getElementById('expense-transactions');
const balanceElement = document.getElementById('balance');
const incomeElement = document.getElementById('total-income');
const expenseElement = document.getElementById('total-expense');
const categoriesContainer = document.getElementById('categories-container');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    loadGoalSettings();
    updateUI();
    
    // Add event listeners for goal type selection
    goalTypeSelect.addEventListener('change', togglePeriodOptions);
    
    // Add event listeners for recurrence selection
    recurrenceSelect.addEventListener('change', toggleRecurrenceOptions);
});

form.addEventListener('submit', addTransaction);
setGoalBtn.addEventListener('click', setMonthlyGoal);

// Monthly Goal Functions
function togglePeriodOptions() {
    if (goalTypeSelect.value === 'period') {
        periodOptions.classList.remove('hidden');
    } else {
        periodOptions.classList.add('hidden');
    }
}

function setMonthlyGoal() {
    const goalAmount = parseFloat(goalAmountInput.value);
    const goalType = goalTypeSelect.value;
    
    if (isNaN(goalAmount) || goalAmount <= 0) {
        alert('Please enter a valid positive number for your goal amount.');
        return;
    }
    
    monthlyGoal.amount = goalAmount;
    monthlyGoal.type = goalType;
    
    if (goalType === 'period') {
        const days = parseInt(goalDaysInput.value);
        const difference = parseFloat(goalDifferenceInput.value);
        
        if (isNaN(days) || days <= 0) {
            alert('Please enter a valid number of days.');
            return;
        }
        
        if (isNaN(difference)) {
            alert('Please enter a valid target difference.');
            return;
        }
        
        monthlyGoal.days = days;
        monthlyGoal.difference = difference;
    }
    
    // Save goal settings to localStorage
    localStorage.setItem('monthlyGoal', JSON.stringify(monthlyGoal));
    
    updateGoalDisplay();
    alert('Goal set successfully!');
}

function loadGoalSettings() {
    const savedGoal = localStorage.getItem('monthlyGoal');
    if (savedGoal) {
        monthlyGoal = JSON.parse(savedGoal);
        goalAmountInput.value = monthlyGoal.amount;
        goalTypeSelect.value = monthlyGoal.type;
        
        if (monthlyGoal.type === 'period') {
            periodOptions.classList.remove('hidden');
            goalDaysInput.value = monthlyGoal.days;
            goalDifferenceInput.value = monthlyGoal.difference;
        }
        
        updateGoalDisplay();
    }
}

function updateGoalDisplay() {
    // Display the current goal settings
    if (monthlyGoal.amount > 0) {
        let goalDescription = '';
        let currentStatus = evaluateGoalStatus();
        
        if (monthlyGoal.type === 'positive') {
            goalDescription = `Goal: Be above $${monthlyGoal.amount.toFixed(2)}`;
        } else if (monthlyGoal.type === 'negative') {
            goalDescription = `Goal: Be below $${monthlyGoal.amount.toFixed(2)}`;
        } else if (monthlyGoal.type === 'period') {
            goalDescription = `Goal: Be ${monthlyGoal.difference >= 0 ? 'above' : 'below'} $${Math.abs(monthlyGoal.difference).toFixed(2)} after ${monthlyGoal.days} days`;
        }
        
        currentGoalElement.textContent = goalDescription;
        goalProgressElement.textContent = currentStatus.message;
        
        // Update progress bar
        goalProgressBar.style.width = `${currentStatus.percentage}%`;
        
        if (currentStatus.onTrack) {
            goalProgressElement.style.color = '#28a745'; // Green
            goalProgressBar.classList.remove('off-track');
        } else {
            goalProgressElement.style.color = '#dc3545'; // Red
            goalProgressBar.classList.add('off-track');
        }
    } else {
        currentGoalElement.textContent = 'No goal set';
        goalProgressElement.textContent = 'Set a goal to track your progress';
        goalProgressBar.style.width = '0%';
    }
}

function evaluateGoalStatus() {
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    const balance = totalIncome - totalExpenses;
    
    let onTrack = false;
    let message = '';
    let percentage = 0;
    
    if (monthlyGoal.type === 'positive') {
        // Goal: Be above a certain amount
        percentage = Math.min((balance / monthlyGoal.amount) * 100, 100);
        onTrack = balance >= monthlyGoal.amount;
        message = onTrack 
            ? `On track! Current balance: $${balance.toFixed(2)}` 
            : `Off track. Current balance: $${balance.toFixed(2)}. Need $${(monthlyGoal.amount - balance).toFixed(2)} more.`;
    } else if (monthlyGoal.type === 'negative') {
        // Goal: Be below a certain amount (typically for expense tracking)
        percentage = Math.min((totalExpenses / monthlyGoal.amount) * 100, 100);
        onTrack = totalExpenses <= monthlyGoal.amount;
        message = onTrack 
            ? `On track! Current expenses: $${totalExpenses.toFixed(2)}` 
            : `Off track. Current expenses: $${totalExpenses.toFixed(2)}. $${(totalExpenses - monthlyGoal.amount).toFixed(2)} over limit.`;
    } else if (monthlyGoal.type === 'period') {
        // Goal: Achieve target difference after X days
        // This is more complex and may require projections based on transaction history
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const daysPassed = Math.floor((today - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;
        const daysRemaining = monthlyGoal.days - daysPassed;
        
        // Calculate projected balance based on current rate
        const dailyRate = daysPassed > 0 ? balance / daysPassed : 0;
        const projectedBalance = balance + (dailyRate * daysRemaining);
        
        if (monthlyGoal.difference >= 0) {
            // Goal to be above a target
            onTrack = projectedBalance >= monthlyGoal.difference;
            percentage = Math.min((projectedBalance / monthlyGoal.difference) * 100, 100);
        } else {
            // Goal to be below a target (absolute value used for comparison)
            onTrack = projectedBalance <= Math.abs(monthlyGoal.difference);
            percentage = Math.min((Math.abs(monthlyGoal.difference) / Math.abs(projectedBalance)) * 100, 100);
        }
        
        message = onTrack 
            ? `On track! Projected balance: $${projectedBalance.toFixed(2)} after ${monthlyGoal.days} days` 
            : `Off track. Projected balance: $${projectedBalance.toFixed(2)}. Target: $${Math.abs(monthlyGoal.difference).toFixed(2)} after ${monthlyGoal.days} days.`;
    }
    
    return { onTrack, message, percentage };
}

// Recurrence Options Functions
function toggleRecurrenceOptions() {
    if (recurrenceSelect.value === 'recurring') {
        recurrenceOptions.classList.remove('hidden');
    } else {
        recurrenceOptions.classList.add('hidden');
    }
}

// Transaction Functions
function addTransaction(e) {
    e.preventDefault();
    
    const description = descriptionInput.value;
    const amount = parseFloat(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;
    const recurrence = recurrenceSelect.value;
    const recurrenceInterval = recurrence === 'recurring' ? parseInt(recurrenceIntervalInput.value) : 0;
    
    if (description.trim() === '' || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid description and amount.');
        return;
    }
    
    if (category === '') {
        alert('Please select a category.');
        return;
    }
    
    if (recurrence === 'recurring' && (isNaN(recurrenceInterval) || recurrenceInterval <= 0)) {
        alert('Please enter a valid recurrence interval.');
        return;
    }
    
    const transaction = {
        id: generateID(),
        description,
        amount,
        type,
        category,
        recurrence,
        recurrenceInterval,
        date: new Date().toISOString()
    };
    
    transactions.push(transaction);
    updateLocalStorage();
    updateUI();
    
    // Reset form
    form.reset();
    categorySelect.value = '';
    recurrenceOptions.classList.add('hidden');
}

function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    updateUI();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactions() {
    const storedTransactions = localStorage.getItem('transactions');
    transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
}

function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// UI Update Functions
function updateUI() {
    updateTransactionLists();
    updateSummary();
    updateCategoryBreakdown();
    updateGoalDisplay();
}

function updateTransactionLists() {
    incomeTransactionsList.innerHTML = '';
    expenseTransactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
        const incomeMessageElement = document.createElement('li');
        incomeMessageElement.textContent = 'No income transactions yet.';
        incomeTransactionsList.appendChild(incomeMessageElement);
        
        const expenseMessageElement = document.createElement('li');
        expenseMessageElement.textContent = 'No expense transactions yet.';
        expenseTransactionsList.appendChild(expenseMessageElement);
        return;
    }
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    sortedTransactions.forEach(transaction => {
        const listElement = document.createElement('li');
        listElement.setAttribute('data-id', transaction.id);
        
        const transactionDate = new Date(transaction.date);
        const formattedDate = transactionDate.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        
        listElement.innerHTML = `
            <div class="transaction-left">
                <span class="transaction-description">${transaction.description}</span>
                <span class="transaction-category">${transaction.category}</span>
                ${transaction.recurrence === 'recurring' ? `<span class="recurring-badge">Recurring (${transaction.recurrenceInterval} days)</span>` : ''}
                <span class="transaction-date">${formattedDate}</span>
            </div>
            <div class="transaction-right">
                <span class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'} $${transaction.amount.toFixed(2)}
                </span>
                <button class="delete-btn">×</button>
            </div>
        `;
        
        listElement.querySelector('.delete-btn').addEventListener('click', function() {
            deleteTransaction(transaction.id);
        });
        
        if (transaction.type === 'income') {
            incomeTransactionsList.appendChild(listElement);
        } else {
            expenseTransactionsList.appendChild(listElement);
        }
    });
}

function updateSummary() {
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    const balance = totalIncome - totalExpenses;
    
    balanceElement.textContent = `$${balance.toFixed(2)}`;
    incomeElement.textContent = `$${totalIncome.toFixed(2)}`;
    expenseElement.textContent = `$${totalExpenses.toFixed(2)}`;
    
    balanceElement.className = balance >= 0 ? 'positive' : 'negative';
}

function calculateTotalIncome() {
    return transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);
}

function calculateTotalExpenses() {
    return transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);
}

function updateCategoryBreakdown() {
    categoriesContainer.innerHTML = '';
    
    // Create a map to store category totals
    const categoryTotals = {};
    
    // Calculate totals for each category
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            if (!categoryTotals[transaction.category]) {
                categoryTotals[transaction.category] = 0;
            }
            categoryTotals[transaction.category] += transaction.amount;
        }
    });
    
    // Sort categories by amount (highest first)
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);
    
    if (sortedCategories.length === 0) {
        const noDataElement = document.createElement('p');
        noDataElement.textContent = 'No expense data yet.';
        categoriesContainer.appendChild(noDataElement);
        return;
    }
    
    // Calculate the total expenses for percentage calculation
    const totalExpenses = calculateTotalExpenses();
    
    // Create and append category items
    sortedCategories.forEach(([category, amount]) => {
        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
        
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        
        categoryItem.innerHTML = `
            <div class="category-info">
                <span class="category-name">${category}</span>
                <span class="category-percentage">${percentage}%</span>
            </div>
            <div class="category-bar-container">
                <div class="category-bar" style="width: ${percentage}%"></div>
            </div>
            <span class="category-amount">$${amount.toFixed(2)}</span>
        `;
        
        categoriesContainer.appendChild(categoryItem);
    });
}
