import { useState } from 'react';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useTranslation } from '@/hooks/useTranslation';
import ExpenseList from '@/components/Expense/ExpenseList';
import ExpenseForm from '@/components/Expense/ExpenseForm';
import ExpenseStats from '@/components/Expense/ExpenseStats';
import ExpensePrintView from '@/components/Expense/ExpensePrintView';
import { Button } from '@/components/Common/Button';
import type { Expense } from '@/types';

export default function ExpenseTracker() {
  const { language } = useTranslation();
  const addExpense = useExpenseStore((state) => state.addExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const expenses = useExpenseStore((state) => state.expenses);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [printFilters, setPrintFilters] = useState<{
    startDate?: string;
    endDate?: string;
    categoryId?: number;
  }>({});

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    if (window.confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      deleteExpense(expense.id);
    }
  };

  const handleExpenseSubmit = (data: any) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
    } else {
      addExpense(data);
    }
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  // Print handler
  const handlePrint = () => {
    // Get current filters from ExpenseList by reading from localStorage or state
    // For now, we'll pass empty filters and let the print view show all expenses
    // The print view will respect any filters passed to it
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ur' ? 'خرچوں کا ٹریکر' : 'Expense Tracker'}
        </h1>
        <div className="flex gap-2">
          {expenses.length > 0 && (
            <Button variant="secondary" onClick={handlePrint} className="no-print">
              🖨️ {language === 'ur' ? 'پرنٹ' : 'Print'}
            </Button>
          )}
          <Button variant="primary" onClick={handleAddExpense}>
            {language === 'ur' ? '+ خرچہ شامل کریں' : '+ Add Expense'}
          </Button>
        </div>
      </div>

      <ExpenseStats />

      <ExpenseList
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        onFiltersChange={setPrintFilters}
      />

      <ExpenseForm
        isOpen={showExpenseForm}
        onClose={() => {
          setShowExpenseForm(false);
          setEditingExpense(null);
        }}
        expense={editingExpense}
        onSubmit={handleExpenseSubmit}
      />

      {/* Print View - Only visible when printing */}
      <div className="print-view" style={{ display: 'none' }}>
        <ExpensePrintView filters={printFilters} />
      </div>
    </div>
  );
}
