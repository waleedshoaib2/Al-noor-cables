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
    productNumber: '',
    productTara: '',
    processedMaterialId: '',
    bundlesUsed: '',
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
        productName: production.productName || '',
        productNumber: production.productNumber || '',
        productTara: production.productTara || '',
        processedMaterialId: production.processedMaterialId.toString(),
        bundlesUsed: (production.bundlesUsed || 0).toString(),
        quantityFoot: (production.quantityFoot || 0).toString(),
        quantityBundles: (production.quantityBundles || 0).toString(),
        date: production.date.toISOString().split('T')[0],
        notes: production.notes || '',
      });
    } else {
      // Reset form for new production
      setFormData({
        productName: '',
        productNumber: '',
        productTara: '',
        processedMaterialId: '',
        bundlesUsed: '',
        quantityFoot: '',
        quantityBundles: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setErrors({});
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

    if (!formData.productNumber.trim()) {
      newErrors.productNumber = language === 'ur' ? 'پروڈکٹ نمبر درکار ہے' : 'Product number is required';
    }

    if (!formData.productTara.trim()) {
      newErrors.productTara = language === 'ur' ? 'پروڈکٹ تارا درکار ہے' : 'Product Tara is required';
    }

    if (!formData.processedMaterialId) {
      newErrors.processedMaterialId =
        language === 'ur' ? 'پروسیس شدہ مواد درکار ہے' : 'Processed material is required';
    }

    const bundlesUsed = parseFloat(formData.bundlesUsed) || 0;
    if (!formData.processedMaterialId || bundlesUsed <= 0) {
      newErrors.bundlesUsed =
        language === 'ur' ? 'استعمال شدہ بنڈلز درکار ہیں' : 'Bundles used is required and must be greater than 0';
    } else {
      // Check if selected processed material has enough available bundles
      const selectedMaterial = processedMaterials.find((m) => m.id === parseInt(formData.processedMaterialId));
      if (selectedMaterial) {
        const availableBundles = selectedMaterial.numberOfBundles - (selectedMaterial.usedQuantity || 0) / selectedMaterial.weightPerBundle;
        if (bundlesUsed > availableBundles) {
          newErrors.bundlesUsed =
            language === 'ur' 
              ? `دستیاب بنڈلز: ${availableBundles.toFixed(0)}`
              : `Available bundles: ${availableBundles.toFixed(0)}`;
        }
      }
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
      const bundlesUsed = parseFloat(formData.bundlesUsed) || 0;
      const quantityFoot = parseFloat(formData.quantityFoot) || 0;
      const quantityBundles = parseFloat(formData.quantityBundles) || 0;

      // Get the processed material
      const processedMaterial = processedMaterials.find((m) => m.id === processedMaterialId);
      if (!processedMaterial) {
        throw new Error('Processed material not found');
      }

      // Calculate the quantity in kgs based on bundles used
      const quantityUsedKgs = bundlesUsed * processedMaterial.weightPerBundle;

      // Check if this specific processed material entry has enough available bundles
      const availableBundles = processedMaterial.numberOfBundles - ((processedMaterial.usedQuantity || 0) / processedMaterial.weightPerBundle);
      if (bundlesUsed > availableBundles) {
        throw new Error(
          `Insufficient bundles for ${processedMaterial.name}. Available: ${availableBundles.toFixed(0)} bundles, Required: ${bundlesUsed.toFixed(0)} bundles`
        );
      }

      if (!production) {
        // Deduct the quantity based on bundles used (bundlesUsed × weightPerBundle)
        deductStockForProduct(processedMaterialId, quantityUsedKgs);
      } else {
        // When updating, restore old processed material and deduct new one
        const oldProduction = production;
        const oldBundlesUsed = oldProduction.bundlesUsed || 0;
        const oldQuantityUsedKgs = oldProduction.processedMaterialSnapshot 
          ? oldBundlesUsed * oldProduction.processedMaterialSnapshot.weightPerBundle
          : 0;
        
        // Restore old amount first
        if (oldQuantityUsedKgs > 0 && oldProduction.processedMaterialSnapshot) {
          const oldMaterial = oldProduction.processedMaterialSnapshot;
          const oldMaterialInStore = processedMaterials.find((m) => m.id === oldMaterial.id);
          if (oldMaterialInStore) {
            // Manually restore by reducing usedQuantity
            const updatedMaterials = processedMaterials.map((m) =>
              m.id === oldMaterial.id
                ? { ...m, usedQuantity: Math.max(0, (m.usedQuantity || 0) - oldQuantityUsedKgs) }
                : m
            );
            // Recalculate stock for the old material
            const materialsWithName = updatedMaterials.filter((m) => m.name === oldMaterial.name);
            const currentState = useProcessedRawMaterialStore.getState();
            const stock = { ...currentState.stock };
            stock[oldMaterial.name] = materialsWithName.reduce(
              (sum, m) => sum + (m.outputQuantity - (m.usedQuantity || 0)),
              0
            );
            // Update the store
            useProcessedRawMaterialStore.setState({
              processedMaterials: updatedMaterials,
              stock,
            });
            // Save to storage using the store's save method
            const saveToStorage = useProcessedRawMaterialStore.getState().saveToStorage;
            if (saveToStorage) {
              saveToStorage();
            }
          }
        }
        
        // Check if new material entry has enough bundles
        const availableBundles = processedMaterial.numberOfBundles - ((processedMaterial.usedQuantity || 0) / processedMaterial.weightPerBundle);
        if (bundlesUsed > availableBundles) {
          // Restore the old material back since we can't complete the update
          if (oldQuantityUsedKgs > 0 && oldProduction.processedMaterialSnapshot) {
            const oldMaterial = oldProduction.processedMaterialSnapshot;
            deductStockForProduct(oldMaterial.id, oldQuantityUsedKgs);
          }
          throw new Error(
            `Insufficient bundles for ${processedMaterial.name}. Available: ${availableBundles.toFixed(0)} bundles, Required: ${bundlesUsed.toFixed(0)} bundles`
          );
        }
        
        // Deduct new amount
        deductStockForProduct(processedMaterialId, quantityUsedKgs);
      }

      const productionData = {
        productName: formData.productName.trim(),
        productNumber: formData.productNumber.trim(),
        productTara: formData.productTara.trim(),
        processedMaterialId,
        processedMaterialBatchId: processedMaterials.find((m) => m.id === processedMaterialId)
          ?.batchId || '',
        processedMaterialSnapshot: processedMaterial, // Store snapshot for restoration
        bundlesUsed,
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
      {/* Product Name, Product Number, Product Tara */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('productName', 'product')} *
          </label>
          <Input
            type="text"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            placeholder={t('productName', 'product')}
            error={errors.productName}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ur' ? 'پروڈکٹ نمبر' : 'Product Number'} *
          </label>
          <Input
            type="text"
            value={formData.productNumber}
            onChange={(e) => setFormData({ ...formData, productNumber: e.target.value })}
            placeholder={language === 'ur' ? 'پروڈکٹ نمبر' : 'Product Number'}
            error={errors.productNumber}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ur' ? 'پروڈکٹ تارا' : 'Product Tara'} *
          </label>
          <Input
            type="text"
            value={formData.productTara}
            onChange={(e) => setFormData({ ...formData, productTara: e.target.value })}
            placeholder={language === 'ur' ? 'پروڈکٹ تارا' : 'Product Tara'}
            error={errors.productTara}
          />
        </div>
      </div>

      {/* Processed Material */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('processedMaterial', 'product')} *
        </label>
        <select
          value={formData.processedMaterialId}
          onChange={(e) => {
            setFormData({ ...formData, processedMaterialId: e.target.value, bundlesUsed: '' });
          }}
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.processedMaterialId ? 'border-red-500' : ''
          }`}
        >
          <option value="">{t('selectProcessedMaterial', 'product')}</option>
          {availableProcessedMaterials.map((m) => {
            const availableBundles = m.numberOfBundles - ((m.usedQuantity || 0) / m.weightPerBundle);
            return (
              <option key={m.id} value={m.id}>
                {m.name} ({m.materialType}) - {getStockByName(m.name).toFixed(2)} kgs ({availableBundles.toFixed(0)} {language === 'ur' ? 'بنڈلز' : 'bundles'})
              </option>
            );
          })}
        </select>
        {errors.processedMaterialId && (
          <p className="mt-1 text-sm text-red-600">{errors.processedMaterialId}</p>
        )}
      </div>

      {/* Bundles Used and Weight - Always visible, right after Processed Material */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ur' ? 'استعمال شدہ بنڈلز' : 'Bundles Used'} *
          </label>
          <Input
            type="number"
            min="0"
            step="1"
            value={formData.bundlesUsed}
            onChange={(e) => setFormData({ ...formData, bundlesUsed: e.target.value })}
            placeholder={language === 'ur' ? 'بنڈلز کی تعداد' : 'Number of bundles from processed material'}
            error={errors.bundlesUsed}
            disabled={!formData.processedMaterialId}
          />
          {formData.processedMaterialId && (() => {
            const selectedMaterial = processedMaterials.find((m) => m.id === parseInt(formData.processedMaterialId));
            if (selectedMaterial) {
              const availableBundles = selectedMaterial.numberOfBundles - ((selectedMaterial.usedQuantity || 0) / selectedMaterial.weightPerBundle);
              return (
                <p className="mt-1 text-sm text-gray-500">
                  {language === 'ur' 
                    ? `دستیاب: ${availableBundles.toFixed(0)} بنڈلز`
                    : `Available: ${availableBundles.toFixed(0)} bundles`}
                </p>
              );
            }
            return null;
          })()}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ur' ? 'وزن (کلوگرام)' : 'Weight (kgs)'}
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.processedMaterialId && formData.bundlesUsed ? (() => {
              const selectedMaterial = processedMaterials.find((m) => m.id === parseInt(formData.processedMaterialId));
              if (selectedMaterial) {
                const bundlesUsed = parseFloat(formData.bundlesUsed) || 0;
                return (bundlesUsed * selectedMaterial.weightPerBundle).toFixed(2);
              }
              return '0.00';
            })() : '0.00'}
            onChange={(e) => {
              // Calculate bundles from weight
              const selectedMaterial = processedMaterials.find((m) => m.id === parseInt(formData.processedMaterialId));
              if (selectedMaterial) {
                const weight = parseFloat(e.target.value) || 0;
                const calculatedBundles = weight / selectedMaterial.weightPerBundle;
                setFormData({ ...formData, bundlesUsed: calculatedBundles.toFixed(0) });
              }
            }}
            placeholder={language === 'ur' ? 'وزن کلوگرام میں' : 'Weight in kgs'}
            disabled={!formData.processedMaterialId}
          />
          {formData.processedMaterialId && (() => {
            const selectedMaterial = processedMaterials.find((m) => m.id === parseInt(formData.processedMaterialId));
            if (selectedMaterial) {
              const availableBundles = selectedMaterial.numberOfBundles - ((selectedMaterial.usedQuantity || 0) / selectedMaterial.weightPerBundle);
              const availableWeight = availableBundles * selectedMaterial.weightPerBundle;
              return (
                <p className="mt-1 text-sm text-gray-500">
                  {language === 'ur' 
                    ? `دستیاب: ${availableWeight.toFixed(2)} کلوگرام`
                    : `Available: ${availableWeight.toFixed(2)} kgs`}
                </p>
              );
            }
            return null;
          })()}
        </div>
      </div>
      {!formData.processedMaterialId && (
        <p className="text-sm text-gray-400 -mt-2">
          {language === 'ur' ? 'پہلے پروسیس شدہ مواد منتخب کریں' : 'Please select a processed material first'}
        </p>
      )}

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

