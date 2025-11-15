import { useState, useEffect } from 'react';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import { generateBatchId } from '@/utils/constants';
import type { RawMaterial } from '@/types';

interface RawMaterialFormProps {
  material?: RawMaterial | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function RawMaterialForm({ material, onClose, onSubmit }: RawMaterialFormProps) {
  const { t, language } = useTranslation();
  const addRawMaterial = useRawMaterialStore((state) => state.addRawMaterial);
  const updateRawMaterial = useRawMaterialStore((state) => state.updateRawMaterial);
  const materialTypes = useRawMaterialStore((state) => state.materialTypes);
  const suppliers = useRawMaterialStore((state) => state.suppliers);
  const processedMaterials = useProcessedRawMaterialStore((state) => state.processedMaterials);

  // Check if material has been used in processed materials
  const isMaterialUsed = material
    ? processedMaterials.some((pm) =>
        pm.rawMaterialBatchesUsed?.some((batch) => batch.rawMaterialId === material.id)
      )
    : false;

  const [formData, setFormData] = useState({
    materialType: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    batchId: generateBatchId(),
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material) {
      setFormData({
        materialType: material.materialType,
        supplier: material.supplier,
        date: material.date.toISOString().split('T')[0],
        quantity: material.quantity.toString(),
        batchId: material.batchId,
        notes: material.notes || '',
      });
    } else {
      // Generate new batch ID when date changes
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

    if (!formData.materialType.trim()) {
      newErrors.materialType = language === 'ur' ? 'مواد کی قسم درکار ہے' : 'Material type is required';
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = language === 'ur' ? 'سپلائر درکار ہے' : 'Supplier is required';
    }

    if (!formData.date) {
      newErrors.date = language === 'ur' ? 'تاریخ درکار ہے' : 'Date is required';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = language === 'ur' ? 'مقدار 0 سے زیادہ ہونی چاہیے' : 'Quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent editing if material has been used
    if (material && isMaterialUsed) {
      alert(language === 'ur' 
        ? 'یہ مواد پروسیس شدہ مواد میں استعمال ہو چکا ہے اور اس میں ترمیم نہیں کی جا سکتی'
        : 'This material has been used in processed materials and cannot be edited');
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const rawMaterialData = {
        materialType: formData.materialType.trim(),
        supplier: formData.supplier.trim(),
        date: new Date(formData.date),
        quantity: parseFloat(formData.quantity),
        batchId: material ? formData.batchId.trim() : generateBatchId(new Date(formData.date)),
        notes: formData.notes.trim() || undefined,
      };

      if (material) {
        updateRawMaterial(material.id, rawMaterialData);
      } else {
        addRawMaterial(rawMaterialData);
      }

      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error saving raw material:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Warning if material has been used */}
      {isMaterialUsed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                {language === 'ur'
                  ? 'یہ مواد پروسیس شدہ مواد میں استعمال ہو چکا ہے۔ صرف کل مقدار میں تبدیلی کی جاسکتی ہے، مواد کی تفصیلات میں ترمیم نہیں کی جا سکتی۔'
                  : 'This material has been used in processed materials. Only the total quantity can be updated; material details cannot be edited.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Material Type with improved dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('materialType')} *
        </label>
        <div className="relative">
          <input
            type="text"
            list="materialTypes"
            value={formData.materialType}
            onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
            disabled={isMaterialUsed}
            className={`border border-gray-300 rounded-md px-3 py-2 pr-10 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
              errors.materialType ? 'border-red-500' : ''
            } ${isMaterialUsed ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder={t('typeOrSelect')}
            autoComplete="off"
          />
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
          <datalist id="materialTypes">
            {materialTypes.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>
        {errors.materialType && (
          <p className="mt-1 text-sm text-red-600">{errors.materialType}</p>
        )}
      </div>

      {/* Supplier with improved dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('supplier')} *
        </label>
        <div className="relative">
          <input
            type="text"
            list="suppliers"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            disabled={isMaterialUsed}
            className={`border border-gray-300 rounded-md px-3 py-2 pr-10 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
              errors.supplier ? 'border-red-500' : ''
            } ${isMaterialUsed ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder={t('typeOrSelect')}
            autoComplete="off"
          />
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
          <datalist id="suppliers">
            {suppliers.map((supplier) => (
              <option key={supplier} value={supplier} />
            ))}
          </datalist>
        </div>
        {errors.supplier && (
          <p className="mt-1 text-sm text-red-600">{errors.supplier}</p>
        )}
      </div>

      {/* Date and Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={`${t('date')} *`}
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date}
          disabled={isMaterialUsed}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {`${t('quantity')} *`}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={formData.quantity}
            onChange={(e) => {
              // Allow numbers and one decimal point
              const value = e.target.value.replace(/[^0-9.]/g, '');
              // Ensure only one decimal point
              const parts = value.split('.');
              const filteredValue = parts.length > 2 
                ? parts[0] + '.' + parts.slice(1).join('')
                : value;
              setFormData({ ...formData, quantity: filteredValue });
            }}
            placeholder="0.00"
            disabled={isMaterialUsed}
            className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
              errors.quantity ? 'border-red-500' : ''
            } ${isMaterialUsed ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>
      </div>

      {/* Batch ID - Auto-generated, read-only */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('batchId')}
        </label>
        <input
          type="text"
          value={formData.batchId}
          readOnly
          className="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">{t('autoGenerated')}</p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('notes')}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
          rows={3}
          placeholder="Additional notes (optional)"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? t('saving') : material ? t('update') : t('add')}
        </Button>
      </div>
    </form>
  );
}

