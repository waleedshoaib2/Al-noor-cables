import { useState, useEffect } from 'react';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
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
  const addRawMaterial = useRawMaterialStore((state) => state.addRawMaterial);
  const updateRawMaterial = useRawMaterialStore((state) => state.updateRawMaterial);
  const materialTypes = useRawMaterialStore((state) => state.materialTypes);
  const suppliers = useRawMaterialStore((state) => state.suppliers);

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
      newErrors.materialType = 'Material type is required';
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Supplier is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Material Type with improved dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Material Type *
        </label>
        <div className="relative">
          <input
            type="text"
            list="materialTypes"
            value={formData.materialType}
            onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
            className={`border border-gray-300 rounded-md px-3 py-2 pr-10 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
              errors.materialType ? 'border-red-500' : ''
            }`}
            placeholder="Type or select material type"
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
          Supplier *
        </label>
        <div className="relative">
          <input
            type="text"
            list="suppliers"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            className={`border border-gray-300 rounded-md px-3 py-2 pr-10 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
              errors.supplier ? 'border-red-500' : ''
            }`}
            placeholder="Type or select supplier"
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
          label="Date *"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date}
        />
        <Input
          label="Quantity (kgs) *"
          type="number"
          step="0.01"
          min="0"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          placeholder="0.00"
          error={errors.quantity}
        />
      </div>

      {/* Batch ID - Auto-generated, read-only */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Batch ID
        </label>
        <input
          type="text"
          value={formData.batchId}
          readOnly
          className="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">Auto-generated based on date</p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
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
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : material ? 'Update' : 'Add'}
        </Button>
      </div>
    </form>
  );
}

