/**
 * Application constants - categories and transaction types
 */

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

// Categories for expenses
export const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Education',
];

// Categories for income
export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment Return',
  'Gift',
  'Refund',
  'Other',
];

// All categories (expense + income) for filters; expense categories first for backward compatibility
export const CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
