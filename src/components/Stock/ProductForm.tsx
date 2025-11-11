import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/utils/validation';
import { useCategoryStore } from '@/store/useCategoryStore';
import { Modal } from '@/components/Common/Modal';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import type { Product } from '@/types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSubmit: (data: any) => void;
}

export default function ProductForm({ isOpen, onClose, product, onSubmit }: ProductFormProps) {
  const categories = useCategoryStore((state) => state.categories);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          description: product.description || '',
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          quantity: product.quantity,
          reorderLevel: product.reorderLevel,
          categoryId: product.categoryId,
        }
      : {
          name: '',
          sku: '',
          description: '',
          costPrice: 0,
          sellingPrice: 0,
          quantity: 0,
          reorderLevel: 5,
          categoryId: categories[0]?.id || 1,
        },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        quantity: product.quantity,
        reorderLevel: product.reorderLevel,
        categoryId: product.categoryId,
      });
    } else {
      reset({
        name: '',
        sku: '',
        description: '',
        costPrice: 0,
        sellingPrice: 0,
        quantity: 0,
        reorderLevel: 5,
        categoryId: categories[0]?.id || 1,
      });
    }
  }, [product, categories, reset]);

  const onFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Product Name *"
            {...register('name')}
            error={errors.name?.message as string}
          />
          <Input
            label="SKU *"
            {...register('sku')}
            error={errors.sku?.message as string}
          />
        </div>

        <Input
          label="Description"
          {...register('description')}
          error={errors.description?.message as string}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cost Price *"
            type="number"
            step="0.01"
            {...register('costPrice', { valueAsNumber: true })}
            error={errors.costPrice?.message as string}
          />
          <Input
            label="Selling Price *"
            type="number"
            step="0.01"
            {...register('sellingPrice', { valueAsNumber: true })}
            error={errors.sellingPrice?.message as string}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity *"
            type="number"
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message as string}
          />
          <Input
            label="Reorder Level *"
            type="number"
            {...register('reorderLevel', { valueAsNumber: true })}
            error={errors.reorderLevel?.message as string}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            {...register('categoryId', { valueAsNumber: true })}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId.message as string}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

