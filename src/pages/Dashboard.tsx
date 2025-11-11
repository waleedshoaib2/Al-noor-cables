import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockStore } from '@/store/useStockStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import RawMaterialForm from '@/components/RawMaterial/RawMaterialForm';
import RawMaterialList from '@/components/RawMaterial/RawMaterialList';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import type { RawMaterial } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const products = useStockStore((state) => state.products);
  const lowStockProducts = useStockStore((state) => state.getLowStockProducts());
  const sales = useStockStore((state) => state.sales);
  const expenses = useExpenseStore((state) => state.expenses);
  const getTotalByPeriod = useExpenseStore((state) => state.getTotalByPeriod);
  const categories = useCategoryStore((state) => state.categories);
  
  // Raw Material store
  const deleteRawMaterial = useRawMaterialStore((state) => state.deleteRawMaterial);
  const getTotalByMaterialType = useRawMaterialStore((state) => state.getTotalByMaterialType);
  
  const [showRawMaterialForm, setShowRawMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const today = new Date();
  const todaySales = sales.filter(
    (s) => s.saleDate >= startOfDay(today) && s.saleDate <= endOfDay(today)
  );
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.finalAmount, 0);
  const monthExpenses = getTotalByPeriod(startOfMonth(today), endOfMonth(today));

  const recentSales = sales.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5).sort((a, b) => b.date.getTime() - a.date.getTime());

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name || 'Unknown';
  };

  const handleAddRawMaterial = () => {
    setEditingMaterial(null);
    setShowRawMaterialForm(true);
  };

  const handleEditRawMaterial = (material: RawMaterial) => {
    setEditingMaterial(material);
    setShowRawMaterialForm(true);
  };

  const handleDeleteRawMaterial = (id: number) => {
    if (window.confirm('Are you sure you want to delete this raw material entry?')) {
      deleteRawMaterial(id);
    }
  };

  const handleRawMaterialSubmit = () => {
    setShowRawMaterialForm(false);
    setEditingMaterial(null);
  };

  const totalCopper = getTotalByMaterialType('Copper');
  const totalSilver = getTotalByMaterialType('Silver');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Total Products</div>
          <div className="text-3xl font-bold text-gray-900">{products.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Low Stock Alerts</div>
          <div className="text-3xl font-bold text-red-600">{lowStockProducts.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Today's Sales</div>
          <div className="text-3xl font-bold text-green-600">{formatCurrency(todaySalesTotal)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">This Month's Expenses</div>
          <div className="text-3xl font-bold text-blue-600">{formatCurrency(monthExpenses)}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => navigate('/stock')}>
            Add Product
          </Button>
          <Button variant="success" onClick={() => navigate('/stock')}>
            Record Sale
          </Button>
          <Button variant="primary" onClick={() => navigate('/expenses')}>
            Add Expense
          </Button>
        </div>
      </div>

      {/* Raw Material Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Raw Material Intake</h2>
          <Button variant="primary" onClick={handleAddRawMaterial}>
            Add Raw Material
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Copper</div>
            <div className="text-2xl font-bold text-brand-orange">{totalCopper.toFixed(2)} kgs</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Silver</div>
            <div className="text-2xl font-bold text-brand-orange">{totalSilver.toFixed(2)} kgs</div>
          </div>
        </div>

        {/* Recent Raw Materials */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-3">Recent Entries</h3>
          <RawMaterialList
            onEdit={handleEditRawMaterial}
            onDelete={handleDeleteRawMaterial}
            limit={5}
          />
        </div>
      </div>

      {/* Raw Material Form Modal */}
      <Modal
        isOpen={showRawMaterialForm}
        onClose={() => {
          setShowRawMaterialForm(false);
          setEditingMaterial(null);
        }}
        title={editingMaterial ? 'Edit Raw Material' : 'Add Raw Material'}
        size="lg"
      >
        <RawMaterialForm
          material={editingMaterial}
          onClose={() => {
            setShowRawMaterialForm(false);
            setEditingMaterial(null);
          }}
          onSubmit={handleRawMaterialSubmit}
        />
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h2>
          {recentSales.length === 0 ? (
            <p className="text-gray-500">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{getProductName(sale.productId)}</div>
                      <div className="text-sm text-gray-500">{sale.saleNo}</div>
                      <div className="text-xs text-gray-400">{formatDate(sale.saleDate)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(sale.finalAmount)}</div>
                      <div className="text-xs text-gray-500">Qty: {sale.quantity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500">No low stock alerts</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{getCategoryName(product.categoryId)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">{product.quantity}</div>
                      <div className="text-xs text-gray-500">Reorder: {product.reorderLevel}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h2>
        {recentExpenses.length === 0 ? (
          <p className="text-gray-500">No expenses yet</p>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <div className="font-medium text-gray-900">{expense.title}</div>
                  <div className="text-sm text-gray-500">{formatDate(expense.date)}</div>
                </div>
                <div className="font-bold text-gray-900">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
