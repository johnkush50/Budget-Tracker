/**
 * charts.js - Handles chart generation and updates
 */

import { formatCurrency } from './utils.js';

// Chart instances (keep reference to destroy/update)
let summaryChart = null;
let categoryChart = null;

/**
 * Initialize charts module
 */
export function initCharts() {
    // Charts will be created on first update
}

/**
 * Update the income vs expenses summary chart
 * @param {number} income - Total income amount
 * @param {number} expenses - Total expenses amount
 */
export function updateSummaryChart(income, expenses) {
    const summaryChartCanvas = document.getElementById('summary-chart');
    if (!summaryChartCanvas) {
        console.error('Summary chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (summaryChart) {
        summaryChart.destroy();
    }
    
    // Create new chart
    summaryChart = new Chart(summaryChartCanvas, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Amount',
                data: [income, expenses],
                backgroundColor: ['rgba(46, 204, 113, 0.7)', 'rgba(231, 76, 60, 0.7)'],
                borderColor: ['rgba(39, 174, 96, 1)', 'rgba(192, 57, 43, 1)'],
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
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Update the category breakdown chart
 * @param {Array} categoryData - Array of category data objects
 */
export function updateCategoryChart(categoryData) {
    const categoryChartCanvas = document.getElementById('category-chart');
    const categoriesContainer = document.getElementById('categories-container');
    
    if (!categoryChartCanvas) {
        console.error('Category chart canvas not found');
        return;
    }
    
    if (!categoryData || categoryData.length === 0) {
        if (categoriesContainer) {
            categoriesContainer.innerHTML = '<p class="no-data-message">No expense data available for this month.</p>';
        }
        return;
    }
    
    // Destroy existing chart if it exists
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    // Prepare chart data
    const total = categoryData.reduce((sum, category) => sum + category.amount, 0);
    const labels = categoryData.map(category => category.category);
    const data = categoryData.map(category => category.amount);
    const backgroundColors = categoryData.map(category => getCategoryColor(category.category));
    
    // Create new chart
    categoryChart = new Chart(categoryChartCanvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Update category breakdown in container
    updateCategoryBreakdown(categoryData, total, categoriesContainer);
}

/**
 * Update the category breakdown display
 * @param {Array} categoryData - Array of category data objects
 * @param {number} total - Total amount of all categories
 * @param {HTMLElement} container - Container element for the breakdown
 */
function updateCategoryBreakdown(categoryData, total, container) {
    if (!container) return;
    
    container.innerHTML = '';
    
    categoryData.forEach(category => {
        const percentage = total > 0 ? ((category.amount / total) * 100).toFixed(1) : 0;
        
        // Create category item element
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        
        // Create info section with category name and percentage
        const categoryInfo = document.createElement('div');
        categoryInfo.className = 'category-info';
        
        const nameElement = document.createElement('div');
        nameElement.className = 'category-name';
        nameElement.textContent = formatCategoryName(category.category);
        
        const percentageElement = document.createElement('div');
        percentageElement.className = 'category-percentage';
        percentageElement.textContent = `${percentage}%`;
        
        categoryInfo.appendChild(nameElement);
        categoryInfo.appendChild(percentageElement);
        
        // Create amount element with a space before the dollar sign
        const amountElement = document.createElement('div');
        amountElement.className = 'category-amount';
        amountElement.textContent = ' ' + formatCurrency(category.amount); // Add a space before the dollar sign
        
        // Assemble the category item without bar chart
        categoryItem.appendChild(categoryInfo);
        categoryItem.appendChild(amountElement);
        
        // Add to container
        container.appendChild(categoryItem);
    });
}

/**
 * Get color for a specific category
 * @param {string} category - Category name
 * @returns {string} Color hex code
 */
export function getCategoryColor(category) {
    const categoryColors = {
        food: '#FF6384',
        transportation: '#FFCE56',
        entertainment: '#9966FF',
        utilities: '#4BC0C0',
        housing: '#36A2EB',
        healthcare: '#FF9F40',
        personal: '#8AC24A',
        education: '#03A9F4',
        debt: '#F44336',
        savings: '#00BCD4',
        income: '#4CAF50',
        other: '#9E9E9E'
    };
    
    return categoryColors[category?.toLowerCase()] || categoryColors.other;
}

/**
 * Format category name for display (capitalize first letter)
 * @param {string} category - Category name
 * @returns {string} Formatted category name
 */
function formatCategoryName(category) {
    if (!category) return 'Other';
    return category.charAt(0).toUpperCase() + category.slice(1);
}
