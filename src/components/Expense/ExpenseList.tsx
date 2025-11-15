import { useState, useMemo, useEffect } from 'react';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { Input } from '@/components/Common/Input';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { Expense } from '@/types';

interface ExpenseListProps {
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onFiltersChange?: (filters: { startDate?: string; endDate?: string; categoryId?: number }) => void;
}

export default function ExpenseList({ onEdit, onDelete, onFiltersChange }: ExpenseListProps) {
  const expenses = useExpenseStore((state) => state.expenses);
  const expenseCategories = useCategoryStore((state) => state.expenseCategories);
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Notify parent of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        categoryId: categoryFilter !== '' ? categoryFilter : undefined,
      });
    }
  }, [startDate, endDate, categoryFilter, onFiltersChange]);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Category filter
    if (categoryFilter !== '') {
      filtered = filtered.filter((e) => e.categoryId === categoryFilter);
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((e) => e.date >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => e.date <= end);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    return filtered;
  }, [expenses, categoryFilter, startDate, endDate]);

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategory = (categoryId: number) => {
    return expenseCategories.find((c) => c.id === categoryId);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All Categories</option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Expenses:</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-lg border border-gray-200 text-center">
          <p className="text-gray-500 text-lg">No expenses found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => {
                  const category = getCategory(expense.categoryId);
                  return (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold text-gray-900">{expense.title}</div>
                        {expense.description && (
                          <div className="text-xs text-gray-500 mt-1">{expense.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {category && (
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                            }}
                          >
                            {category.name}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(expense.date)}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex gap-3">
                          <button
                            onClick={() => onEdit(expense)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-150"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(expense)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-150"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

