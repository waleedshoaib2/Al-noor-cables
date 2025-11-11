import { useState, useMemo } from 'react';
import { useStockStore } from '@/store/useStockStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { Table } from '@/components/Common/Table';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Common/Input';
import { formatCurrency } from '@/utils/helpers';
import type { Product } from '@/types';

interface ProductListProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRecordSale: (product: Product) => void;
}

export default function ProductList({ onEdit, onDelete, onRecordSale }: ProductListProps) {
  const products = useStockStore((state) => state.products);
  const categories = useCategoryStore((state) => state.categories);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'sellingPrice'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((p) => p.isActive);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== '') {
      filtered = filtered.filter((p) => p.categoryId === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'quantity':
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        case 'sellingPrice':
          aVal = a.sellingPrice;
          bVal = b.sellingPrice;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, sortBy, sortOrder]);

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const isLowStock = (product: Product) => product.quantity <= product.reorderLevel;

  const handleSort = (field: 'name' | 'quantity' | 'sellingPrice') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Sort by:</span>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">Name</option>
              <option value="quantity">Quantity</option>
              <option value="sellingPrice">Price</option>
            </select>
            <Button
              variant="secondary"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
          No products found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table
            headers={['Name', 'SKU', 'Quantity', 'Cost Price', 'Selling Price', 'Category', 'Actions']}
          >
            {filteredAndSortedProducts.map((product) => (
              <tr
                key={product.id}
                className={`hover:bg-gray-50 ${
                  isLowStock(product) ? 'bg-red-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  {isLowStock(product) && (
                    <div className="text-xs text-red-600">Low Stock!</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={isLowStock(product) ? 'font-bold text-red-600' : ''}>
                    {product.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(product.costPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(product.sellingPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getCategoryName(product.categoryId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(product)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => onRecordSale(product)}
                    className="text-xs"
                  >
                    Sale
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => onDelete(product)}
                    className="text-xs"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}

