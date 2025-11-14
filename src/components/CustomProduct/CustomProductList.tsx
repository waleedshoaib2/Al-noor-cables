import { useCustomProductStore } from '@/store/useCustomProductStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { CustomProduct } from '@/types';

interface CustomProductListProps {
  products?: CustomProduct[];
  onEdit: (product: CustomProduct) => void;
  onDelete: (id: number) => void;
}

export default function CustomProductList({ products, onEdit, onDelete }: CustomProductListProps) {
  const { t, language } = useTranslation();
  const allProducts = useCustomProductStore((state) => state.customProducts);
  const displayProducts = products || allProducts;

  if (displayProducts.length === 0) {
    return <p className="text-gray-500">{t('noCustomProductsFound', 'customProduct')}</p>;
  }

  return (
    <div className="space-y-2">
      {displayProducts.map((product) => (
        <div key={product.id} className="border rounded-lg p-3 bg-white shadow-sm flex justify-between items-center">
          <div className="font-medium text-gray-900">{product.name}</div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(product)}
              className="text-brand-blue hover:text-brand-blue-dark text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded"
            >
              {t('edit', 'customProduct')}
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded"
            >
              {t('delete', 'customProduct')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

