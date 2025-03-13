/**
 * goals.js - Handles budget goal management
 */

import { formatCurrency, toggleClass, generateId } from './utils.js';
import { saveData, loadData, STORAGE_KEYS } from './storage.js';
import { calculateTotalIncome, calculateTotalExpenses, getCategoryBreakdown } from './transactions.js';
import { getCurrentMonthYear } from './navigation.js';
import { getCategoryColor } from './charts.js';

// Goals state
let goals = [];
let isEditMode = false;
let editGoalId = null;

/**
 * Initialize goals module
 */
export function initGoals() {
    loadGoals();
    renderGoalsList();
}

/**
 * Set up goals-related event listeners
 */
export function setupGoalListeners() {
    // Add goal button
    const addGoalBtn = document.getElementById('add-goal-btn');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', showGoalForm);
    }
    
    // Save goal button
    const saveGoalBtn = document.getElementById('save-goal-btn');
    if (saveGoalBtn) {
        saveGoalBtn.addEventListener('click', saveGoal);
    }
    
    // Cancel goal button
    const cancelGoalBtn = document.getElementById('cancel-goal-btn');
    if (cancelGoalBtn) {
        cancelGoalBtn.addEventListener('click', hideGoalForm);
    }
    
    // Goal type change - toggle appropriate fields
    const goalTypeSelect = document.getElementById('goal-type');
    if (goalTypeSelect) {
        goalTypeSelect.addEventListener('change', toggleGoalFields);
    }
    
    // Listen for transactions or month changes to update goals display
    window.addEventListener('transactionsUpdated', renderGoalsList);
    window.addEventListener('monthChanged', renderGoalsList);
}

/**
 * Show the goal form
 */
function showGoalForm() {
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
        goalForm.classList.remove('hidden');
        document.getElementById('add-goal-btn').classList.add('hidden');
        
        // Reset form to default state
        resetGoalForm();
    }
}

/**
 * Hide the goal form
 */
function hideGoalForm() {
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
        goalForm.classList.add('hidden');
        document.getElementById('add-goal-btn').classList.remove('hidden');
        
        // Reset edit mode
        isEditMode = false;
        editGoalId = null;
    }
}

/**
 * Reset goal form fields
 */
function resetGoalForm() {
    const form = document.getElementById('goal-form');
    const goalType = document.getElementById('goal-type');
    const categorySelector = document.getElementById('category-selector');
    const savingsPercent = document.getElementById('savings-percent');
    
    if (form) form.reset();
    
    // Reset conditional fields
    if (categorySelector) categorySelector.classList.add('hidden');
    if (savingsPercent) savingsPercent.classList.add('hidden');
}

/**
 * Toggle goal form fields based on selected goal type
 */
function toggleGoalFields() {
    const goalType = document.getElementById('goal-type').value;
    const categorySelector = document.getElementById('category-selector');
    const savingsPercent = document.getElementById('savings-percent');
    const goalAmountInput = document.getElementById('goal-amount');
    
    // Show/hide category selector
    if (categorySelector) {
        categorySelector.classList.toggle('hidden', goalType !== 'category');
    }
    
    // Show/hide savings percentage input and modify amount label
    if (savingsPercent) {
        savingsPercent.classList.toggle('hidden', goalType !== 'savings');
    }
    
    // Update amount placeholder based on goal type
    if (goalAmountInput) {
        switch (goalType) {
            case 'balance':
                goalAmountInput.placeholder = 'Target balance amount';
                break;
            case 'expense':
                goalAmountInput.placeholder = 'Maximum expense amount';
                break;
            case 'category':
                goalAmountInput.placeholder = 'Category budget amount';
                break;
            case 'savings':
                goalAmountInput.placeholder = 'Target savings amount';
                break;
        }
    }
}

/**
 * Save a new goal or update an existing one
 */
function saveGoal() {
    const goalType = document.getElementById('goal-type');
    const goalAmount = document.getElementById('goal-amount');
    const goalCategory = document.getElementById('goal-category');
    const goalPercentage = document.getElementById('goal-percentage');
    const goalRecurring = document.getElementById('goal-recurring');
    
    if (!goalType || !goalAmount) return;
    
    // Validate amount
    const amount = parseFloat(goalAmount.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid goal amount greater than zero.');
        return;
    }
    
    // For category goals, ensure a category is selected
    if (goalType.value === 'category' && (!goalCategory || !goalCategory.value)) {
        alert('Please select a category for your category budget.');
        return;
    }
    
    // For savings goals, validate percentage if provided
    let percentage = null;
    if (goalType.value === 'savings' && goalPercentage && goalPercentage.value) {
        percentage = parseFloat(goalPercentage.value);
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            alert('Please enter a valid percentage between 1 and 100.');
            return;
        }
    }
    
    // Get current month/year
    const { month, year } = getCurrentMonthYear();
    
    // Create goal object
    const goalData = {
        id: isEditMode && editGoalId ? editGoalId : generateId(),
        type: goalType.value,
        amount: amount,
        category: goalType.value === 'category' ? goalCategory.value : null,
        percentage: percentage,
        recurring: goalRecurring ? goalRecurring.checked : false,
        month: month,
        year: year,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    // Add or update goal
    if (isEditMode && editGoalId) {
        // Update existing goal
        const index = goals.findIndex(g => g.id === editGoalId);
        if (index !== -1) {
            goals[index] = { ...goals[index], ...goalData };
        }
    } else {
        // Add new goal
        goals.push(goalData);
    }
    
    // Save and update display
    saveGoals();
    renderGoalsList();
    
    // Hide form
    hideGoalForm();
}

/**
 * Delete a goal
 * @param {string} goalId - ID of the goal to delete
 */
function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        goals = goals.filter(goal => goal.id !== goalId);
        saveGoals();
        renderGoalsList();
    }
}

/**
 * Save goals to storage
 */
function saveGoals() {
    saveData(STORAGE_KEYS.BUDGET_GOAL, goals);
}

/**
 * Load goals from storage
 */
export function loadGoals() {
    const savedGoals = loadData(STORAGE_KEYS.BUDGET_GOAL, []);
    
    // Handle legacy format (convert single goal object to array if needed)
    if (savedGoals && !Array.isArray(savedGoals)) {
        // If old format with a single goal object, create a new array with it
        if (savedGoals.active) {
            const legacyGoal = {
                id: generateId(),
                type: savedGoals.type === 'positive' ? 'balance' : 
                       savedGoals.type === 'negative' ? 'expense' : 'balance',
                amount: savedGoals.amount,
                recurring: false,
                month: getCurrentMonthYear().month,
                year: getCurrentMonthYear().year,
                createdAt: new Date().toISOString()
            };
            goals = [legacyGoal];
        } else {
            goals = [];
        }
    } else {
        goals = savedGoals || [];
    }
}

/**
 * Render the goals list
 */
export function renderGoalsList() {
    const goalsList = document.getElementById('goals-list');
    if (!goalsList) return;
    
    // Get current month/year
    const { month, year } = getCurrentMonthYear();
    
    // Get financial data for calculations
    const totalIncome = calculateTotalIncome(month, year);
    const totalExpenses = calculateTotalExpenses(month, year);
    const balance = totalIncome - totalExpenses;
    const categoryData = getCategoryBreakdown(month, year);
    
    // Filter goals for current month or recurring goals
    const currentGoals = goals.filter(goal => 
        goal.recurring || (goal.month === month && goal.year === year)
    );
    
    // Clear the list
    goalsList.innerHTML = '';
    
    // Show empty message if no goals
    if (currentGoals.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-goals-message';
        emptyMessage.textContent = 'No goals set. Click the + button to add a goal.';
        goalsList.appendChild(emptyMessage);
        return;
    }
    
    // Create elements for each goal
    currentGoals.forEach(goal => {
        // Calculate progress based on goal type
        const progressData = calculateGoalProgress(goal, totalIncome, totalExpenses, balance, categoryData);
        
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.dataset.id = goal.id;
        
        // Create header with title and amount
        const header = document.createElement('div');
        header.className = 'goal-item-header';
        
        const title = document.createElement('div');
        title.className = 'goal-title';
        title.textContent = progressData.title;
        
        const amount = document.createElement('div');
        amount.className = 'goal-amount';
        amount.textContent = formatCurrency(progressData.targetAmount);
        
        header.appendChild(title);
        header.appendChild(amount);
        
        // Create progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'goal-progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'goal-progress-bar';
        progressBar.style.width = `${progressData.percentage}%`;
        progressBar.style.backgroundColor = progressData.color;
        
        progressContainer.appendChild(progressBar);
        
        // Create stats
        const stats = document.createElement('div');
        stats.className = 'goal-stats';
        
        const currentValue = document.createElement('div');
        currentValue.textContent = `Current: ${formatCurrency(progressData.currentAmount)}`;
        
        const percentText = document.createElement('div');
        percentText.textContent = `${Math.round(progressData.percentage)}%`;
        
        stats.appendChild(currentValue);
        stats.appendChild(percentText);
        
        // Create delete button
        const actions = document.createElement('div');
        actions.className = 'goal-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'goal-delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteGoal(goal.id);
        });
        
        actions.appendChild(deleteBtn);
        
        // Add recurring indicator if applicable
        if (goal.recurring) {
            const recurringBadge = document.createElement('span');
            recurringBadge.className = 'recurring-badge';
            recurringBadge.innerHTML = '<i class="fas fa-sync-alt"></i>';
            recurringBadge.title = 'Recurring goal';
            actions.appendChild(recurringBadge);
        }
        
        // Assemble the goal item
        goalItem.appendChild(header);
        goalItem.appendChild(progressContainer);
        goalItem.appendChild(stats);
        goalItem.appendChild(actions);
        
        // Add click handler for editing
        goalItem.addEventListener('click', () => {
            editGoal(goal.id);
        });
        
        // Add to list
        goalsList.appendChild(goalItem);
    });
}

/**
 * Calculate goal progress based on goal type
 * @param {Object} goal - Goal object
 * @param {number} totalIncome - Total income for the period
 * @param {number} totalExpenses - Total expenses for the period
 * @param {number} balance - Current balance (income - expenses)
 * @param {Array} categoryData - Category breakdown data
 * @returns {Object} Progress data including percentages and display values
 */
function calculateGoalProgress(goal, totalIncome, totalExpenses, balance, categoryData) {
    let title = '';
    let currentAmount = 0;
    let targetAmount = goal.amount;
    let percentage = 0;
    let isInverse = false;
    
    switch (goal.type) {
        case 'balance':
            title = 'Balance Above';
            currentAmount = balance;
            percentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
            break;
            
        case 'expense':
            title = 'Expense Limit';
            currentAmount = totalExpenses;
            percentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
            isInverse = true; // Lower is better for expense limits
            break;
            
        case 'category':
            const categoryName = goal.category.charAt(0).toUpperCase() + goal.category.slice(1);
            title = `${categoryName} Budget`;
            
            // Find category spending
            const categoryExpense = categoryData.find(cat => cat.category === goal.category);
            currentAmount = categoryExpense ? categoryExpense.amount : 0;
            percentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
            isInverse = true; // Lower is better for category budgets
            break;
            
        case 'savings':
            title = 'Savings Goal';
            
            if (goal.percentage) {
                title = `Save ${goal.percentage}% of Income`;
                const targetSavingsRate = goal.percentage / 100;
                const currentSavingsRate = totalIncome > 0 ? Math.max(0, (totalIncome - totalExpenses) / totalIncome) : 0;
                percentage = Math.min(100, Math.max(0, (currentSavingsRate / targetSavingsRate) * 100));
                currentAmount = totalIncome > 0 ? (totalIncome - totalExpenses) : 0;
                targetAmount = totalIncome * (goal.percentage / 100);
            } else {
                // Absolute savings amount
                currentAmount = Math.max(0, totalIncome - totalExpenses);
                percentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
            }
            break;
    }
    
    // Determine color based on percentage and goal type
    let color;
    if (isInverse) {
        // For inverse goals (where lower is better), reverse the color logic
        if (percentage < 50) {
            color = 'var(--color-success)';
        } else if (percentage < 85) {
            color = 'var(--color-warning)';
        } else {
            color = 'var(--color-danger)';
        }
    } else {
        // For regular goals (higher is better)
        if (percentage > 85) {
            color = 'var(--color-success)';
        } else if (percentage > 40) {
            color = 'var(--color-warning)';
        } else {
            color = 'var(--color-danger)';
        }
    }
    
    return {
        title,
        currentAmount,
        targetAmount,
        percentage,
        color
    };
}

/**
 * Edit an existing goal
 * @param {string} goalId - ID of the goal to edit
 */
function editGoal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    // Set edit mode
    isEditMode = true;
    editGoalId = goalId;
    
    // Show form
    showGoalForm();
    
    // Populate form with goal data
    const goalType = document.getElementById('goal-type');
    const goalCategory = document.getElementById('goal-category');
    const goalAmount = document.getElementById('goal-amount');
    const goalPercentage = document.getElementById('goal-percentage');
    const goalRecurring = document.getElementById('goal-recurring');
    
    if (goalType) goalType.value = goal.type;
    if (goalAmount) goalAmount.value = goal.amount;
    if (goalRecurring) goalRecurring.checked = goal.recurring;
    
    // Set conditional fields based on goal type
    toggleGoalFields();
    
    if (goal.type === 'category' && goalCategory) {
        goalCategory.value = goal.category;
        document.getElementById('category-selector').classList.remove('hidden');
    }
    
    if (goal.type === 'savings' && goalPercentage && goal.percentage) {
        goalPercentage.value = goal.percentage;
        document.getElementById('savings-percent').classList.remove('hidden');
    }
}
