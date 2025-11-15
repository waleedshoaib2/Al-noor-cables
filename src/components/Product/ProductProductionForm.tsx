import { useState, useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useCustomProductStore } from '@/store/useCustomProductStore';
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
  const customProducts = useCustomProductStore((state) => state.customProducts);
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
    weightUsed: '', // Safi weight in kgs
    quantityFoot: '',
    quantityBundles: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (production) {
      const selectedMaterial = processedMaterials.find((m) => m.id === production.processedMaterialId);
      const bundlesUsed = production.bundlesUsed || 0;
      const weightUsed = selectedMaterial 
        ? (bundlesUsed * selectedMaterial.weightPerBundle).toFixed(2)
        : (production.bundlesUsed || 0).toString();
      
      setFormData({
        productName: production.productName || '',
        productNumber: production.productNumber || '',
        productTara: production.productTara || '',
        processedMaterialId: production.processedMaterialId.toString(),
        weightUsed: weightUsed,
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
        weightUsed: '',
        quantityFoot: '',
        quantityBundles: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setErrors({});
  }, [production, processedMaterials]);

  // Get available processed materials with stock
  const availableProcessedMaterials = processedMaterials.filter((m) => {
    const stock = getStockByName(m.name);
    return stock > 0;
  });

  // Handle product selection - auto-populate productNumber and productTara
  const handleProductNameChange = (productName: string) => {
    const selectedProduct = customProducts.find((p) => p.name === productName);
    setFormData({
      ...formData,
      productName: productName,
      productNumber: selectedProduct?.productNumber || '',
      productTara: selectedProduct?.productTara || '',
    });
  };

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

    // Validate weight - must be provided
    const weightUsed = parseFloat(formData.weightUsed) || 0;
    
    if (!formData.processedMaterialId) {
      // Error already set above
    } else if (weightUsed <= 0) {
      newErrors.weightUsed =
        language === 'ur' ? 'صافی وزن درکار ہے' : 'Safi weight is required';
    } else {
      const selectedMaterial = processedMaterials.find((m) => m.id === parseInt(formData.processedMaterialId));
      if (selectedMaterial) {
        const availableBundles = selectedMaterial.numberOfBundles - ((selectedMaterial.usedQuantity || 0) / selectedMaterial.weightPerBundle);
        const availableWeight = availableBundles * selectedMaterial.weightPerBundle;
        
        if (weightUsed > availableWeight) {
          newErrors.weightUsed =
            language === 'ur' 
              ? `دستیاب صافی وزن: ${availableWeight.toFixed(2)} کلوگرام`
              : `Available safi weight: ${availableWeight.toFixed(2)} kgs`;
        }
      }
    }

    const quantityFoot = parseFloat(formData.quantityFoot) || 0;
    const quantityBundles = parseInt(formData.quantityBundles, 10) || 0;
    
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
      const weightUsed = parseFloat(formData.weightUsed) || 0;
      const quantityFoot = parseFloat(formData.quantityFoot) || 0;
      const quantityBundles = parseInt(formData.quantityBundles, 10) || 0;

      // Get the processed material
      const processedMaterial = processedMaterials.find((m) => m.id === processedMaterialId);
      if (!processedMaterial) {
        throw new Error('Processed material not found');
      }

      // Calculate the quantity in kgs from weight
      const quantityUsedKgs = weightUsed;
      // Calculate bundles from weight
      const finalBundlesUsed = weightUsed / processedMaterial.weightPerBundle;

      // Check if this specific processed material entry has enough available weight
      const availableBundles = processedMaterial.numberOfBundles - ((processedMaterial.usedQuantity || 0) / processedMaterial.weightPerBundle);
      const availableWeight = availableBundles * processedMaterial.weightPerBundle;
      if (weightUsed > availableWeight) {
        throw new Error(
          `Insufficient safi weight for ${processedMaterial.name}. Available: ${availableWeight.toFixed(2)} kgs, Required: ${weightUsed.toFixed(2)} kgs`
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
        
        // Check if new material entry has enough weight
        const availableBundles = processedMaterial.numberOfBundles - ((processedMaterial.usedQuantity || 0) / processedMaterial.weightPerBundle);
        const availableWeight = availableBundles * processedMaterial.weightPerBundle;
        if (weightUsed > availableWeight) {
          // Restore the old material back since we can't complete the update
          if (oldQuantityUsedKgs > 0 && oldProduction.processedMaterialSnapshot) {
            const oldMaterial = oldProduction.processedMaterialSnapshot;
            deductStockForProduct(oldMaterial.id, oldQuantityUsedKgs);
          }
          throw new Error(
            `Insufficient safi weight for ${processedMaterial.name}. Available: ${availableWeight.toFixed(2)} kgs, Required: ${weightUsed.toFixed(2)} kgs`
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
        bundlesUsed: finalBundlesUsed, // Store calculated bundles
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
          <select
            value={formData.productName}
            onChange={(e) => handleProductNameChange(e.target.value)}
            className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
              errors.productName ? 'border-red-500' : ''
            }`}
          >
            <option value="">{language === 'ur' ? 'پروڈکٹ منتخب کریں' : 'Select Product'}</option>
            {customProducts.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name} - {product.productNumber} - {product.productTara}
              </option>
            ))}
          </select>
          {errors.productName && (
            <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ur' ? 'پروڈکٹ نمبر' : 'Product Number'} *
          </label>
          <Input
            type="text"
            value={formData.productNumber}
            readOnly
            className="bg-gray-50 cursor-not-allowed"
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
            readOnly
            className="bg-gray-50 cursor-not-allowed"
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
            setFormData({ ...formData, processedMaterialId: e.target.value, weightUsed: '' });
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
                {m.name} ({m.materialType}) - {getStockByName(m.name).toFixed(2)} kgs ({availableBundles.toFixed(2)} {language === 'ur' ? 'بنڈلز' : 'bundles'})
              </option>
            );
          })}
        </select>
        {errors.processedMaterialId && (
          <p className="mt-1 text-sm text-red-600">{errors.processedMaterialId}</p>
        )}
      </div>

      {/* Safi Weight - Always visible, right after Processed Material */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('safiWeightPerBundle', 'processedMaterial')} (kgs) *
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={formData.weightUsed}
          onChange={(e) => {
            // Allow numbers and one decimal point
            const value = e.target.value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = value.split('.');
            const filteredValue = parts.length > 2 
              ? parts[0] + '.' + parts.slice(1).join('')
              : value;
            setFormData({ ...formData, weightUsed: filteredValue });
          }}
          placeholder={language === 'ur' ? 'صافی وزن کلوگرام میں' : 'Safi weight in kgs'}
          disabled={!formData.processedMaterialId}
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.weightUsed ? 'border-red-500' : ''
          } ${!formData.processedMaterialId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {errors.weightUsed && (
          <p className="mt-1 text-sm text-red-600">{errors.weightUsed}</p>
        )}
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
      {!formData.processedMaterialId && (
        <p className="text-sm text-gray-400 -mt-2">
          {language === 'ur' ? 'پہلے پروسیس شدہ مواد منتخب کریں' : 'Please select a processed material first'}
        </p>
      )}

      {/* Quantity Foot and Bundles */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {`${t('quantity', 'product')} (${t('foot', 'product')})`}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={formData.quantityFoot}
            onChange={(e) => {
              // Allow numbers and one decimal point
              const value = e.target.value.replace(/[^0-9.]/g, '');
              // Ensure only one decimal point
              const parts = value.split('.');
              const filteredValue = parts.length > 2 
                ? parts[0] + '.' + parts.slice(1).join('')
                : value;
              setFormData({ ...formData, quantityFoot: filteredValue });
            }}
            placeholder="0.00"
            className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
              errors.quantityFoot ? 'border-red-500' : ''
            }`}
          />
          {errors.quantityFoot && (
            <p className="mt-1 text-sm text-red-600">{errors.quantityFoot}</p>
          )}
        </div>
        <Input
          label={`${t('quantity', 'product')} (${t('bundles', 'product')})`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formData.quantityBundles}
          onChange={(e) => {
            // Only allow integers (no decimals, no negative)
            const value = e.target.value.replace(/[^0-9]/g, '');
            setFormData({ ...formData, quantityBundles: value });
          }}
          placeholder="0"
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

