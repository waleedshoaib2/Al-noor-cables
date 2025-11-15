import { useExpenseStore } from '@/store/useExpenseStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { formatCurrency } from '@/utils/helpers';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default function ExpenseStats() {
  const expenses = useExpenseStore((state) => state.expenses);
  const expenseCategories = useCategoryStore((state) => state.expenseCategories);
  const getTotalByPeriod = useExpenseStore((state) => state.getTotalByPeriod);

  const today = new Date();
  const todayTotal = getTotalByPeriod(startOfDay(today), endOfDay(today));
  const weekTotal = getTotalByPeriod(startOfWeek(today), endOfWeek(today));
  const monthTotal = getTotalByPeriod(startOfMonth(today), endOfMonth(today));

  const categoryTotals = expenseCategories.map((cat) => ({
    category: cat,
    total: expenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0),
  }));

  return (
    <div className="space-y-6">
      {/* Period Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Today</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(todayTotal)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">This Week</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(weekTotal)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">This Month</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(monthTotal)}</div>
        </div>
      </div>

      {/* Category Totals */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Total by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryTotals.map(({ category, total }) => (
            <div
              key={category.id}
              className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                  }}
                >
                  {category.name}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

