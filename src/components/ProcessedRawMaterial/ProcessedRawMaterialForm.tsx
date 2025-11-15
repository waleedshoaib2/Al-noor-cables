import { useState, useEffect, useMemo } from 'react';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useCustomProcessedRawMaterialStore } from '@/store/useCustomProcessedRawMaterialStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import { generateBatchId } from '@/utils/constants';
import type { ProcessedRawMaterial } from '@/types';

interface ProcessedMaterialItem {
  name: string;
  numberOfBundles: string;
  weightPerBundle: string;
  grossWeightPerBundle: string;
}

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
  const addProcessedMaterialBatch = useProcessedRawMaterialStore(
    (state) => state.addProcessedMaterialBatch
  );
  const updateProcessedMaterial = useProcessedRawMaterialStore(
    (state) => state.updateProcessedMaterial
  );
  const processedMaterialsStore = useProcessedRawMaterialStore(
    (state) => state.processedMaterials
  );
  const customProcessedMaterials = useCustomProcessedRawMaterialStore(
    (state) => state.customProcessedMaterials
  );
  const deductStock = useRawMaterialStore((state) => state.deductStock);
  const getAvailableStockByType = useRawMaterialStore(
    (state) => state.getAvailableStockByType
  );

  const [formData, setFormData] = useState({
    materialType: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Filter processed material names based on selected material type
  const processedMaterialNames = useMemo(() => {
    if (!formData.materialType) {
      return [];
    }
    
    // Get names from processed materials that match the material type
    const namesFromProcessed = processedMaterialsStore
      .filter((m) => m.materialType.toLowerCase() === formData.materialType.toLowerCase())
      .map((m) => m.name);
    
    // Get names from custom processed materials that match the prior raw material type
    const namesFromCustom = customProcessedMaterials
      .filter((m) => m.priorRawMaterial.toLowerCase() === formData.materialType.toLowerCase())
      .map((m) => m.name);
    
    // Combine and get unique names
    const allNames = [...new Set([...namesFromProcessed, ...namesFromCustom])];
    return allNames.sort();
  }, [formData.materialType, processedMaterialsStore, customProcessedMaterials]);

  const [processedMaterials, setProcessedMaterials] = useState<ProcessedMaterialItem[]>([
    { name: '', numberOfBundles: '', weightPerBundle: '', grossWeightPerBundle: '' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [materialErrors, setMaterialErrors] = useState<Record<number, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [availableStock, setAvailableStock] = useState(0);

  useEffect(() => {
    if (material) {
      // For editing, populate single material (legacy support)
      setFormData({
        materialType: material.materialType,
        date: material.date.toISOString().split('T')[0],
        notes: material.notes || '',
      });
      setProcessedMaterials([
        {
          name: material.name,
          numberOfBundles: material.numberOfBundles.toString(),
          // Display total safi weight (weightPerBundle * numberOfBundles) when editing
          weightPerBundle: (material.weightPerBundle * material.numberOfBundles).toString(),
          grossWeightPerBundle: material.grossWeightPerBundle?.toString() || '',
        },
      ]);
    }
  }, [material]);

  // Calculate total output for stock checking (weightPerBundle now stores total safi weight)
  const totalOutput = processedMaterials.reduce((sum, pm) => {
    const totalWeight = parseFloat(pm.weightPerBundle) || 0;
    return sum + totalWeight;
  }, 0);

  useEffect(() => {
    if (formData.materialType) {
      const stock = getAvailableStockByType(formData.materialType);
      setAvailableStock(stock);
    } else {
      setAvailableStock(0);
    }
  }, [formData.materialType, getAvailableStockByType, totalOutput]);

  const addProcessedMaterialRow = () => {
    setProcessedMaterials([
      ...processedMaterials,
      { name: '', numberOfBundles: '', weightPerBundle: '', grossWeightPerBundle: '' },
    ]);
  };

  const removeProcessedMaterialRow = (index: number) => {
    if (processedMaterials.length > 1) {
      setProcessedMaterials(processedMaterials.filter((_, i) => i !== index));
      // Remove errors for this row
      const newErrors = { ...materialErrors };
      delete newErrors[index];
      setMaterialErrors(newErrors);
    }
  };

  const updateProcessedMaterialRow = (index: number, field: keyof ProcessedMaterialItem, value: string) => {
    const updated = [...processedMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setProcessedMaterials(updated);
    // Clear errors for this field
    if (materialErrors[index]) {
      const newErrors = { ...materialErrors };
      delete newErrors[index]?.[field];
      setMaterialErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const newMaterialErrors: Record<number, Record<string, string>> = {};

    if (!formData.materialType.trim()) {
      newErrors.materialType =
        language === 'ur' ? 'مواد کی قسم درکار ہے' : 'Material type is required';
    }

    if (!formData.date) {
      newErrors.date = language === 'ur' ? 'تاریخ درکار ہے' : 'Date is required';
    }

    // Calculate total output (weightPerBundle now stores total safi weight)
    const totalOutput = processedMaterials.reduce((sum, pm) => {
      const totalWeight = parseFloat(pm.weightPerBundle) || 0;
      return sum + totalWeight;
    }, 0);

    if (totalOutput <= 0) {
      newErrors.totalOutput =
        language === 'ur'
          ? 'کم از کم ایک پروسیس شدہ مواد کا آؤٹ پٹ درکار ہے'
          : 'At least one processed material output is required';
    }

    // Validate processed materials
    processedMaterials.forEach((pm, index) => {
      const rowErrors: Record<string, string> = {};
      if (!pm.name.trim()) {
        rowErrors.name = language === 'ur' ? 'نام درکار ہے' : 'Name is required';
      }
      if (!pm.numberOfBundles || parseInt(pm.numberOfBundles, 10) <= 0) {
        rowErrors.numberOfBundles =
          language === 'ur'
            ? 'بنڈلز کی تعداد 0 سے زیادہ ہونی چاہیے'
            : 'Number of bundles must be greater than 0';
      }
      if (!pm.weightPerBundle || parseFloat(pm.weightPerBundle) <= 0) {
        rowErrors.weightPerBundle =
          language === 'ur'
            ? 'کل صافی وزن 0 سے زیادہ ہونا چاہیے'
            : 'Total safi weight must be greater than 0';
      }
      if (Object.keys(rowErrors).length > 0) {
        newMaterialErrors[index] = rowErrors;
      }
    });

    // Check available stock (input will be calculated from total output)
    if (formData.materialType && !material && totalOutput > 0) {
      if (totalOutput > availableStock) {
        newErrors.totalOutput =
          language === 'ur'
            ? `دستیاب اسٹاک: ${availableStock.toFixed(2)} کلوگرام`
            : `Available stock: ${availableStock.toFixed(2)} kgs`;
      }
    }

    setErrors(newErrors);
    setMaterialErrors(newMaterialErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newMaterialErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Calculate input quantity from total output (weightPerBundle now stores total safi weight)
      const totalOutput = processedMaterials.reduce((sum, pm) => {
        const totalWeight = parseFloat(pm.weightPerBundle) || 0;
        return sum + totalWeight;
      }, 0);
      const inputQty = totalOutput; // Input equals total output
      
      const batchId = material ? material.batchId : generateBatchId(new Date(formData.date));
      const date = new Date(formData.date);

      // Deduct stock from raw materials (FIFO) - only once for the batch
      let batchesUsed: any[] = [];
      if (!material) {
        batchesUsed = deductStock(formData.materialType, inputQty);
      } else {
        batchesUsed = material.rawMaterialBatchesUsed;
      }

      if (material) {
        // Legacy: update single material
        const pm = processedMaterials[0];
        const numBundles = parseInt(pm.numberOfBundles, 10);
        const totalSafiWeight = parseFloat(pm.weightPerBundle);
        // Calculate weightPerBundle from total safi weight
        const weightPerBundle = numBundles > 0 ? totalSafiWeight / numBundles : 0;
        updateProcessedMaterial(material.id, {
          name: pm.name.trim(),
          materialType: formData.materialType.trim(),
          inputQuantity: inputQty,
          numberOfBundles: numBundles,
          weightPerBundle: weightPerBundle,
          grossWeightPerBundle: pm.grossWeightPerBundle ? parseFloat(pm.grossWeightPerBundle) : undefined,
          date,
          batchId,
          notes: formData.notes.trim() || undefined,
          rawMaterialBatchesUsed: batchesUsed,
        });
      } else {
        // New: add batch with multiple processed materials
        const materialsData = processedMaterials.map((pm) => {
          const numBundles = parseInt(pm.numberOfBundles, 10);
          const totalSafiWeight = parseFloat(pm.weightPerBundle);
          // Calculate weightPerBundle from total safi weight
          const weightPerBundle = numBundles > 0 ? totalSafiWeight / numBundles : 0;
          return {
            name: pm.name.trim(),
            numberOfBundles: numBundles,
            weightPerBundle: weightPerBundle,
            grossWeightPerBundle: pm.grossWeightPerBundle ? parseFloat(pm.grossWeightPerBundle) : undefined,
          };
        });

        addProcessedMaterialBatch({
          materialType: formData.materialType.trim(),
          inputQuantity: inputQty,
          date,
          batchId,
          notes: formData.notes.trim() || undefined,
          rawMaterialBatchesUsed: batchesUsed,
          processedMaterials: materialsData,
        });
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      setErrors({
        totalOutput: error.message || 'Error processing material',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals (input is calculated from output)
  const calculatedInput = totalOutput; // Input equals total output

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
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

      {/* Processed Materials in Batch */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('materialsInBatch', 'processedMaterial')}
          </h3>
          {!material && (
            <Button
              type="button"
              variant="secondary"
              onClick={addProcessedMaterialRow}
              className="text-sm"
            >
              + {t('addMaterial', 'processedMaterial')}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {processedMaterials.map((pm, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">
                  {t('material', 'processedMaterial')} {index + 1}
                </h4>
                {!material && processedMaterials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProcessedMaterialRow(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    {t('remove', 'processedMaterial')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Processed Material Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('processedMaterialName', 'processedMaterial')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list={`processedMaterialNames-${index}`}
                      value={pm.name}
                      onChange={(e) =>
                        updateProcessedMaterialRow(index, 'name', e.target.value)
                      }
                      className={`border border-gray-300 rounded-md px-3 py-2 pr-10 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
                        materialErrors[index]?.name ? 'border-red-500' : ''
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
                    <datalist id={`processedMaterialNames-${index}`}>
                      {processedMaterialNames.map((name) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  </div>
                  {materialErrors[index]?.name && (
                    <p className="mt-1 text-sm text-red-600">{materialErrors[index].name}</p>
                  )}
                </div>

                {/* Number of Bundles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('numberOfBundles', 'processedMaterial')} *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pm.numberOfBundles}
                    onChange={(e) => {
                      // Only allow integers (no decimals, no negative)
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      updateProcessedMaterialRow(index, 'numberOfBundles', value);
                    }}
                    className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
                      materialErrors[index]?.numberOfBundles ? 'border-red-500' : ''
                    }`}
                    placeholder="0"
                  />
                  {materialErrors[index]?.numberOfBundles && (
                    <p className="mt-1 text-sm text-red-600">
                      {materialErrors[index].numberOfBundles}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                {/* Total Safi Weight (Net Weight) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('totalSafiWeight', 'processedMaterial')} (kgs) *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={pm.weightPerBundle}
                    onChange={(e) => {
                      // Allow numbers and one decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      // Ensure only one decimal point
                      const parts = value.split('.');
                      const filteredValue = parts.length > 2 
                        ? parts[0] + '.' + parts.slice(1).join('')
                        : value;
                      updateProcessedMaterialRow(index, 'weightPerBundle', filteredValue);
                    }}
                    className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
                      materialErrors[index]?.weightPerBundle ? 'border-red-500' : ''
                    }`}
                    placeholder="0.00"
                  />
                  {materialErrors[index]?.weightPerBundle && (
                    <p className="mt-1 text-sm text-red-600">
                      {materialErrors[index].weightPerBundle}
                    </p>
                  )}
                </div>
              </div>

              {/* Individual Output */}
              {parseInt(pm.numberOfBundles, 10) > 0 && parseFloat(pm.weightPerBundle) > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {t('output', 'processedMaterial')}:{' '}
                  {parseFloat(pm.weightPerBundle).toFixed(2)}{' '}
                  kgs ({pm.numberOfBundles} {t('bundles', 'processedMaterial')})
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {totalOutput > 0 && (
        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('totalInput', 'processedMaterial')}:</span>
            <span className="text-sm font-semibold">{calculatedInput.toFixed(2)} kgs</span>
            <span className="text-xs text-gray-500 ml-2">({language === 'ur' ? 'خودکار حساب' : 'Auto-calculated'})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('totalOutput', 'processedMaterial')}:</span>
            <span className="text-sm font-semibold text-brand-blue">
              {totalOutput.toFixed(2)} kgs
            </span>
          </div>
          {formData.materialType && (
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-xs text-gray-500">{t('availableStock', 'processedMaterial')}:</span>
              <span className={`text-xs font-medium ${totalOutput > availableStock ? 'text-red-600' : 'text-gray-600'}`}>
                {availableStock.toFixed(2)} kgs
              </span>
            </div>
          )}
          {errors.totalOutput && (
            <p className="text-sm text-red-600 mt-1">{errors.totalOutput}</p>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('notes', 'processedMaterial')}
        </label>
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
          {loading
            ? t('saving', 'processedMaterial')
            : material
            ? t('update', 'processedMaterial')
            : t('add', 'processedMaterial')}
        </Button>
      </div>
    </form>
  );
}
