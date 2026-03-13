/**
 * TransactionList - table of all transactions with columns: Amount, Category, Date, Description, Edit/Delete
 * Renders TransactionItem for each transaction
 */

import TransactionItem from './TransactionItem';

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm" style={{ boxShadow: 'var(--card-glow)' }}>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Transaction List
        </h2>
        <p className="text-[var(--text-secondary)] text-center py-8">
          No transactions yet. Add one above!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm" style={{ boxShadow: 'var(--card-glow)' }}>
      <div className="px-6 py-4 border-b border-[var(--border-color)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Transaction List
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-[var(--bg-secondary)] text-left">
              <th className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Amount
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Category
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Date
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Description
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
