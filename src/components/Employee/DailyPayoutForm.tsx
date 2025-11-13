import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dailyPayoutSchema } from '@/utils/validation';
import { Modal } from '@/components/Common/Modal';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import type { DailyPayout } from '@/types';

interface DailyPayoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  payout?: DailyPayout | null;
  employeeName: string;
  remainingSalary: number;
  onSubmit: (data: any) => void;
}

export default function DailyPayoutForm({ 
  isOpen, 
  onClose, 
  payout, 
  employeeName,
  remainingSalary,
  onSubmit 
}: DailyPayoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    watch,
  } = useForm({
    resolver: zodResolver(dailyPayoutSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: false,
    criteriaMode: 'all',
    defaultValues: payout
      ? {
          amount: String(payout.amount),
          date: payout.date.toISOString().split('T')[0],
          notes: payout.notes || '',
        }
      : {
          amount: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        },
  });

  const amountValue = watch('amount');

  // Clear errors and reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setHasAttemptedSubmit(false);
      clearErrors();
      // Reset form when opening
      if (payout) {
        reset({
          amount: String(payout.amount),
          date: payout.date.toISOString().split('T')[0],
          notes: payout.notes || '',
        }, { keepErrors: false, keepDefaultValues: false });
      } else {
        reset({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        }, { keepErrors: false, keepDefaultValues: false });
      }
    } else {
      // Clear form when modal closes
      setHasAttemptedSubmit(false);
      clearErrors();
    }
  }, [isOpen, clearErrors, reset, payout]);

  const onFormSubmit = async (data: any) => {
    setHasAttemptedSubmit(true);
    const payoutAmount = typeof data.amount === 'number' ? data.amount : Number(data.amount);
    
    // Check if payout exceeds remaining salary
    if (payoutAmount > remainingSalary) {
      alert(`Payout amount (${payoutAmount.toLocaleString()}) exceeds remaining salary (${remainingSalary.toLocaleString()})`);
      setHasAttemptedSubmit(false);
      return;
    }

    setLoading(true);
    try {
      // Data is already transformed by zod schema
      await onSubmit({
        amount: payoutAmount,
        date: data.date instanceof Date ? data.date : new Date(data.date),
        notes: data.notes || '',
      });
      setHasAttemptedSubmit(false);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const payoutAmount = amountValue ? (typeof amountValue === 'string' ? Number(amountValue) : amountValue) : 0;
  const willExceed = payoutAmount > remainingSalary;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={payout ? 'Edit Daily Payout' : 'Add Daily Payout'}
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Employee:</span> {employeeName}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-medium">Remaining Salary:</span>{' '}
            <span className="font-semibold text-blue-700">
              {remainingSalary.toLocaleString()} PKR
            </span>
          </p>
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

        {willExceed && amountValue && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">
              ⚠️ Warning: This payout will exceed the remaining salary by{' '}
              {(payoutAmount - remainingSalary).toLocaleString()} PKR
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            {...register('notes')}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading || willExceed}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

