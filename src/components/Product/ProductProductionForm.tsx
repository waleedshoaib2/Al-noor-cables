import { useState, useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import { generateBatchId } from '@/utils/constants';
import type { ProductProduction } from '@/types';

interface ProductProductionFormProps {
  production?: ProductProduction | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ProductProductionForm({
  production,
  onClose,
  onSubmit,
}: ProductProductionFormProps) {
  const { t, language } = useTranslation();
  const addProduction = useProductStore((state) => state.addProduction);
  const updateProduction = useProductStore((state) => state.updateProduction);
  const productNames = useProductStore((state) => state.productNames);
  const processedMaterials = useProcessedRawMaterialStore(
    (state) => state.processedMaterials
  );
  const getStockByName = useProcessedRawMaterialStore((state) => state.getStockByName);
  const deductStockForProduct = useProcessedRawMaterialStore(
    (state) => state.deductStockForProduct
  );
  const restoreStockForProduct = useProcessedRawMaterialStore(
    (state) => state.restoreStockForProduct
  );

  const [formData, setFormData] = useState({
    productName: '',
    processedMaterialId: '',
    quantityFoot: '',
    quantityBundles: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (production) {
      setFormData({
        productName: production.productName,
        processedMaterialId: production.processedMaterialId.toString(),
        quantityFoot: (production.quantityFoot || 0).toString(),
        quantityBundles: (production.quantityBundles || 0).toString(),
        date: production.date.toISOString().split('T')[0],
        notes: production.notes || '',
      });
    }
  }, [production]);

  // Get available processed materials with stock
  const availableProcessedMaterials = processedMaterials.filter((m) => {
    const stock = getStockByName(m.name);
    return stock > 0;
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = language === 'ur' ? 'پروڈکٹ کا نام درکار ہے' : 'Product name is required';
    }

    if (!formData.processedMaterialId) {
      newErrors.processedMaterialId =
        language === 'ur' ? 'پروسیس شدہ مواد درکار ہے' : 'Processed material is required';
    }

    const quantityFoot = parseFloat(formData.quantityFoot) || 0;
    const quantityBundles = parseFloat(formData.quantityBundles) || 0;
    
    if (quantityFoot < 0) {
      newErrors.quantityFoot =
        language === 'ur'
          ? 'مقدار منفی نہیں ہو سکتی'
          : 'Quantity cannot be negative';
    }
    
    if (quantityBundles < 0) {
      newErrors.quantityBundles =
        language === 'ur'
          ? 'مقدار منفی نہیں ہو سکتی'
          : 'Quantity cannot be negative';
    }
    
    if (quantityFoot === 0 && quantityBundles === 0) {
      newErrors.quantityFoot =
        language === 'ur'
          ? 'کم از کم ایک مقدار درکار ہے'
          : 'At least one quantity is required';
    }

    if (!formData.date) {
      newErrors.date = language === 'ur' ? 'تاریخ درکار ہے' : 'Date is required';
    }

    // Check available stock (just need to ensure there's stock available)
    if (formData.processedMaterialId && !production) {
      const material = processedMaterials.find(
        (m) => m.id === parseInt(formData.processedMaterialId)
      );
      if (material) {
        const stock = getStockByName(material.name);
        if (stock <= 0) {
          newErrors.processedMaterialId =
            language === 'ur'
              ? `کوئی اسٹاک دستیاب نہیں: ${stock.toFixed(2)} کلوگرام`
              : `No stock available: ${stock.toFixed(2)} kgs`;
        }
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
      const processedMaterialId = parseInt(formData.processedMaterialId);
      const quantityFoot = parseFloat(formData.quantityFoot) || 0;
      const quantityBundles = parseFloat(formData.quantityBundles) || 0;

      // Get the processed material
      const processedMaterial = processedMaterials.find((m) => m.id === processedMaterialId);
      if (!processedMaterial) {
        throw new Error('Processed material not found');
      }

      // Use the entire processed raw material entry (its outputQuantity), regardless of foot/bundle quantities
      if (!production) {
        // Check if this specific processed material entry is available (has stock)
        const availableStock = getStockByName(processedMaterial.name);
        if (availableStock < processedMaterial.outputQuantity) {
          throw new Error(
            `Insufficient stock for ${processedMaterial.name}. Available: ${availableStock.toFixed(2)} kgs, Required: ${processedMaterial.outputQuantity.toFixed(2)} kgs`
          );
        }
        
        // Deduct the entire outputQuantity of this specific processed material entry
        deductStockForProduct(processedMaterialId, processedMaterial.outputQuantity);
      } else {
        // When updating, restore old processed material and deduct new one
        const oldProduction = production;
        
        if (oldProduction.processedMaterialSnapshot) {
          if (oldProduction.processedMaterialId === processedMaterialId) {
            // Same material - no change needed since we're using the same entry's outputQuantity
            // The stock is already deducted correctly
          } else {
            // Different material - restore old entry, deduct new entry
            restoreProcessedMaterialForProduct(oldProduction.processedMaterialSnapshot);
            
            // Check if new material entry is available
            const availableStock = getStockByName(processedMaterial.name);
            if (availableStock < processedMaterial.outputQuantity) {
              // Restore the old material back since we can't complete the update
              // We need to re-deduct the old one
              const oldMaterial = oldProduction.processedMaterialSnapshot;
              deductStockForProduct(oldMaterial.id, oldMaterial.outputQuantity);
              throw new Error(
                `Insufficient stock for ${processedMaterial.name}. Available: ${availableStock.toFixed(2)} kgs, Required: ${processedMaterial.outputQuantity.toFixed(2)} kgs`
              );
            }
            
            deductStockForProduct(processedMaterialId, processedMaterial.outputQuantity);
          }
        } else {
          // Legacy: old production without snapshot - try to find the material
          const oldProcessedMaterial = processedMaterials.find((m) => m.id === oldProduction.processedMaterialId);
          if (oldProcessedMaterial && oldProduction.processedMaterialId !== processedMaterialId) {
            // Different material - restore old, deduct new
            restoreProcessedMaterialForProduct(oldProcessedMaterial);
            
            const availableStock = getStockByName(processedMaterial.name);
            if (availableStock < processedMaterial.outputQuantity) {
              deductStockForProduct(oldProcessedMaterial.id, oldProcessedMaterial.outputQuantity);
              throw new Error(
                `Insufficient stock for ${processedMaterial.name}. Available: ${availableStock.toFixed(2)} kgs, Required: ${processedMaterial.outputQuantity.toFixed(2)} kgs`
              );
            }
            
            deductStockForProduct(processedMaterialId, processedMaterial.outputQuantity);
          }
        }
      }

      const productionData = {
        productName: formData.productName.trim(),
        processedMaterialId,
        processedMaterialBatchId: processedMaterials.find((m) => m.id === processedMaterialId)
          ?.batchId || '',
        processedMaterialSnapshot: processedMaterial, // Store snapshot for restoration
        quantityFoot,
        quantityBundles,
        date: new Date(formData.date),
        batchId: production ? production.batchId : generateBatchId(new Date(formData.date)),
        notes: formData.notes.trim() || undefined,
      };

      if (production) {
        updateProduction(production.id, productionData);
      } else {
        addProduction(productionData);
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      setErrors({
        quantity: error.message || 'Error creating product',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedMaterial = processedMaterials.find(
    (m) => m.id === parseInt(formData.processedMaterialId)
  );
  const availableStock = selectedMaterial ? getStockByName(selectedMaterial.name) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('productName', 'product')} *
        </label>
        <div className="relative">
          <input
            type="text"
            list="productNames"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            className={`border border-gray-300 rounded-md px-3 py-2 pr-10 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
              errors.productName ? 'border-red-500' : ''
            }`}
            placeholder={t('typeOrSelect', 'product')}
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
          <datalist id="productNames">
            {productNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        {errors.productName && <p className="mt-1 text-sm text-red-600">{errors.productName}</p>}
      </div>

      {/* Processed Material */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('processedMaterial', 'product')} *
        </label>
        <select
          value={formData.processedMaterialId}
          onChange={(e) => setFormData({ ...formData, processedMaterialId: e.target.value })}
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.processedMaterialId ? 'border-red-500' : ''
          }`}
        >
          <option value="">{t('selectProcessedMaterial', 'product')}</option>
          {availableProcessedMaterials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.materialType}) - Stock: {getStockByName(m.name).toFixed(2)} kgs
            </option>
          ))}
        </select>
        {selectedMaterial && (
          <p className="mt-1 text-xs text-gray-500">
            {t('availableStock', 'product')}: {availableStock.toFixed(2)} kgs
          </p>
        )}
        {errors.processedMaterialId && (
          <p className="mt-1 text-sm text-red-600">{errors.processedMaterialId}</p>
        )}
      </div>

      {/* Quantity Foot and Bundles */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={`${t('quantity', 'product')} (${t('foot', 'product')})`}
          type="number"
          step="0.01"
          min="0"
          value={formData.quantityFoot}
          onChange={(e) => setFormData({ ...formData, quantityFoot: e.target.value })}
          placeholder="0.00"
          error={errors.quantityFoot}
        />
        <Input
          label={`${t('quantity', 'product')} (${t('bundles', 'product')})`}
          type="number"
          step="0.01"
          min="0"
          value={formData.quantityBundles}
          onChange={(e) => setFormData({ ...formData, quantityBundles: e.target.value })}
          placeholder="0.00"
          error={errors.quantityBundles}
        />
      </div>

      {/* Date */}
      <Input
        label={`${t('date', 'product')} *`}
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
      />

      {/* Batch ID - Auto-generated, read-only */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('batchId', 'product')}
        </label>
        <input
          type="text"
          value={production ? production.batchId : generateBatchId(new Date(formData.date))}
          readOnly
          className="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">{t('autoGenerated', 'product')}</p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes', 'product')}</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
          rows={3}
          placeholder={t('additionalNotes', 'product')}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? t('saving', 'product') : production ? t('update', 'product') : t('add', 'product')}
        </Button>
      </div>
    </form>
  );
}

