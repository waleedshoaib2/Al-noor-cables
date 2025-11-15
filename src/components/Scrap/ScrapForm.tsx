import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import { useScrapStore } from '@/store/useScrapStore';
import type { Scrap } from '@/types';

interface ScrapFormProps {
  scrap?: Scrap | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ScrapForm({ scrap, onClose, onSubmit }: ScrapFormProps) {
  const { t, language } = useTranslation();
  const addScrap = useScrapStore((state) => state.addScrap);
  const updateScrap = useScrapStore((state) => state.updateScrap);

  const [formData, setFormData] = useState({
    amount: '',
    materialType: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scrap) {
      setFormData({
        amount: scrap.amount.toString(),
        materialType: scrap.materialType,
        date: scrap.date.toISOString().split('T')[0],
        notes: scrap.notes || '',
      });
    }
  }, [scrap]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount =
        language === 'ur' ? 'سکریپ کی مقدار 0 سے زیادہ ہونی چاہیے' : 'Scrap amount must be greater than 0';
    }

    if (!formData.materialType) {
      newErrors.materialType =
        language === 'ur' ? 'مواد کی قسم درکار ہے' : 'Material type is required';
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

    setLoading(true);

    try {
      const scrapData = {
        amount: parseFloat(formData.amount),
        materialType: formData.materialType as 'Copper' | 'Silver',
        date: new Date(formData.date),
        notes: formData.notes.trim() || undefined,
      };

      if (scrap) {
        updateScrap(scrap.id, scrapData);
      } else {
        addScrap(scrapData);
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      setErrors({
        amount: error.message || 'Error saving scrap',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Material Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('materialType', 'scrap')} *
        </label>
        <select
          value={formData.materialType}
          onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.materialType ? 'border-red-500' : ''
          }`}
        >
          <option value="">{t('selectMaterialType', 'scrap')}</option>
          <option value="Copper">Copper</option>
          <option value="Silver">Silver</option>
        </select>
        {errors.materialType && (
          <p className="mt-1 text-sm text-red-600">{errors.materialType}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {`${t('amount', 'scrap')} (kgs) *`}
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={formData.amount}
          onChange={(e) => {
            // Allow numbers and one decimal point
            const value = e.target.value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = value.split('.');
            const filteredValue = parts.length > 2 
              ? parts[0] + '.' + parts.slice(1).join('')
              : value;
            setFormData({ ...formData, amount: filteredValue });
          }}
          placeholder="0.00"
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.amount ? 'border-red-500' : ''
          }`}
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      {/* Date */}
      <Input
        label={`${t('date', 'scrap')} *`}
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
      />

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('notes', 'scrap')}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
          rows={3}
          placeholder={t('additionalNotes', 'scrap')}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading
            ? t('saving', 'scrap')
            : scrap
            ? t('update', 'scrap')
            : t('add', 'scrap')}
        </Button>
      </div>
    </form>
  );
}

