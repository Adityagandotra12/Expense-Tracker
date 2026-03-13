/**
 * Charts - Expense Analytics: Pie chart for category spending, Bar chart for monthly expenses
 * Uses Chart.js via react-chartjs-2. Works with theme (light/dark) via CSS variables.
 */

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// Default colors for pie chart (accessible and distinct)
const PIE_COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
];

/**
 * Build pie chart data from transactions (expenses only, grouped by category)
 */
function getCategorySpendingData(transactions) {
  const expenses = transactions.filter((t) => t.amount < 0);
  const byCategory = {};
  expenses.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
  });
  const labels = Object.keys(byCategory);
  const data = labels.map((l) => byCategory[l]);
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: PIE_COLORS.slice(0, labels.length),
        borderColor: 'transparent',
        borderWidth: 0,
      },
    ],
  };
}

/**
 * Build bar chart data: 6 months ending at selectedMonth (so data matches viewed month)
 */
function getMonthlyExpensesData(allTransactions, selectedMonth) {
  const expenses = allTransactions.filter((t) => t.amount < 0);
  const [y, m] = selectedMonth.split('-').map(Number);
  const months = [];
  const labels = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(key);
    labels.push(d.toLocaleString('default', { month: 'short', year: '2-digit' }));
  }
  const byMonth = {};
  months.forEach((mo) => (byMonth[mo] = 0));
  expenses.forEach((t) => {
    const key = t.date.slice(0, 7);
    if (byMonth[key] !== undefined) byMonth[key] += Math.abs(t.amount);
  });
  const data = months.map((mo) => byMonth[mo]);
  return {
    labels,
    datasets: [
      {
        label: 'Expenses (₹)',
        data,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };
}

const chartOptions = (isDark) => {
  const textColor = isDark ? '#94a3b8' : '#475569';
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: textColor },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ₹${ctx.raw?.toFixed(2) ?? ctx.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: textColor },
        grid: { color: isDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.05)' },
      },
      x: {
        ticks: { color: textColor },
        grid: { color: isDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.05)' },
      },
    },
  };
};

const pieOptions = (isDark) => {
  const textColor = isDark ? '#94a3b8' : '#475569';
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: textColor },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total ? ((ctx.raw / total) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ₹${ctx.raw?.toFixed(2) ?? ctx.raw} (${pct}%)`;
          },
        },
      },
    },
  };
};

export default function Charts({
  transactions,
  allTransactions = [],
  selectedMonth,
  isDark = false,
}) {
  const pieData = getCategorySpendingData(transactions);
  const barData = getMonthlyExpensesData(
    allTransactions.length ? allTransactions : transactions,
    selectedMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const hasExpenses = transactions.some((t) => t.amount < 0);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
        Expense Analytics
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm" style={{ boxShadow: 'var(--card-glow)' }}>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Spending by Category
          </h3>
          {hasExpenses && pieData.labels.length > 0 ? (
            <div className="h-64 md:h-80">
              <Pie data={pieData} options={pieOptions(isDark)} />
            </div>
          ) : (
            <p className="text-[var(--text-secondary)] py-8 text-center">
              No expense data to show. Add some expenses first.
            </p>
          )}
        </div>
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm" style={{ boxShadow: 'var(--card-glow)' }}>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Monthly Expenses
          </h3>
          <div className="h-64 md:h-80">
            <Bar data={barData} options={chartOptions(isDark)} />
          </div>
        </div>
      </div>
    </div>
  );
}
