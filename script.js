/**
 * Personal Budget Tracker
 * 
 * This script handles all functionality for the Budget Tracker application:
 * - Adding and removing transactions
 * - Calculating income, expenses, and balance
 * - Persisting data using localStorage
 * - Updating the UI based on transactions
 */

// Initialize the transactions array and set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get transactions from localStorage or initialize empty array
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Set up event listeners
    const form = document.getElementById('form');
    form.addEventListener('submit', addTransaction);
    
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
        
        // Validate inputs
        if (!description || isNaN(amount) || amount <= 0) {
            alert('Please provide a valid description and positive amount');
            return;
        }
        
        // Create transaction object
        const transaction = {
            id: Date.now(), // Unique ID using timestamp
            description,
            amount,
            type
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
                
                // Create amount element with appropriate class
                const amountElement = document.createElement('span');
                amountElement.classList.add(transaction.type);
                const sign = transaction.type === 'income' ? '+' : '-';
                amountElement.textContent = `${sign}$${transaction.amount.toFixed(2)}`;
                
                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-btn');
                deleteButton.innerHTML = '&times;'; // × symbol
                deleteButton.setAttribute('title', 'Delete transaction');
                deleteButton.onclick = () => deleteTransaction(transaction.id);
                
                // Create container for amount and delete button
                const rightContainer = document.createElement('div');
                rightContainer.classList.add('transaction-right');
                rightContainer.appendChild(amountElement);
                rightContainer.appendChild(deleteButton);
                
                // Add elements to list item
                listItem.appendChild(descriptionElement);
                listItem.appendChild(rightContainer);
                
                // Add list item to transaction list
                transactionsList.appendChild(listItem);
            });
        }
        
        // Calculate totals and update summary
        updateSummary(transactions, totalIncomeElement, totalExpenseElement, balanceElement);
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
});
