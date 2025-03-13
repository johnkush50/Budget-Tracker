/**
 * elements.js - DOM Element References
 * Contains all DOM element references used throughout the application
 */

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
