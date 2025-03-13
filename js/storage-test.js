/**
 * Storage Test Utility
 * This script checks if localStorage is working properly
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create test elements in the UI
    const testContainer = document.createElement('div');
    testContainer.style.position = 'fixed';
    testContainer.style.bottom = '10px';
    testContainer.style.right = '10px';
    testContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
    testContainer.style.color = 'white';
    testContainer.style.padding = '10px';
    testContainer.style.borderRadius = '5px';
    testContainer.style.zIndex = '9999';
    testContainer.style.maxWidth = '400px';
    testContainer.style.fontSize = '12px';
    
    const heading = document.createElement('h3');
    heading.textContent = 'Storage Test';
    testContainer.appendChild(heading);
    
    const testOutput = document.createElement('pre');
    testOutput.style.maxHeight = '150px';
    testOutput.style.overflow = 'auto';
    testOutput.style.whiteSpace = 'pre-wrap';
    testContainer.appendChild(testOutput);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px';
    testContainer.appendChild(buttonContainer);
    
    // Test buttons
    const testWriteBtn = document.createElement('button');
    testWriteBtn.textContent = 'Test Write';
    testWriteBtn.style.marginRight = '5px';
    buttonContainer.appendChild(testWriteBtn);
    
    const testReadBtn = document.createElement('button');
    testReadBtn.textContent = 'Test Read';
    testReadBtn.style.marginRight = '5px';
    buttonContainer.appendChild(testReadBtn);
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Output';
    buttonContainer.appendChild(clearBtn);
    
    document.body.appendChild(testContainer);
    
    // Logging function
    function log(message) {
        const timestamp = new Date().toLocaleTimeString();
        testOutput.textContent += `[${timestamp}] ${message}\n`;
        testOutput.scrollTop = testOutput.scrollHeight;
        console.log(message);
    }
    
    // Test localStorage availability
    function testLocalStorage() {
        try {
            if (typeof localStorage === 'undefined') {
                log('❌ localStorage is not defined');
                return false;
            }
            
            log('✅ localStorage is available');
            return true;
        } catch (e) {
            log(`❌ Error accessing localStorage: ${e.message}`);
            return false;
        }
    }
    
    // Test writing to localStorage
    function testWriteToLocalStorage() {
        if (!testLocalStorage()) return;
        
        try {
            const testValue = `test-${Date.now()}`;
            localStorage.setItem('storageTest', testValue);
            log(`✅ Successfully wrote to localStorage: ${testValue}`);
            
            // Also test writing a transaction
            const testTransaction = {
                id: 'test-123',
                description: 'Test Transaction',
                amount: 100,
                date: new Date().toISOString().split('T')[0],
                category: 'test',
                type: 'income',
                recurring: false,
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            };
            
            localStorage.setItem('testTransaction', JSON.stringify(testTransaction));
            log(`✅ Successfully wrote transaction object to localStorage`);
            
            // Check existing transactions
            const existingTransactions = localStorage.getItem('transactions');
            log(`Current 'transactions' in localStorage: ${existingTransactions || 'none'}`); 
            
            // Try to update transactions
            const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
            transactions.push(testTransaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            log(`✅ Updated 'transactions' in localStorage`);
            
            return true;
        } catch (e) {
            log(`❌ Error writing to localStorage: ${e.message}`);
            return false;
        }
    }
    
    // Test reading from localStorage
    function testReadFromLocalStorage() {
        if (!testLocalStorage()) return;
        
        try {
            const testValue = localStorage.getItem('storageTest');
            if (testValue) {
                log(`✅ Successfully read from localStorage: ${testValue}`);
            } else {
                log('⚠️ No test value found in localStorage');
            }
            
            // Check all localStorage items
            log('--- All localStorage items ---');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                log(`${key}: ${value && value.length > 100 ? value.substring(0, 100) + '...' : value}`);
            }
            log('---------------------------');
            
            return true;
        } catch (e) {
            log(`❌ Error reading from localStorage: ${e.message}`);
            return false;
        }
    }
    
    // Clear output
    clearBtn.addEventListener('click', function() {
        testOutput.textContent = '';
    });
    
    // Add event listeners to buttons
    testWriteBtn.addEventListener('click', testWriteToLocalStorage);
    testReadBtn.addEventListener('click', testReadFromLocalStorage);
    
    // Initial check
    log('Starting localStorage tests...');
    testLocalStorage();
});
