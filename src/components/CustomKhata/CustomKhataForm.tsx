import { useState, useEffect } from 'react';
import { useCustomKhataStore } from '@/store/useCustomKhataStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import type { CustomKhata } from '@/types';

interface CustomKhataFormProps {
  entry: CustomKhata | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CustomKhataForm({
  entry,
  onClose,
  onSubmit,
}: CustomKhataFormProps) {
  const { language } = useTranslation();
  const addEntry = useCustomKhataStore((state) => state.addEntry);
  const updateEntry = useCustomKhataStore((state) => state.updateEntry);

  const [formData, setFormData] = useState({
    idNumber: '',
    amount: '',
    amountColor: 'black' as 'red' | 'black',
    details: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry) {
      setFormData({
        idNumber: entry.idNumber,
        amount: entry.amount.toString(),
        amountColor: entry.amountColor,
        details: entry.details,
        date: entry.date.toISOString().split('T')[0],
      });
    } else {
      setFormData({
        idNumber: '',
        amount: '',
        amountColor: 'black',
        details: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [entry]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = language === 'ur' ? 'ID نمبر درکار ہے' : 'ID Number is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = language === 'ur' ? 'رقم درکار ہے' : 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0) {
      newErrors.amount = language === 'ur' ? 'درست رقم درج کریں' : 'Please enter a valid amount';
    }

    if (!formData.details.trim()) {
      newErrors.details = language === 'ur' ? 'تفصیلات درکار ہیں' : 'Details are required';
    }

    if (!formData.date) {
      newErrors.date = language === 'ur' ? 'تاریخ درکار ہے' : 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const entryData = {
      idNumber: formData.idNumber.trim(),
      amount: parseFloat(formData.amount),
      amountColor: formData.amountColor,
      details: formData.details.trim(),
      date: new Date(formData.date),
    };

    if (entry) {
      updateEntry(entry.id, entryData);
    } else {
      addEntry(entryData);
    }

    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* ID Number */}
      <Input
        label={language === 'ur' ? 'ID نمبر *' : 'ID Number *'}
        type="text"
        value={formData.idNumber}
        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
        error={errors.idNumber}
        placeholder={language === 'ur' ? 'ID نمبر درج کریں' : 'Enter ID Number'}
      />

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ur' ? 'رقم *' : 'Amount *'}
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={formData.amount}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.]/g, '');
            const parts = value.split('.');
            const filteredValue = parts.length > 2 
              ? parts[0] + '.' + parts.slice(1).join('')
              : value;
            setFormData({ ...formData, amount: filteredValue });
          }}
          placeholder={language === 'ur' ? 'رقم درج کریں' : 'Enter Amount'}
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.amount ? 'border-red-500' : ''
          }`}
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      {/* Amount Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ur' ? 'رنگ' : 'Color'}
        </label>
        <select
          value={formData.amountColor}
          onChange={(e) => setFormData({ ...formData, amountColor: e.target.value as 'red' | 'black' })}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
        >
          <option value="black">{language === 'ur' ? 'سیاہ' : 'Black'}</option>
          <option value="red">{language === 'ur' ? 'سرخ' : 'Red'}</option>
        </select>
      </div>

      {/* Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ur' ? 'تفصیلات *' : 'Details *'}
        </label>
        <textarea
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.details ? 'border-red-500' : ''
          }`}
          rows={3}
          placeholder={language === 'ur' ? 'تفصیلات درج کریں' : 'Enter Details'}
          dir="rtl"
        />
        {errors.details && (
          <p className="mt-1 text-sm text-red-600">{errors.details}</p>
        )}
      </div>

      {/* Date */}
      <Input
        label={`${language === 'ur' ? 'تاریخ *' : 'Date *'}`}
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
      />

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary">
          {entry ? (language === 'ur' ? 'اپ ڈیٹ' : 'Update') : (language === 'ur' ? 'شامل کریں' : 'Add')}
        </Button>
      </div>
    </form>
  );
}

