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

  const [formData, setFormData] = useState({
    productName: '',
    processedMaterialId: '',
    quantity: '',
    unit: 'foot' as 'foot' | 'bundles',
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
        quantity: production.quantity.toString(),
        unit: production.unit,
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

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity =
        language === 'ur'
          ? 'مقدار 0 سے زیادہ ہونی چاہیے'
          : 'Quantity must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = language === 'ur' ? 'تاریخ درکار ہے' : 'Date is required';
    }

    // Check available stock
    if (formData.processedMaterialId && !production) {
      const material = processedMaterials.find(
        (m) => m.id === parseInt(formData.processedMaterialId)
      );
      if (material) {
        const stock = getStockByName(material.name);
        const quantity = parseFloat(formData.quantity);
        if (quantity > stock) {
          newErrors.quantity =
            language === 'ur'
              ? `دستیاب اسٹاک: ${stock.toFixed(2)} کلوگرام`
              : `Available stock: ${stock.toFixed(2)} kgs`;
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
      const quantity = parseFloat(formData.quantity);

      // Deduct stock from processed raw material
      if (!production) {
        deductStockForProduct(processedMaterialId, quantity);
      }

      const productionData = {
        productName: formData.productName.trim(),
        processedMaterialId,
        processedMaterialBatchId: processedMaterials.find((m) => m.id === processedMaterialId)
          ?.batchId || '',
        quantity,
        unit: formData.unit,
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

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={`${t('quantity', 'product')} *`}
          type="number"
          step="0.01"
          min="0"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          placeholder="0.00"
          error={errors.quantity}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('unit', 'product')} *
          </label>
          <select
            value={formData.unit}
            onChange={(e) =>
              setFormData({ ...formData, unit: e.target.value as 'foot' | 'bundles' })
            }
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
          >
            <option value="foot">{t('foot', 'product')}</option>
            <option value="bundles">{t('bundles', 'product')}</option>
          </select>
        </div>
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

