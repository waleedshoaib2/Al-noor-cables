import { useState } from 'react';
import { useStockStore } from '@/store/useStockStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { Table } from '@/components/Common/Table';
import { Input } from '@/components/Common/Input';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function Reports() {
  const products = useStockStore((state) => state.products);
  const sales = useStockStore((state) => state.sales);
  const expenses = useExpenseStore((state) => state.expenses);
  const expenseCategories = useCategoryStore((state) => state.expenseCategories);
  const categories = useCategoryStore((state) => state.categories);
  const [activeTab, setActiveTab] = useState<'stock' | 'sales' | 'expenses'>('stock');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredSales = sales.filter((sale) => {
    if (!startDate && !endDate) return true;
    const saleDate = sale.saleDate;
    if (startDate && saleDate < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (saleDate > end) return false;
    }
    return true;
  });

  const filteredExpenses = expenses.filter((expense) => {
    if (!startDate && !endDate) return true;
    if (startDate && expense.date < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (expense.date > end) return false;
    }
    return true;
  });

  const salesTotal = filteredSales.reduce((sum, s) => sum + s.finalAmount, 0);
  const expensesTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryName = (categoryId: number) => {
    return expenseCategories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'stock', label: 'Stock Report' },
              { id: 'sales', label: 'Sales Report' },
              { id: 'expenses', label: 'Expense Report' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Date Filters */}
          {(activeTab === 'sales' || activeTab === 'expenses') && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          {/* Stock Report */}
          {activeTab === 'stock' && (
            <div>
              <div className="mb-4 text-lg font-semibold">
                Total Products: {products.length}
              </div>
              <Table headers={['Name', 'SKU', 'Quantity', 'Cost Price', 'Selling Price', 'Category']}>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.costPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {categories.find((c) => c.id === product.categoryId)?.name || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {/* Sales Report */}
          {activeTab === 'sales' && (
            <div>
              <div className="mb-4 text-lg font-semibold">
                Total Revenue: {formatCurrency(salesTotal)}
              </div>
              <Table headers={['Sale No', 'Product', 'Quantity', 'Unit Price', 'Discount', 'Final Amount', 'Date']}>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.saleNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getProductName(sale.productId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(sale.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(sale.discount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(sale.finalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sale.saleDate)}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {/* Expense Report */}
          {activeTab === 'expenses' && (
            <div>
              <div className="mb-4 text-lg font-semibold">
                Total Expenses: {formatCurrency(expensesTotal)}
              </div>
              <Table headers={['Title', 'Amount', 'Category', 'Date']}>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryName(expense.categoryId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.date)}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
