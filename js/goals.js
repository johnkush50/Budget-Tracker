/**
 * goals.js - Monthly Goals Functionality
 * Handles all goal-related operations
 */

// Toggle goal period section based on goal type
function toggleGoalPeriodSection() {
    if (goalTypeSelect.value === 'period') {
        goalPeriodContainer.classList.remove('hidden');
    } else {
        goalPeriodContainer.classList.add('hidden');
    }
}

// Save goal settings
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
    localStorage.setItem(`monthlyGoal-${monthYearKey}`, JSON.stringify(goal));
    
    updateGoalDisplay();
    alert('Goal set successfully!');
}

// Load goal settings from localStorage
function loadGoalSettings() {
    const monthYearKey = `${currentMonth}-${currentYear}`;
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
    
    updateGoalDisplay();
}

// Update goal display based on current settings
function updateGoalDisplay() {
    const monthYearKey = `${currentMonth}-${currentYear}`;
    const savedGoal = localStorage.getItem(`monthlyGoal-${monthYearKey}`);
    
    if (!savedGoal) {
        goalDisplay.textContent = 'No goal set for this month';
        goalProgressContainer.textContent = '$0.00';
        goalProgressBar.style.width = '0%';
        goalProgressContainer.className = 'stat-value';
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
        // Balance above a certain amount
        goalDescription = `Goal: Achieve Balance Above $${goal.amount.toFixed(2)}`;
        currentValue = balance;
        percentage = Math.min((balance / goal.amount) * 100, 100);
        onTrack = balance >= goal.amount;
    } else if (goal.type === 'negative') {
        // Keep expenses below a certain amount
        goalDescription = `Goal: Keep Expenses Below $${goal.amount.toFixed(2)}`;
        currentValue = totalExpenses;
        percentage = (1 - Math.min(totalExpenses / goal.amount, 1)) * 100;
        onTrack = totalExpenses <= goal.amount;
    } else if (goal.type === 'period') {
        // Target amount after X days
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const currentDate = new Date();
        const daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const daysRemaining = Math.max(0, goal.days - daysPassed);
        
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

// Evaluate goal status for reporting
function evaluateGoalStatus(goal) {
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    const balance = totalIncome - totalExpenses;
    
    let onTrack = false;
    let message = '';
    let percentage = 0;
    
    if (goal.type === 'positive') {
        // Goal: Be above a certain amount
        percentage = Math.min((balance / goal.amount) * 100, 100);
        onTrack = balance >= goal.amount;
        message = `$${balance.toFixed(2)} of $${goal.amount.toFixed(2)}`;
    } else if (goal.type === 'negative') {
        // Goal: Be below a certain amount (typically for expense tracking)
        percentage = Math.min((1 - (totalExpenses / goal.amount)) * 100, 100);
        onTrack = totalExpenses <= goal.amount;
        message = `$${totalExpenses.toFixed(2)} of $${goal.amount.toFixed(2)}`;
    } else if (goal.type === 'period') {
        // Goal: Achieve target difference after X days
        const today = new Date();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const daysPassed = Math.floor((today - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;
        const daysRemaining = goal.days - daysPassed;
        
        // Calculate projected balance based on current rate
        const dailyRate = daysPassed > 0 ? balance / daysPassed : 0;
        const projectedBalance = balance + (dailyRate * daysRemaining);
        
        if (goal.difference >= 0) {
            // Goal to be above a target
            percentage = Math.min((projectedBalance / goal.difference) * 100, 100);
            onTrack = projectedBalance >= goal.difference;
            message = `Projected: $${projectedBalance.toFixed(2)}`;
        } else {
            // Goal to be below a target (negative difference)
            const targetExpense = Math.abs(goal.difference);
            percentage = Math.min((1 - (projectedBalance / targetExpense)) * 100, 100);
            onTrack = projectedBalance <= targetExpense;
            message = `Projected: $${projectedBalance.toFixed(2)}`;
        }
    }
    
    return {
        onTrack,
        message,
        percentage: percentage < 0 ? 0 : percentage
    };
}
