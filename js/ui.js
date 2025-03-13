/**
 * ui.js - UI Updates and Rendering
 * Handles updating all UI elements and DOM manipulation
 */

// Update transaction table with filtered transactions
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

// Update summary section with current totals
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

// Update category breakdown section
function updateCategoryBreakdown() {
    // Clear previous categories
    categoriesContainer.innerHTML = '';
    
    // Get all expense transactions for the current month
    const expenseTransactions = transactions.filter(
        t => t.type === 'expense' && t.month === currentMonth && t.year === currentYear
    );
    
    if (expenseTransactions.length === 0) {
        categoriesContainer.innerHTML = '<p>No expenses for this month yet.</p>';
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
