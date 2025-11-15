import { useTranslation } from '@/hooks/useTranslation';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/helpers';
import type { Expense } from '@/types';

interface ExpensePrintViewProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
  };
}

export default function ExpensePrintView({ filters }: ExpensePrintViewProps) {
  const { t, language } = useTranslation();
  const printDate = new Date().toLocaleString();
  const expenses = useExpenseStore((state) => state.expenses);
  const expenseCategories = useCategoryStore((state) => state.expenseCategories);
  const getTotalByPeriod = useExpenseStore((state) => state.getTotalByPeriod);

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    if (filters?.startDate) {
      const expenseDate = format(new Date(expense.date), 'yyyy-MM-dd');
      if (expenseDate < filters.startDate) return false;
    }
    if (filters?.endDate) {
      const expenseDate = format(new Date(expense.date), 'yyyy-MM-dd');
      if (expenseDate > filters.endDate) return false;
    }
    if (filters?.categoryId) {
      if (expense.categoryId !== filters.categoryId) return false;
    }
    return true;
  });

  // Sort by date (newest first)
  filteredExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate totals by category
  const categoryTotals = expenseCategories.map((cat) => ({
    category: cat,
    total: filteredExpenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0),
  }));

  const getCategory = (categoryId: number) => {
    return expenseCategories.find((c) => c.id === categoryId);
  };

  return (
    <div className="print-view p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="mb-6 border-b-4 border-gray-900 pb-4" dir="rtl">
        <div className="flex justify-between items-start">
          <div className="text-right flex-1">
            <div className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '1px' }}>
              النور كيبل هاؤس
            </div>
            <div className="text-xl font-semibold text-gray-800 mb-2">
              {language === 'ur' ? 'خرچوں کی رپورٹ' : 'Expenses Report'}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                {language === 'ur' ? 'پرنٹ کی تاریخ:' : 'Printed on:'} {printDate}
              </div>
              {(filters?.startDate || filters?.endDate || filters?.categoryId) && (
                <div>
                  {language === 'ur' ? 'فلٹر:' : 'Filter:'}{' '}
                  {filters?.startDate && (
                    <span>
                      {language === 'ur' ? 'شروع:' : 'Start:'} {format(new Date(filters.startDate), 'dd/MM/yyyy')}
                    </span>
                  )}
                  {filters?.startDate && filters?.endDate && ' - '}
                  {filters?.endDate && (
                    <span>
                      {language === 'ur' ? 'آخر:' : 'End:'} {format(new Date(filters.endDate), 'dd/MM/yyyy')}
                    </span>
                  )}
                  {filters?.categoryId && (
                    <span>
                      {' | '}
                      {language === 'ur' ? 'زمرہ:' : 'Category:'} {getCategory(filters.categoryId)?.name || ''}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards - Total by Category */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          {language === 'ur' ? 'زمرہ کے لحاظ سے کل' : 'Total by Category'}
        </h3>
        <div className="grid grid-cols-3 gap-4" dir="rtl">
          {categoryTotals.map(({ category, total }) => (
            <div key={category.id} className="border-2 border-gray-800 bg-gray-50 p-4 text-center">
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1" style={{ color: category.color }}>
                {category.name}
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Summary */}
      <div className="mb-6 border-2 border-gray-800 bg-gray-50 p-4 text-center" dir="rtl">
        <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
          {language === 'ur' ? 'کل خرچے' : 'Total Expenses'}
        </div>
        <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
      </div>

      {/* Expenses Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          {language === 'ur' ? 'خرچوں کی تفصیلات' : 'Expense Details'}
        </h3>
        <table className="w-full border-collapse border-2 border-gray-800" dir={language === 'ur' ? 'rtl' : 'ltr'} style={{ borderSpacing: 0 }}>
          <thead>
            <tr className="bg-gray-200">
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{ backgroundColor: '#e5e7eb' }}>
                {language === 'ur' ? 'تاریخ' : 'Date'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{ backgroundColor: '#e5e7eb' }}>
                {language === 'ur' ? 'عنوان' : 'Title'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{ backgroundColor: '#e5e7eb' }}>
                {language === 'ur' ? 'زمرہ' : 'Category'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{ backgroundColor: '#e5e7eb' }}>
                {language === 'ur' ? 'رقم' : 'Amount'}
              </th>
              {filteredExpenses.some((e) => e.description) && (
                <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{ backgroundColor: '#e5e7eb' }}>
                  {language === 'ur' ? 'تفصیل' : 'Description'}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan={filteredExpenses.some((e) => e.description) ? 5 : 4}
                  className="border-2 border-gray-800 px-4 py-4 text-center text-sm text-gray-600"
                >
                  {language === 'ur' ? 'کوئی خرچہ نہیں ملا' : 'No expenses found'}
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense, index) => {
                const category = getCategory(expense.categoryId);
                const isEven = index % 2 === 0;
                return (
                  <tr key={expense.id} style={{ backgroundColor: isEven ? '#ffffff' : '#f9fafb' }}>
                    <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                      {format(new Date(expense.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900 font-semibold">
                      {expense.title}
                    </td>
                    <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                      {category?.name || '-'}
                    </td>
                    <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    {filteredExpenses.some((e) => e.description) && (
                      <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                        {expense.description || '-'}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredExpenses.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
                <td
                  colSpan={filteredExpenses.some((e) => e.description) ? 3 : 2}
                  className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900"
                >
                  {language === 'ur' ? 'کل' : 'Total'}
                </td>
                <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </td>
                {filteredExpenses.some((e) => e.description) && (
                  <td className="border-2 border-gray-800 px-4 py-3"></td>
                )}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-4 border-gray-900 text-center text-xs text-gray-600" dir="rtl">
        <p>Al Noor Cables - {language === 'ur' ? 'خرچوں کی رپورٹ' : 'Expenses Report'}</p>
        <p>{language === 'ur' ? 'تاریخ پیدائش:' : 'Generated on'} {printDate}</p>
      </div>
    </div>
  );
}

