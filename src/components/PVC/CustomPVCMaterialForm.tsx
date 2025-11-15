import { useState, useEffect } from 'react';
import { useCustomPVCMaterialStore } from '@/store/useCustomPVCMaterialStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import type { CustomPVCMaterial } from '@/types';

interface CustomPVCMaterialFormProps {
  material?: CustomPVCMaterial | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CustomPVCMaterialForm({ material, onClose, onSubmit }: CustomPVCMaterialFormProps) {
  const { t, language } = useTranslation();
  const addCustomPVCMaterial = useCustomPVCMaterialStore((state) => state.addCustomPVCMaterial);
  const updateCustomPVCMaterial = useCustomPVCMaterialStore((state) => state.updateCustomPVCMaterial);

  const [formData, setFormData] = useState({
    name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
      });
    }
  }, [material]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = language === 'ur' ? 'نام درکار ہے' : 'Name is required';
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
      };

      if (material) {
        updateCustomPVCMaterial(material.id, materialData);
      } else {
        addCustomPVCMaterial(materialData);
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Error saving custom PVC material',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Name */}
      <Input
        label={language === 'ur' ? 'PVC مواد کا نام *' : 'PVC Material Name *'}
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder={language === 'ur' ? 'PVC مواد کا نام' : 'PVC material name'}
        error={errors.name}
      />

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

