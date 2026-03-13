/**
 * AddTransaction - form to add income or expense with Amount, Category, Date, Description, Type
 * Supports both create and edit modes via optional initialTransaction prop
 */

import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TRANSACTION_TYPES } from '../utils/constants';

// Categories shown depend on transaction type (income vs expense)
const categoriesByType = {
  [TRANSACTION_TYPES.INCOME]: INCOME_CATEGORIES,
  [TRANSACTION_TYPES.EXPENSE]: EXPENSE_CATEGORIES,
};

/**
 * Some mobile browsers (or older WebViews) don't support crypto.randomUUID().
 * This helper guarantees we can always generate a reasonably unique id.
 */
function createId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // ignore and fall back
  }
  return `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function AddTransaction({ onSave, initialTransaction = null, onCancel }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [type, setType] = useState(TRANSACTION_TYPES.EXPENSE);
  const [error, setError] = useState('');

  const isEditing = !!initialTransaction;
  const categories = categoriesByType[type];

  // When editing, populate form with existing transaction
  useEffect(() => {
    if (initialTransaction) {
      setAmount(String(Math.abs(initialTransaction.amount)));
      setCategory(initialTransaction.category);
      setDate(initialTransaction.date);
      setDescription(initialTransaction.description || '');
      setType(initialTransaction.type);
    }
  }, [initialTransaction]);

  // When switching type, set category to first of the new type's list (and keep valid if current exists)
  useEffect(() => {
    if (initialTransaction) return;
    const list = categoriesByType[type];
    setCategory((prev) => (list.includes(prev) ? prev : list[0]));
  }, [type, initialTransaction]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      const transaction = {
        id: initialTransaction?.id ?? createId(),
        amount: type === TRANSACTION_TYPES.EXPENSE ? -numAmount : numAmount,
        category,
        date,
        description: description.trim() || 'No description',
        type,
      };
      onSave(transaction);
    } catch (err) {
      console.error('Failed to save transaction:', err);
      setError('Could not add transaction on this device. Please try again.');
      return;
    }
    if (!isEditing) {
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setCategory(EXPENSE_CATEGORIES[0]);
      setType(TRANSACTION_TYPES.EXPENSE);
    } else if (onCancel) onCancel();
  };

  return (
    <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] mb-6 shadow-sm" style={{ boxShadow: 'var(--card-glow)' }}>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--expense-color)]/10 px-4 py-3 text-sm font-medium text-[var(--expense-color)]">
            {error}
          </div>
        )}
        {/* Type: Income or Expense */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Type
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2">
              <input
                type="radio"
                name="type"
                value={TRANSACTION_TYPES.INCOME}
                checked={type === TRANSACTION_TYPES.INCOME}
                onChange={() => setType(TRANSACTION_TYPES.INCOME)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <span className="text-[var(--text-primary)]">Income</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2">
              <input
                type="radio"
                name="type"
                value={TRANSACTION_TYPES.EXPENSE}
                checked={type === TRANSACTION_TYPES.EXPENSE}
                onChange={() => setType(TRANSACTION_TYPES.EXPENSE)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <span className="text-[var(--text-primary)]">Expense</span>
            </label>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none"
          />
        </div>

        {/* Category - income categories (Salary, Freelance, etc.) for Income; expense categories for Expense */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mobile-date-input w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm sm:text-base text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description"
            className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none placeholder-[var(--text-secondary)]"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-semibold text-white shadow-md hover:opacity-95 transition-opacity bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)]"
          >
            {isEditing ? 'Update' : 'Add Transaction'}
          </button>
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl font-semibold border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
