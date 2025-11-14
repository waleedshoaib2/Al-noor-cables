import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import { useCustomProductStore } from '@/store/useCustomProductStore';
import type { CustomProduct } from '@/types';

interface CustomProductFormProps {
  product?: CustomProduct | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CustomProductForm({ product, onClose, onSubmit }: CustomProductFormProps) {
  const { t, language } = useTranslation();
  const addCustomProduct = useCustomProductStore((state) => state.addCustomProduct);
  const updateCustomProduct = useCustomProductStore((state) => state.updateCustomProduct);

  const [formData, setFormData] = useState({
    name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
      });
    }
  }, [product]);

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
      const productData = {
        name: formData.name.trim(),
      };

      if (product) {
        updateCustomProduct(product.id, productData);
      } else {
        addCustomProduct(productData);
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      setErrors({
        name: error.message || 'Error saving custom product',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Name */}
      <Input
        label={`${t('name', 'customProduct')} *`}
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder={language === 'ur' ? 'پروڈکٹ کا نام' : 'Product name'}
        error={errors.name}
      />

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading
            ? t('saving', 'customProduct')
            : product
            ? t('update', 'customProduct')
            : t('add', 'customProduct')}
        </Button>
      </div>
    </form>
  );
}

