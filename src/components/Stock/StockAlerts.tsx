import { useStockStore } from '@/store/useStockStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { formatCurrency } from '@/utils/helpers';

export default function StockAlerts() {
  const lowStockProducts = useStockStore((state) => state.getLowStockProducts());
  const categories = useCategoryStore((state) => state.categories);

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-red-800">
          Low Stock Alerts ({lowStockProducts.length})
        </h3>
      </div>
      <div className="space-y-2">
        {lowStockProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-md p-3 border border-red-200"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-900">{product.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({getCategoryName(product.categoryId)})
                </span>
              </div>
              <div className="text-right">
                <span className="text-red-600 font-bold">
                  {product.quantity} / {product.reorderLevel}
                </span>
                <div className="text-xs text-gray-500">
                  {formatCurrency(product.sellingPrice)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

