import { useState } from 'react';
import { useExpenseStore } from '@/store/useExpenseStore';
import ExpenseList from '@/components/Expense/ExpenseList';
import ExpenseForm from '@/components/Expense/ExpenseForm';
import ExpenseStats from '@/components/Expense/ExpenseStats';
import { Button } from '@/components/Common/Button';
import type { Expense } from '@/types';

export default function ExpenseTracker() {
  const addExpense = useExpenseStore((state) => state.addExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
        <Button variant="primary" onClick={handleAddExpense}>
          Add Expense
        </Button>
      </div>

      <ExpenseStats />

      <ExpenseList onEdit={handleEditExpense} onDelete={handleDeleteExpense} />

      <ExpenseForm
        isOpen={showExpenseForm}
        onClose={() => {
          setShowExpenseForm(false);
          setEditingExpense(null);
        }}
        expense={editingExpense}
        onSubmit={handleExpenseSubmit}
      />
    </div>
  );
}
