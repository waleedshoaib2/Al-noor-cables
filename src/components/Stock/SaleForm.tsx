import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saleSchema } from '@/utils/validation';
import { useStockStore } from '@/store/useStockStore';
import { Modal } from '@/components/Common/Modal';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import { calculateFinalAmount, formatCurrency } from '@/utils/helpers';
import type { Product } from '@/types';

interface SaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSubmit: (data: any) => void;
}

export default function SaleForm({ isOpen, onClose, product, onSubmit }: SaleFormProps) {
  const products = useStockStore((state) => state.products);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: product?.id || products[0]?.id || 0,
      quantity: 1,
      unitPrice: product?.sellingPrice || 0,
      discount: 0,
      customerName: '',
      customerPhone: '',
    },
  });

  const selectedProductId = watch('productId');
  const quantity = watch('quantity');
  const unitPrice = watch('unitPrice');
  const discount = watch('discount');

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));

  useEffect(() => {
    if (product) {
      reset({
        productId: product.id,
        quantity: 1,
        unitPrice: product.sellingPrice,
        discount: 0,
        customerName: '',
        customerPhone: '',
      });
    }
  }, [product, reset]);

  useEffect(() => {
    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const disc = Number(discount) || 0;
    const total = qty * price;
    const final = calculateFinalAmount(qty, price, disc);
    setTotalAmount(total);
    setFinalAmount(final);
  }, [quantity, unitPrice, discount]);

  useEffect(() => {
    if (selectedProduct) {
      const currentValues = watch();
      reset({
        ...currentValues,
        unitPrice: selectedProduct.sellingPrice,
      });
    }
  }, [selectedProductId, selectedProduct, reset, watch]);

  const onFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        productId: Number(data.productId),
        quantity: Number(data.quantity),
        unitPrice: Number(data.unitPrice),
        discount: Number(data.discount) || 0,
      });
      onClose();
      reset();
    } catch (error) {
      console.error('Error recording sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxQuantity = selectedProduct?.quantity || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Sale"
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product *
          </label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            {...register('productId', { valueAsNumber: true })}
            disabled={!!product}
          >
            {products
              .filter((p) => p.isActive)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
          </select>
          {errors.productId && (
            <p className="mt-1 text-sm text-red-600">{errors.productId.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity *"
            type="number"
            min="1"
            max={maxQuantity}
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message as string}
          />
          <Input
            label="Unit Price *"
            type="number"
            step="0.01"
            {...register('unitPrice', { valueAsNumber: true })}
            error={errors.unitPrice?.message as string}
          />
        </div>

        <Input
          label="Discount"
          type="number"
          step="0.01"
          {...register('discount', { valueAsNumber: true })}
          error={errors.discount?.message as string}
        />

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-700">Total Amount:</span>
            <span className="font-medium">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-700">Final Amount:</span>
            <span className="font-bold text-lg">{formatCurrency(finalAmount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            {...register('customerName')}
          />
          <Input
            label="Customer Phone"
            {...register('customerPhone')}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading || maxQuantity === 0}>
            {loading ? 'Recording...' : 'Record Sale'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

