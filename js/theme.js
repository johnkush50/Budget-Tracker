/**
 * Dark mode theme toggling functionality
 */

// Check for saved theme preference or use system preference
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme');

/**
 * Initialize the theme based on saved preference or system settings
 */
export function initTheme() {
    const checkbox = document.getElementById('checkbox');
    
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (checkbox) checkbox.checked = true;
    } else if (currentTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        if (checkbox) checkbox.checked = false;
    } else if (prefersDarkScheme.matches) {
        // If no saved preference, use system preference
        document.body.setAttribute('data-theme', 'dark');
        if (checkbox) checkbox.checked = true;
    }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme(e) {
    if (e.target.checked) {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Set up event listener for the theme toggle
 */
export function setupThemeToggle() {
    const checkbox = document.getElementById('checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', toggleTheme);
    }
}
