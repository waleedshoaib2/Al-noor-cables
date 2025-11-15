import { useState, useEffect } from 'react';
import { usePVCMaterialStore } from '@/store/usePVCMaterialStore';
import { useCustomPVCMaterialStore } from '@/store/useCustomPVCMaterialStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import { generateBatchId } from '@/utils/constants';
import type { PVCMaterial } from '@/types';

interface PVCFormProps {
  material?: PVCMaterial | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function PVCForm({ material, onClose, onSubmit }: PVCFormProps) {
  const { t, language } = useTranslation();
  const addPVCMaterial = usePVCMaterialStore((state) => state.addPVCMaterial);
  const updatePVCMaterial = usePVCMaterialStore((state) => state.updatePVCMaterial);
  const getAllNames = useCustomPVCMaterialStore((state) => state.getAllNames);

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    batchId: generateBatchId(),
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        quantity: material.quantity.toString(),
        date: material.date.toISOString().split('T')[0],
        batchId: material.batchId,
        notes: material.notes || '',
      });
    } else {
      const newBatchId = generateBatchId(new Date(formData.date));
      setFormData((prev) => ({ ...prev, batchId: newBatchId }));
    }
  }, [material]);

  // Regenerate batch ID when date changes (only for new entries)
  useEffect(() => {
    if (!material) {
      const newBatchId = generateBatchId(new Date(formData.date));
      setFormData((prev) => ({ ...prev, batchId: newBatchId }));
    }
  }, [formData.date, material]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = language === 'ur' ? 'نام درکار ہے' : 'Name is required';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = language === 'ur' ? 'مقدار 0 سے زیادہ ہونی چاہیے' : 'Quantity must be greater than 0';
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
      const materialData = {
        name: formData.name.trim(),
        quantity: parseFloat(formData.quantity),
        date: new Date(formData.date),
        batchId: formData.batchId,
        notes: formData.notes.trim() || undefined,
      };

      if (material) {
        updatePVCMaterial(material.id, materialData);
      } else {
        addPVCMaterial(materialData);
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Error saving PVC material',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Material Name - Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ur' ? 'کسٹم مواد *' : 'Custom Material *'}
        </label>
        <div className="relative">
          <select
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`border border-gray-300 rounded-md px-3 py-2 pr-10 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
              errors.name ? 'border-red-500' : ''
            }`}
          >
            <option value="">{language === 'ur' ? 'منتخب کریں' : 'Select'}</option>
            {getAllNames().map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
        {getAllNames().length === 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {language === 'ur' ? 'پہلے کسٹم مواد شامل کریں' : 'Please add custom materials first'}
          </p>
        )}
      </div>

      {/* Quantity */}
      <Input
        label={language === 'ur' ? 'مقدار (KG) *' : 'Quantity (KG) *'}
        type="text"
        inputMode="decimal"
        value={formData.quantity}
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9.]/g, '');
          const parts = value.split('.');
          const filteredValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;
          setFormData({ ...formData, quantity: filteredValue });
        }}
        placeholder="0.00"
        error={errors.quantity}
      />

      {/* Date */}
      <Input
        label={language === 'ur' ? 'تاریخ *' : 'Date *'}
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
      />

      {/* Batch ID - Auto-generated, read-only */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ur' ? 'بیچ ID' : 'Batch ID'}
        </label>
        <input
          type="text"
          value={formData.batchId}
          readOnly
          className="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">
          {language === 'ur' ? 'تاریخ کی بنیاد پر خودکار تیار' : 'Auto-generated based on date'}
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ur' ? 'نوٹس' : 'Notes'}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
          rows={3}
          placeholder={language === 'ur' ? 'اضافی نوٹس (اختیاری)' : 'Additional notes (optional)'}
        />
      </div>

      {errors.submit && (
        <p className="text-sm text-red-600">{errors.submit}</p>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading
            ? language === 'ur' ? 'محفوظ ہو رہا ہے...' : 'Saving...'
            : material
            ? language === 'ur' ? 'اپ ڈیٹ' : 'Update'
            : language === 'ur' ? 'شامل کریں' : 'Add'}
        </Button>
      </div>
    </form>
  );
}

