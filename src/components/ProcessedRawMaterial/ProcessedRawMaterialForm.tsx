import { useState, useEffect } from 'react';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import { generateBatchId } from '@/utils/constants';
import type { ProcessedRawMaterial } from '@/types';

interface ProcessedRawMaterialFormProps {
  material?: ProcessedRawMaterial | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ProcessedRawMaterialForm({
  material,
  onClose,
  onSubmit,
}: ProcessedRawMaterialFormProps) {
  const { t, language } = useTranslation();
  const addProcessedMaterial = useProcessedRawMaterialStore(
    (state) => state.addProcessedMaterial
  );
  const updateProcessedMaterial = useProcessedRawMaterialStore(
    (state) => state.updateProcessedMaterial
  );
  const processedMaterialNames = useProcessedRawMaterialStore(
    (state) => state.processedMaterialNames
  );
  const deductStock = useRawMaterialStore((state) => state.deductStock);
  const getAvailableStockByType = useRawMaterialStore(
    (state) => state.getAvailableStockByType
  );

  const [formData, setFormData] = useState({
    name: '',
    materialType: '',
    inputQuantity: '',
    numberOfBundles: '',
    weightPerBundle: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [availableStock, setAvailableStock] = useState(0);

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        materialType: material.materialType,
        inputQuantity: material.inputQuantity.toString(),
        numberOfBundles: material.numberOfBundles.toString(),
        weightPerBundle: material.weightPerBundle.toString(),
        date: material.date.toISOString().split('T')[0],
        notes: material.notes || '',
      });
    }
  }, [material]);

  useEffect(() => {
    if (formData.materialType) {
      const stock = getAvailableStockByType(formData.materialType);
      setAvailableStock(stock);
    } else {
      setAvailableStock(0);
    }
  }, [formData.materialType, getAvailableStockByType]);

  // Regenerate batch ID when date changes (only for new entries)
  useEffect(() => {
    if (!material) {
      const newBatchId = generateBatchId(new Date(formData.date));
      // Batch ID is auto-generated, no need to store in formData
    }
  }, [formData.date, material]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = language === 'ur' ? 'نام درکار ہے' : 'Name is required';
    }

    if (!formData.materialType.trim()) {
      newErrors.materialType =
        language === 'ur' ? 'مواد کی قسم درکار ہے' : 'Material type is required';
    }

    if (!formData.date) {
      newErrors.date = language === 'ur' ? 'تاریخ درکار ہے' : 'Date is required';
    }

    if (!formData.inputQuantity || parseFloat(formData.inputQuantity) <= 0) {
      newErrors.inputQuantity =
        language === 'ur'
          ? 'ان پٹ مقدار 0 سے زیادہ ہونی چاہیے'
          : 'Input quantity must be greater than 0';
    }

    if (!formData.numberOfBundles || parseFloat(formData.numberOfBundles) <= 0) {
      newErrors.numberOfBundles =
        language === 'ur'
          ? 'بنڈلز کی تعداد 0 سے زیادہ ہونی چاہیے'
          : 'Number of bundles must be greater than 0';
    }

    if (!formData.weightPerBundle || parseFloat(formData.weightPerBundle) <= 0) {
      newErrors.weightPerBundle =
        language === 'ur'
          ? 'فی بنڈل وزن 0 سے زیادہ ہونا چاہیے'
          : 'Weight per bundle must be greater than 0';
    }

    // Check available stock
    if (formData.materialType && !material) {
      const inputQty = parseFloat(formData.inputQuantity);
      if (inputQty > availableStock) {
        newErrors.inputQuantity =
          language === 'ur'
            ? `دستیاب اسٹاک: ${availableStock.toFixed(2)} کلوگرام`
            : `Available stock: ${availableStock.toFixed(2)} kgs`;
      }
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
      const inputQty = parseFloat(formData.inputQuantity);
      const numBundles = parseFloat(formData.numberOfBundles);
      const weightPerBundle = parseFloat(formData.weightPerBundle);

      // Deduct stock from raw materials (FIFO)
      let batchesUsed: any[] = [];
      if (!material) {
        batchesUsed = deductStock(formData.materialType, inputQty);
      }

      const processedMaterialData = {
        name: formData.name.trim(),
        materialType: formData.materialType.trim(),
        inputQuantity: inputQty,
        numberOfBundles: numBundles,
        weightPerBundle: weightPerBundle,
        date: new Date(formData.date),
        batchId: material
          ? material.batchId
          : generateBatchId(new Date(formData.date)),
        notes: formData.notes.trim() || undefined,
        rawMaterialBatchesUsed: material ? material.rawMaterialBatchesUsed : batchesUsed,
      };

      if (material) {
        updateProcessedMaterial(material.id, processedMaterialData);
      } else {
        addProcessedMaterial(processedMaterialData);
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      setErrors({
        inputQuantity: error.message || 'Error processing material',
      });
    } finally {
      setLoading(false);
    }
  };

  const outputQuantity =
    parseFloat(formData.numberOfBundles) * parseFloat(formData.weightPerBundle) || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Processed Material Name with datalist */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('processedMaterialName', 'processedMaterial')} *
        </label>
        <div className="relative">
          <input
            type="text"
            list="processedMaterialNames"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`border border-gray-300 rounded-md px-3 py-2 pr-10 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
              errors.name ? 'border-red-500' : ''
            }`}
            placeholder={t('typeOrSelect', 'processedMaterial')}
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
          <datalist id="processedMaterialNames">
            {processedMaterialNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Material Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('materialType', 'processedMaterial')} *
        </label>
        <select
          value={formData.materialType}
          onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.materialType ? 'border-red-500' : ''
          }`}
        >
          <option value="">{t('selectMaterialType', 'processedMaterial')}</option>
          <option value="Copper">Copper</option>
          <option value="Silver">Silver</option>
        </select>
        {formData.materialType && (
          <p className="mt-1 text-xs text-gray-500">
            {t('availableStock', 'processedMaterial')}: {availableStock.toFixed(2)} kgs
          </p>
        )}
        {errors.materialType && (
          <p className="mt-1 text-sm text-red-600">{errors.materialType}</p>
        )}
      </div>

      {/* Input Quantity */}
      <Input
        label={`${t('inputQuantity', 'processedMaterial')} (kgs) *`}
        type="number"
        step="0.01"
        min="0"
        value={formData.inputQuantity}
        onChange={(e) => setFormData({ ...formData, inputQuantity: e.target.value })}
        placeholder="0.00"
        error={errors.inputQuantity}
      />

      {/* Number of Bundles and Weight Per Bundle */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={`${t('numberOfBundles', 'processedMaterial')} *`}
          type="number"
          step="1"
          min="1"
          value={formData.numberOfBundles}
          onChange={(e) => setFormData({ ...formData, numberOfBundles: e.target.value })}
          placeholder="0"
          error={errors.numberOfBundles}
        />
        <Input
          label={`${t('weightPerBundle', 'processedMaterial')} (kgs) *`}
          type="number"
          step="0.01"
          min="0"
          value={formData.weightPerBundle}
          onChange={(e) => setFormData({ ...formData, weightPerBundle: e.target.value })}
          placeholder="0.00"
          error={errors.weightPerBundle}
        />
      </div>

      {/* Output Quantity (calculated) */}
      {outputQuantity > 0 && (
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-600">{t('totalOutput', 'processedMaterial')}</div>
          <div className="text-lg font-bold text-brand-blue">
            {outputQuantity.toFixed(2)} kgs ({formData.numberOfBundles} {t('bundles', 'processedMaterial')})
          </div>
        </div>
      )}

      {/* Date */}
      <Input
        label={`${t('date', 'processedMaterial')} *`}
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
      />

      {/* Batch ID - Auto-generated, read-only */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('batchId', 'processedMaterial')}
        </label>
        <input
          type="text"
          value={material ? material.batchId : generateBatchId(new Date(formData.date))}
          readOnly
          className="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">{t('autoGenerated', 'processedMaterial')}</p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes', 'processedMaterial')}</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
          rows={3}
          placeholder={t('additionalNotes', 'processedMaterial')}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? t('saving', 'processedMaterial') : material ? t('update', 'processedMaterial') : t('add', 'processedMaterial')}
        </Button>
      </div>
    </form>
  );
}

