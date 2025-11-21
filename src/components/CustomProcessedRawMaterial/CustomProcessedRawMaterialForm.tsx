import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import { useCustomProcessedRawMaterialStore } from '@/store/useCustomProcessedRawMaterialStore';
import type { CustomProcessedRawMaterial } from '@/types';

interface CustomProcessedRawMaterialFormProps {
  material?: CustomProcessedRawMaterial | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CustomProcessedRawMaterialForm({
  material,
  onClose,
  onSubmit,
}: CustomProcessedRawMaterialFormProps) {
  const { t, language } = useTranslation();
  const addCustomProcessedMaterial = useCustomProcessedRawMaterialStore(
    (state) => state.addCustomProcessedMaterial
  );
  const updateCustomProcessedMaterial = useCustomProcessedRawMaterialStore(
    (state) => state.updateCustomProcessedMaterial
  );

  const [formData, setFormData] = useState({
    name: '',
    priorRawMaterial: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        priorRawMaterial: material.priorRawMaterial,
      });
    }
  }, [material]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = language === 'ur' ? 'پروڈکٹ کا نام درکار ہے' : 'Product name is required';
    }

    if (!formData.priorRawMaterial) {
      newErrors.priorRawMaterial =
        language === 'ur' ? 'پہلے خام مال کی قسم درکار ہے' : 'Prior raw material type is required';
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
        priorRawMaterial: formData.priorRawMaterial,
      };

      if (material) {
        updateCustomProcessedMaterial(material.id, materialData);
      } else {
        addCustomProcessedMaterial(materialData);
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      setErrors({
        name: error.message || 'Error saving custom processed material',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Name */}
      <Input
        label={language === 'ur' ? 'پروڈکٹ کا نام *' : 'Product Name *'}
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder={language === 'ur' ? 'پروڈکٹ کا نام' : 'Product name'}
        error={errors.name}
      />

      {/* Prior Raw Material */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ur' ? 'خام مال منتخب کریں' : 'Select Raw Material'} *
        </label>
        <select
          value={formData.priorRawMaterial}
          onChange={(e) => setFormData({ ...formData, priorRawMaterial: e.target.value })}
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.priorRawMaterial ? 'border-red-500' : ''
          }`}
        >
          <option value="">{language === 'ur' ? 'منتخب کریں' : 'Select'}</option>
          <option value="Copper">Copper</option>
          <option value="Silver">Silver</option>
          <option value="Steel">Steel</option>
        </select>
        {errors.priorRawMaterial && (
          <p className="mt-1 text-sm text-red-600">{errors.priorRawMaterial}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading
            ? t('saving', 'customProcessedMaterial')
            : material
            ? t('update', 'customProcessedMaterial')
            : t('add', 'customProcessedMaterial')}
        </Button>
      </div>
    </form>
  );
}

