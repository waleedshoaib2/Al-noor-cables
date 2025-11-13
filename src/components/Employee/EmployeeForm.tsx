import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema } from '@/utils/validation';
import { Modal } from '@/components/Common/Modal';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import type { Employee } from '@/types';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSubmit: (data: any) => void;
}

export default function EmployeeForm({ isOpen, onClose, employee, onSubmit }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm({
    resolver: zodResolver(employeeSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: false,
    criteriaMode: 'all',
    defaultValues: employee
      ? {
          name: employee.name,
          salaryDate: employee.salaryDate.toISOString().split('T')[0],
          totalSalary: String(employee.totalSalary),
        }
      : {
          name: '',
          salaryDate: new Date().toISOString().split('T')[0],
          totalSalary: '',
        },
  });

  // Clear errors and reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setHasAttemptedSubmit(false);
      clearErrors();
      // Reset form when opening
      if (employee) {
        reset({
          name: employee.name,
          salaryDate: employee.salaryDate.toISOString().split('T')[0],
          totalSalary: String(employee.totalSalary),
        }, { keepErrors: false, keepDefaultValues: false });
      } else {
        reset({
          name: '',
          salaryDate: new Date().toISOString().split('T')[0],
          totalSalary: '',
        }, { keepErrors: false, keepDefaultValues: false });
      }
    } else {
      // Clear form when modal closes
      setHasAttemptedSubmit(false);
      clearErrors();
    }
  }, [isOpen, clearErrors, reset, employee]);

  const onFormSubmit = async (data: any) => {
    setHasAttemptedSubmit(true);
    setLoading(true);
    try {
      // Data is already transformed by zod schema
      await onSubmit({
        name: data.name,
        salaryDate: data.salaryDate instanceof Date ? data.salaryDate : new Date(data.salaryDate),
        totalSalary: typeof data.totalSalary === 'number' ? data.totalSalary : Number(data.totalSalary),
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
      title={employee ? 'Edit Employee' : 'Add Employee'}
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label="Employee Name *"
          {...register('name')}
          error={hasAttemptedSubmit ? (errors.name?.message as string) : undefined}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total Salary *"
            type="number"
            step="0.01"
            {...register('totalSalary')}
            error={hasAttemptedSubmit ? (errors.totalSalary?.message as string) : undefined}
          />
          <Input
            label="Salary Date *"
            type="date"
            {...register('salaryDate')}
            error={hasAttemptedSubmit ? (errors.salaryDate?.message as string) : undefined}
          />
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

