/**
 * Dashboard component - displays summary cards: Total Balance, Income, Expense, Monthly Summary
 * Uses modern card UI design with responsive grid layout
 */

export default function Dashboard({
  totalBalance,
  totalIncome,
  totalExpense,
  monthlySpending,
  currentMonth,
}) {
  return (
    <div className="mb-8">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Dashboard
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Overview for <span className="font-semibold">{currentMonth}</span>
          </p>
        </div>
        <div className="hidden sm:block text-xs font-semibold text-[var(--text-secondary)]">
          Tip: Use “View month” to switch periods
        </div>
      </div>

      {/* Summary cards grid - responsive: 1 col mobile, 2 tablet, 4 desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance Card */}
        <div className="relative rounded-2xl p-5 border border-[var(--border-color)] bg-[var(--bg-card)] transition-colors overflow-hidden shadow-sm"
             style={{ boxShadow: 'var(--card-glow)' }}>
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[var(--accent)]/15 blur-2xl" />
          <p className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            Total Balance
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              totalBalance >= 0 ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'
            }`}
          >
            ₹{Math.abs(totalBalance).toFixed(2)}
          </p>
        </div>

        {/* Total Income Card */}
        <div className="relative rounded-2xl p-5 border border-[var(--border-color)] bg-[var(--bg-card)] transition-colors overflow-hidden shadow-sm"
             style={{ boxShadow: 'var(--card-glow)' }}>
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[var(--income-color)]/15 blur-2xl" />
          <p className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            Total Income
          </p>
          <p className="text-2xl font-bold mt-1 text-[var(--income-color)]">
            ₹{totalIncome.toFixed(2)}
          </p>
        </div>

        {/* Total Expense Card */}
        <div className="relative rounded-2xl p-5 border border-[var(--border-color)] bg-[var(--bg-card)] transition-colors overflow-hidden shadow-sm"
             style={{ boxShadow: 'var(--card-glow)' }}>
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[var(--expense-color)]/15 blur-2xl" />
          <p className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            Total Expense
          </p>
          <p className="text-2xl font-bold mt-1 text-[var(--expense-color)]">
            ₹{totalExpense.toFixed(2)}
          </p>
        </div>

        {/* Monthly Spending Summary Card */}
        <div className="relative rounded-2xl p-5 border border-[var(--border-color)] bg-[var(--bg-card)] transition-colors overflow-hidden shadow-sm"
             style={{ boxShadow: 'var(--card-glow)' }}>
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[var(--accent-2)]/15 blur-2xl" />
          <p className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            {currentMonth} Spending
          </p>
          <p className="text-2xl font-bold mt-1 text-[var(--expense-color)]">
            ₹{monthlySpending.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
