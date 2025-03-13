/**
 * Personal Budget Tracker
 * 
 * This script handles all functionality for the Budget Tracker application:
 * - Adding and removing transactions
 * - Calculating income, expenses, and balance
 * - Persisting data using localStorage
 * - Updating the UI based on transactions
 * - Tracking spending by category
 */

// Initialize the transactions array and set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get transactions from localStorage or initialize empty array
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Set up event listeners
    const form = document.getElementById('form');
    form.addEventListener('submit', addTransaction);
    
    // Set up dynamic category visibility based on transaction type
    const typeSelect = document.getElementById('type');
    const categoryField = document.getElementById('category');
    
    typeSelect.addEventListener('change', function() {
        // Get all category options
        const categoryOptions = categoryField.querySelectorAll('option');
        
        // Reset options visibility
        categoryOptions.forEach(option => {
            option.style.display = 'block';
        });
        
        // Hide income-specific categories when expense is selected and vice versa
        if (this.value === 'expense') {
            // Hide income-specific categories
            const incomeCategories = ['Salary', 'Investment'];
            incomeCategories.forEach(cat => {
                const option = Array.from(categoryOptions).find(opt => opt.value === cat);
                if (option) option.style.display = 'none';
            });
        } else if (this.value === 'income') {
            // Hide expense-specific categories
            const expenseCategories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Transportation'];
            expenseCategories.forEach(cat => {
                const option = Array.from(categoryOptions).find(opt => opt.value === cat);
                if (option) option.style.display = 'none';
            });
        }
        
        // Reset category selection
        categoryField.value = '';
    });
    
    // Initial UI update based on stored transactions
    updateUI(transactions);
    
    /**
     * Handle form submission to add a new transaction
     * @param {Event} e - The form submission event
     */
    function addTransaction(e) {
        e.preventDefault(); // Prevent form from submitting normally
        
        // Get and trim form values
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        
        // Validate inputs
        if (!description || isNaN(amount) || amount <= 0 || !category) {
            alert('Please provide a valid description, positive amount, and category');
            return;
        }
        
        // Create transaction object
        const transaction = {
            id: Date.now(), // Unique ID using timestamp
            description,
            amount,
            type,
            category
        };
        
        // Add to transactions array
        transactions.push(transaction);
        
        // Save to localStorage
        saveTransactions(transactions);
        
        // Reset form
        form.reset();
        
        // Update UI
        updateUI(transactions);
    }
    
    /**
     * Save transactions to localStorage
     * @param {Array} transactions - The array of transaction objects
     */
    function saveTransactions(transactions) {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    /**
     * Delete a transaction by its ID
     * @param {number} id - The ID of the transaction to delete
     */
    function deleteTransaction(id) {
        // Filter out the transaction with the specified ID
        transactions = transactions.filter(transaction => transaction.id !== id);
        
        // Save updated transactions to localStorage
        saveTransactions(transactions);
        
        // Update UI
        updateUI(transactions);
    }
    
    /**
     * Update the transaction list and summary display
     * @param {Array} transactions - The array of transaction objects
     */
    function updateUI(transactions) {
        const transactionsList = document.getElementById('transactions');
        const totalIncomeElement = document.getElementById('total-income');
        const totalExpenseElement = document.getElementById('total-expense');
        const balanceElement = document.getElementById('balance');
        
        // Clear current transaction list
        transactionsList.innerHTML = '';
        
        // Check if there are any transactions
        if (transactions.length === 0) {
            // Display a message when no transactions exist
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'No transactions yet. Add a transaction to get started!';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '20px';
            emptyMessage.style.color = '#777';
            transactionsList.appendChild(emptyMessage);
        } else {
            // Create list items for each transaction
            transactions.forEach(transaction => {
                const listItem = document.createElement('li');
                
                // Create description element
                const descriptionElement = document.createElement('span');
                descriptionElement.classList.add('transaction-description');
                descriptionElement.textContent = transaction.description;
                
                // Create category badge (new)
                const categoryBadge = document.createElement('span');
                categoryBadge.classList.add('category-badge');
                categoryBadge.textContent = transaction.category || 'Uncategorized';
                categoryBadge.style.marginLeft = '8px';
                categoryBadge.style.fontSize = '0.8em';
                categoryBadge.style.padding = '2px 6px';
                categoryBadge.style.borderRadius = '10px';
                categoryBadge.style.backgroundColor = '#e9ecef';
                categoryBadge.style.color = '#495057';
                
                // Create container for description and category
                const leftContainer = document.createElement('div');
                leftContainer.classList.add('transaction-left');
                leftContainer.appendChild(descriptionElement);
                leftContainer.appendChild(categoryBadge);
                
                // Create amount element with appropriate class
                const amountElement = document.createElement('span');
                amountElement.classList.add(transaction.type);
                const sign = transaction.type === 'income' ? '+' : '-';
                amountElement.textContent = `${sign}$${transaction.amount.toFixed(2)}`;
                
                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-btn');
                deleteButton.innerHTML = '&times;'; // u00d7 symbol
                deleteButton.setAttribute('title', 'Delete transaction');
                deleteButton.onclick = () => deleteTransaction(transaction.id);
                
                // Create container for amount and delete button
                const rightContainer = document.createElement('div');
                rightContainer.classList.add('transaction-right');
                rightContainer.appendChild(amountElement);
                rightContainer.appendChild(deleteButton);
                
                // Add elements to list item
                listItem.appendChild(leftContainer);
                listItem.appendChild(rightContainer);
                
                // Add list item to transaction list
                transactionsList.appendChild(listItem);
            });
        }
        
        // Calculate totals and update summary
        updateSummary(transactions, totalIncomeElement, totalExpenseElement, balanceElement);
        
        // Update category breakdown
        updateCategoryBreakdown(transactions);
    }
    
    /**
     * Calculate and update the summary display
     * @param {Array} transactions - The array of transaction objects
     * @param {HTMLElement} incomeElement - The total income display element
     * @param {HTMLElement} expenseElement - The total expense display element
     * @param {HTMLElement} balanceElement - The balance display element
     */
    function updateSummary(transactions, incomeElement, expenseElement, balanceElement) {
        // Calculate total income
        const totalIncome = transactions
            .filter(transaction => transaction.type === 'income')
            .reduce((sum, transaction) => sum + transaction.amount, 0);
        
        // Calculate total expenses
        const totalExpense = transactions
            .filter(transaction => transaction.type === 'expense')
            .reduce((sum, transaction) => sum + transaction.amount, 0);
        
        // Calculate balance
        const balance = totalIncome - totalExpense;
        
        // Update summary display with formatted currency values
        incomeElement.textContent = `$${totalIncome.toFixed(2)}`;
        expenseElement.textContent = `$${totalExpense.toFixed(2)}`;
        balanceElement.textContent = `$${balance.toFixed(2)}`;
        
        // Apply color to balance based on positive/negative value
        if (balance < 0) {
            balanceElement.style.color = '#dc3545'; // Red for negative
        } else {
            balanceElement.style.color = '#007BFF'; // Blue for positive or zero
        }
    }
    
    /**
     * Update the category breakdown section
     * @param {Array} transactions - The array of transaction objects
     */
    function updateCategoryBreakdown(transactions) {
        const categoriesContainer = document.getElementById('categories-container');
        categoriesContainer.innerHTML = ''; // Clear current content
        
        // Get only expense transactions
        const expenseTransactions = transactions.filter(transaction => transaction.type === 'expense');
        
        // Calculate total expenses
        const totalExpenses = expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0);
        
        // If no expenses, show a message
        if (expenseTransactions.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No expense transactions yet. Add some expenses to see category breakdown.';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '20px';
            emptyMessage.style.color = '#777';
            categoriesContainer.appendChild(emptyMessage);
            return;
        }
        
        // Group transactions by category and calculate total for each
        const categoryTotals = {};
        
        expenseTransactions.forEach(transaction => {
            const category = transaction.category || 'Uncategorized';
            
            // Initialize the category if it doesn't exist yet
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            
            // Add transaction amount to category total
            categoryTotals[category] += transaction.amount;
        });
        
        // Sort categories by total amount (descending)
        const sortedCategories = Object.keys(categoryTotals).sort((a, b) => 
            categoryTotals[b] - categoryTotals[a]
        );
        
        // Create category breakdown items
        sortedCategories.forEach(category => {
            const amount = categoryTotals[category];
            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
            
            // Create category item container
            const categoryItem = document.createElement('div');
            categoryItem.classList.add('category-item');
            
            // Create header with category name and amount
            const categoryHeader = document.createElement('div');
            categoryHeader.style.display = 'flex';
            categoryHeader.style.justifyContent = 'space-between';
            categoryHeader.style.width = '100%';
            
            // Create category name element
            const categoryName = document.createElement('span');
            categoryName.classList.add('category-name');
            categoryName.textContent = category;
            
            // Create amount element
            const categoryAmount = document.createElement('span');
            categoryAmount.classList.add('category-amount');
            categoryAmount.textContent = `$${amount.toFixed(2)} (${percentage.toFixed(1)}%)`;
            
            // Add name and amount to header
            categoryHeader.appendChild(categoryName);
            categoryHeader.appendChild(categoryAmount);
            
            // Create progress bar container
            const progressContainer = document.createElement('div');
            progressContainer.classList.add('category-progress-container');
            
            // Create progress bar
            const progressBar = document.createElement('div');
            progressBar.classList.add('category-progress-bar');
            progressBar.style.width = `${percentage}%`;
            
            // Add progress bar to container
            progressContainer.appendChild(progressBar);
            
            // Add elements to category item
            categoryItem.appendChild(categoryHeader);
            categoryItem.appendChild(progressContainer);
            
            // Add category item to categories container
            categoriesContainer.appendChild(categoryItem);
        });
    }
});
