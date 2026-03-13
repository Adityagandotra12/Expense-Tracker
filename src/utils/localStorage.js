/**
 * LocalStorage utility functions for persisting expense tracker data in the browser.
 * All data is stored as JSON strings. No backend or database is used.
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense_tracker_transactions',
  BUDGET: 'expense_tracker_budget',
  THEME: 'expense_tracker_theme',
};

/**
 * Get all transactions from LocalStorage
 * @returns {Array} Array of transaction objects
 */
export function getTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading transactions:', e);
    return [];
  }
}

/**
 * Save transactions to LocalStorage
 * @param {Array} transactions - Array of transaction objects
 */
export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions:', e);
  }
}

/**
 * Get monthly budget from LocalStorage
 * @returns {number} Budget amount (default 0)
 */
export function getBudget() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGET);
    return data !== null ? Number(data) : 0;
  } catch (e) {
    console.error('Error reading budget:', e);
    return 0;
  }
}

/**
 * Save monthly budget to LocalStorage
 * @param {number} amount - Budget amount
 */
export function saveBudget(amount) {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, String(amount));
  } catch (e) {
    console.error('Error saving budget:', e);
  }
}

/**
 * Get theme preference (light/dark) from LocalStorage
 * @returns {string} 'light' | 'dark'
 */
export function getTheme() {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return theme === 'dark' || theme === 'light' ? theme : null;
  } catch (e) {
    return null;
  }
}

/**
 * Save theme preference to LocalStorage
 * @param {string} theme - 'light' or 'dark'
 */
export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Error saving theme:', e);
  }
}
