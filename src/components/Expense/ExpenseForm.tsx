import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema } from '@/utils/validation';
import { useCategoryStore } from '@/store/useCategoryStore';
import { Modal } from '@/components/Common/Modal';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import type { Expense } from '@/types';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense | null;
  onSubmit: (data: any) => void;
}

export default function ExpenseForm({ isOpen, onClose, expense, onSubmit }: ExpenseFormProps) {
  const expenseCategories = useCategoryStore((state) => state.expenseCategories);
  const [loading, setLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    trigger,
  } = useForm({
    resolver: zodResolver(expenseSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: false,
    criteriaMode: 'all',
    defaultValues: expense
      ? {
          title: expense.title,
          description: expense.description || '',
          amount: String(expense.amount),
          categoryId: String(expense.categoryId),
          date: expense.date.toISOString().split('T')[0],
        }
      : {
          title: '',
          description: '',
          amount: '',
          categoryId: String(expenseCategories[0]?.id || 1),
          date: new Date().toISOString().split('T')[0],
        },
  });

  // Clear errors and reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setHasAttemptedSubmit(false);
      clearErrors();
      // Reset form when opening
      if (expense) {
        reset({
          title: expense.title,
          description: expense.description || '',
          amount: String(expense.amount),
          categoryId: String(expense.categoryId),
          date: expense.date.toISOString().split('T')[0],
        }, { keepErrors: false, keepDefaultValues: false });
      } else {
        reset({
          title: '',
          description: '',
          amount: '',
          categoryId: String(expenseCategories[0]?.id || 1),
          date: new Date().toISOString().split('T')[0],
        }, { keepErrors: false, keepDefaultValues: false });
      }
    } else {
      // Clear form when modal closes
      setHasAttemptedSubmit(false);
      clearErrors();
    }
  }, [isOpen, clearErrors, reset, expense, expenseCategories]);

  const onFormSubmit = async (data: any) => {
    setHasAttemptedSubmit(true);
    setLoading(true);
    try {
      // Data is already transformed by zod schema
      await onSubmit({
        title: data.title,
        description: data.description || '',
        amount: typeof data.amount === 'number' ? data.amount : Number(data.amount),
        categoryId: typeof data.categoryId === 'number' ? data.categoryId : Number(data.categoryId),
        date: data.date instanceof Date ? data.date : new Date(data.date),
      });
      setHasAttemptedSubmit(false);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? 'Edit Expense' : 'Add Expense'}
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label="Title *"
          {...register('title')}
          error={hasAttemptedSubmit ? (errors.title?.message as string) : undefined}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            {...register('description')}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount *"
            type="number"
            step="0.01"
            {...register('amount')}
            error={hasAttemptedSubmit ? (errors.amount?.message as string) : undefined}
          />
          <Input
            label="Date *"
            type="date"
            {...register('date')}
            error={hasAttemptedSubmit ? (errors.date?.message as string) : undefined}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            {...register('categoryId')}
          >
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId.message as string}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

