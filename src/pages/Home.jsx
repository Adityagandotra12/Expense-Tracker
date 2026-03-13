/**
 * Home page - main view combining Dashboard, Add Transaction, Filters, Search,
 * Budget, Transaction List, Charts, Dark Mode toggle, and CSV Export.
 * All state is synced with LocalStorage.
 */

import { useState, useEffect, useMemo } from 'react';
import Dashboard from '../components/Dashboard';
import AddTransaction from '../components/AddTransaction';
import TransactionList from '../components/TransactionList';
import Charts from '../components/Charts';
import {
  getTransactions,
  saveTransactions,
  getBudget,
  saveBudget,
  getTheme,
  saveTheme,
} from '../utils/localStorage';
import { CATEGORIES } from '../utils/constants';

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Which month we're viewing (dashboard, budget, list, charts all use this)
  const getCurrentMonthKey = () =>
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  // Filters and search (apply within the selected view month)
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load from LocalStorage on mount
  useEffect(() => {
    setTransactions(getTransactions());
    setBudget(getBudget());
    const savedTheme = getTheme();
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
    // Mark hydration complete so we don't overwrite storage with empty defaults on first render.
    setHasHydrated(true);
  }, []);

  // Apply and persist theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    saveTheme(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Persist transactions when they change
  useEffect(() => {
    if (!hasHydrated) return;
    saveTransactions(transactions);
  }, [transactions, hasHydrated]);

  // Persist budget when it changes
  useEffect(() => {
    if (!hasHydrated) return;
    saveBudget(budget);
  }, [budget, hasHydrated]);

  const handleSaveTransaction = (transaction) => {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? transaction : t))
      );
      setEditingTransaction(null);
    } else {
      setTransactions((prev) => [...prev, transaction]);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (editingTransaction?.id === id) setEditingTransaction(null);
  };

  const handleCancelEdit = () => setEditingTransaction(null);

  // Transactions in the selected month only (dashboard, budget, list, pie chart use this)
  const transactionsInSelectedMonth = useMemo(
    () => transactions.filter((t) => t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  // Filter and search within selected month
  const filteredTransactions = useMemo(() => {
    return transactionsInSelectedMonth.filter((t) => {
      if (searchQuery && !t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      if (filterCategory && t.category !== filterCategory) return false;
      if (filterDate && t.date !== filterDate) return false;
      return true;
    });
  }, [transactionsInSelectedMonth, searchQuery, filterCategory, filterDate]);

  // Summary calculations for the selected month only
  const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
    const income = transactionsInSelectedMonth
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactionsInSelectedMonth
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      totalBalance: income - expense,
    };
  }, [transactionsInSelectedMonth]);

  const selectedMonthLabel = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  }, [selectedMonth]);

  const monthlySpending = useMemo(() => {
    return transactionsInSelectedMonth
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactionsInSelectedMonth]);

  const remainingBudget = budget - monthlySpending;
  const isOverBudget = budget > 0 && remainingBudget < 0;

  const handleExportExcel = async () => {
    // Create one Excel file with one sheet per month (Feb sheet, March sheet, etc.).
    // Uses a Blob download for better mobile compatibility.
    try {
      const mod = await import('xlsx');
      // Some builds expose the library under `default`
      const XLSX = mod?.default ?? mod;

      const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
      const months = Array.from(new Set(sorted.map((t) => t.date.slice(0, 7)))).sort();
      if (months.length === 0) {
        alert('No transactions to export yet.');
        return;
      }

      const wb = XLSX.utils.book_new();

      months.forEach((monthKey) => {
        const [y, m] = monthKey.split('-').map(Number);
        const sheetNameBase = new Date(y, m - 1).toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });
        // Excel sheet name max length is 31 characters; keep it short and safe
        const sheetName = sheetNameBase.slice(0, 31);

        const rows = sorted
          .filter((t) => t.date.startsWith(monthKey))
          .map((t) => ({
            Date: t.date,
            Description: t.description || '',
            Category: t.category,
            Type: t.type,
            Amount: t.amount,
          }));

        const ws = XLSX.utils.json_to_sheet(rows, {
          header: ['Date', 'Description', 'Category', 'Type', 'Amount'],
        });
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      const fileName = `expense-tracker-${new Date().toISOString().slice(0, 10)}.xlsx`;
      const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // iOS Safari may ignore `download`; opening the URL at least lets user save/share
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (err) {
      console.error('Excel export failed:', err);
      alert('Export failed on this device. Please try again or use CSV export.');
    }
  };

  return (
    <div className="min-h-screen transition-colors">
      {/* Header with title, dark mode toggle, export */}
      <header className="sticky top-0 z-10 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)] shadow-md" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)] bg-clip-text text-transparent">
                  Expense Tracker
                </span>
              </h1>
              <p className="text-xs text-[var(--text-secondary)] -mt-0.5">
                All data stays in your browser (LocalStorage)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:opacity-90 transition-opacity shadow-sm"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2 rounded-xl font-semibold text-white shadow-md hover:opacity-95 transition-opacity bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)]"
            >
              Export Excel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Month selector: view data for any month (past, current, or future) */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 shadow-sm">
          <label className="text-sm font-semibold text-[var(--text-secondary)]">
            View month:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mobile-date-input px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm sm:text-base text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none"
          />
          <span className="text-[var(--text-secondary)] text-sm">
            Showing data for <strong className="text-[var(--text-primary)]">{selectedMonthLabel}</strong>
          </span>
          {selectedMonth !== getCurrentMonthKey() && (
            <button
              type="button"
              onClick={() => setSelectedMonth(getCurrentMonthKey())}
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Back to current month
            </button>
          )}
        </div>

        <Dashboard
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          monthlySpending={monthlySpending}
          currentMonth={selectedMonthLabel}
        />

        {/* Budget section */}
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] mb-6 shadow-sm" style={{ boxShadow: 'var(--card-glow)' }}>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Monthly Budget
          </h2>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Set budget (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={budget || ''}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none"
              />
            </div>
            {budget > 0 && (
              <div
                className={`px-4 py-2 rounded-xl font-extrabold ${
                  isOverBudget
                    ? 'bg-[var(--expense-color)]/20 text-[var(--expense-color)]'
                    : 'bg-[var(--income-color)]/20 text-[var(--income-color)]'
                }`}
              >
                {isOverBudget
                  ? `Over by ₹${Math.abs(remainingBudget).toFixed(2)}`
                  : `Remaining: ₹${remainingBudget.toFixed(2)}`}
              </div>
            )}
          </div>
          {isOverBudget && (
            <p className="mt-2 text-sm text-[var(--expense-color)] font-medium">
              Warning: You have exceeded your monthly budget.
            </p>
          )}
        </div>

        <AddTransaction
          onSave={handleSaveTransaction}
          initialTransaction={editingTransaction}
          onCancel={handleCancelEdit}
        />

        {/* Filters and Search */}
        <div className="rounded-2xl p-4 border border-[var(--border-color)] bg-[var(--bg-card)] mb-6 shadow-sm" style={{ boxShadow: 'var(--card-glow)' }}>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Filters & Search
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Search description
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--accent)] outline-none"
              >
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="mobile-date-input w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--accent)] outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('');
                  setFilterDate('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm hover:bg-[var(--bg-secondary)] transition-colors font-semibold"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>

        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />

        <Charts
          transactions={transactionsInSelectedMonth}
          allTransactions={transactions}
          selectedMonth={selectedMonth}
          isDark={darkMode}
        />
      </main>
    </div>
  );
}
