/**
 * TransactionItem - single row in the transaction list with Amount, Category, Date, Description, Edit/Delete
 */

import { TRANSACTION_TYPES } from '../utils/constants';

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === TRANSACTION_TYPES.INCOME;
  const amountDisplay = Math.abs(transaction.amount).toFixed(2);

  return (
    <tr className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/60 transition-colors">
      <td className="px-4 py-3 text-[var(--text-primary)]">
        <span
          className={`font-semibold ${
            isIncome ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'
          }`}
        >
          {isIncome ? '+' : '-'}₹{amountDisplay}
        </span>
      </td>
      <td className="px-4 py-3 text-[var(--text-primary)]">{transaction.category}</td>
      <td className="px-4 py-3 text-[var(--text-secondary)]">{transaction.date}</td>
      <td className="px-4 py-3 text-[var(--text-primary)] max-w-[200px] truncate">
        {transaction.description}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            className="px-3 py-1.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-opacity bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
            aria-label="Edit transaction"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-[var(--expense-color)]/15 text-[var(--expense-color)] hover:bg-[var(--expense-color)]/25 transition-colors"
            aria-label="Delete transaction"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
