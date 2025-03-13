/**
 * goals.js - Handles budget goal management
 */

import { formatCurrency, toggleClass } from './utils.js';
import { saveData, loadData, STORAGE_KEYS } from './storage.js';
import { calculateTotalIncome, calculateTotalExpenses } from './transactions.js';
import { getCurrentMonthYear } from './navigation.js';

// Goal state
let currentGoal = {
    type: null, // positive, negative, period
    amount: 0,
    period: null, // for period goals
    days: 0, // for period goals
    difference: 0, // for period goals
    active: false
};

/**
 * Initialize goals module
 */
export function initGoals() {
    loadGoalSettings();
    updateGoalDisplay();
}

/**
 * Set up goals-related event listeners
 */
export function setupGoalListeners() {
    // Set goal button
    const setGoalBtn = document.getElementById('set-goal-btn');
    if (setGoalBtn) {
        setGoalBtn.addEventListener('click', saveGoalSettings);
    }
    
    // Goal type change - toggle period section
    const goalTypeSelect = document.getElementById('goal-type');
    if (goalTypeSelect) {
        goalTypeSelect.addEventListener('change', togglePeriodOptions);
    }
    
    // Listen for transactions or month changes to update goal display
    window.addEventListener('transactionsUpdated', updateGoalDisplay);
    window.addEventListener('monthChanged', updateGoalDisplay);
}

/**
 * Toggle period options based on goal type
 */
function togglePeriodOptions() {
    const goalType = document.getElementById('goal-type');
    const periodOptions = document.getElementById('period-options');
    
    if (goalType && periodOptions) {
        // Only show period options for 'period' type goals
        toggleClass(periodOptions, 'hidden', goalType.value !== 'period');
    }
}

/**
 * Save goal settings
 */
function saveGoalSettings() {
    const goalType = document.getElementById('goal-type');
    const goalAmount = document.getElementById('goal-amount');
    const goalDays = document.getElementById('goal-days');
    const goalDifference = document.getElementById('goal-difference');
    
    if (!goalType || !goalAmount) return;
    
    // Validate amount
    const amount = parseFloat(goalAmount.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid goal amount greater than zero.');
        return;
    }
    
    // Build goal object based on type
    const isPeriodGoal = goalType.value === 'period';
    
    // For period goals, validate additional fields
    if (isPeriodGoal) {
        if (!goalDays || !goalDifference) return;
        
        const days = parseInt(goalDays.value);
        const difference = parseFloat(goalDifference.value);
        
        if (isNaN(days) || days <= 0) {
            alert('Please enter a valid number of days greater than zero.');
            return;
        }
        
        if (isNaN(difference)) {
            alert('Please enter a valid target difference amount.');
            return;
        }
        
        currentGoal = {
            type: goalType.value,
            amount: amount,
            period: 'custom',
            days: days,
            difference: difference,
            active: true
        };
    } else {
        // Simple goal (positive or negative)
        currentGoal = {
            type: goalType.value,
            amount: amount,
            active: true
        };
    }
    
    // Save and update display
    saveGoalToStorage();
    updateGoalDisplay();
    
    // Reset form
    goalAmount.value = '';
    if (goalDays) goalDays.value = '';
    if (goalDifference) goalDifference.value = '';
}

/**
 * Save goal to storage
 */
function saveGoalToStorage() {
    saveData(STORAGE_KEYS.BUDGET_GOAL, currentGoal);
}

/**
 * Load goal settings from storage
 */
function loadGoalSettings() {
    const savedGoal = loadData(STORAGE_KEYS.BUDGET_GOAL, null);
    if (savedGoal) {
        currentGoal = savedGoal;
    }
}

/**
 * Update goal display based on current goal and transactions
 */
export function updateGoalDisplay() {
    const goalStatus = document.getElementById('goal-status');
    const currentGoalText = document.getElementById('current-goal');
    const goalProgress = document.getElementById('goal-progress');
    const goalProgressBar = document.getElementById('goal-progress-bar');
    
    if (!goalStatus || !currentGoalText || !goalProgress || !goalProgressBar) return;
    
    // If no active goal, show default message
    if (!currentGoal.active) {
        currentGoalText.textContent = 'No goal set for this month';
        goalProgress.textContent = '$0.00';
        goalProgressBar.style.width = '0%';
        return;
    }
    
    // Get current financial status
    const { month, year } = getCurrentMonthYear();
    const totalIncome = calculateTotalIncome(month, year);
    const totalExpenses = calculateTotalExpenses(month, year);
    const currentBalance = totalIncome - totalExpenses;
    
    // Calculate progress based on goal type
    let progress = 0;
    let goalText = '';
    let progressPercentage = 0;
    
    if (currentGoal.type === 'positive') {
        // Goal to achieve balance above a certain amount
        goalText = `Goal: Balance above ${formatCurrency(currentGoal.amount)}`;
        progress = currentBalance;
        progressPercentage = Math.min(100, Math.max(0, (progress / currentGoal.amount) * 100));
    } else if (currentGoal.type === 'negative') {
        // Goal to keep expenses below a certain amount
        goalText = `Goal: Keep expenses below ${formatCurrency(currentGoal.amount)}`;
        progress = totalExpenses;
        progressPercentage = Math.min(100, Math.max(0, (progress / currentGoal.amount) * 100));
        
        // Different color logic for expense goals (lower is better)
        if (progressPercentage < 50) {
            goalProgressBar.style.backgroundColor = 'var(--color-success)';
        } else if (progressPercentage < 80) {
            goalProgressBar.style.backgroundColor = 'var(--color-warning)';
        } else {
            goalProgressBar.style.backgroundColor = 'var(--color-danger)';
        }
    } else if (currentGoal.type === 'period') {
        // Goal to achieve a target difference after a certain period
        goalText = `Goal: ${formatCurrency(currentGoal.difference)} after ${currentGoal.days} days`;
        progress = currentBalance;
        // For period goals, we'll show current balance against target difference
        progressPercentage = Math.min(100, Math.max(0, (progress / currentGoal.difference) * 100));
    }
    
    // Update UI
    currentGoalText.textContent = goalText;
    goalProgress.textContent = formatCurrency(progress);
    goalProgressBar.style.width = `${progressPercentage}%`;
    
    // Set color for positive/period goals (higher is better)
    if (currentGoal.type !== 'negative') {
        if (progressPercentage < 30) {
            goalProgressBar.style.backgroundColor = 'var(--color-danger)';
        } else if (progressPercentage < 70) {
            goalProgressBar.style.backgroundColor = 'var(--color-warning)';
        } else {
            goalProgressBar.style.backgroundColor = 'var(--color-success)';
        }
    }
}
