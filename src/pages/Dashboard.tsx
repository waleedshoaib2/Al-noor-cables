import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useProductStore } from '@/store/useProductStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useCustomerPurchaseStore } from '@/store/useCustomerPurchaseStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import RawMaterialForm from '@/components/RawMaterial/RawMaterialForm';
import RawMaterialList from '@/components/RawMaterial/RawMaterialList';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import type { RawMaterial } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // New stores
  const rawMaterials = useRawMaterialStore((state) => state.rawMaterials);
  const getTotalByMaterialType = useRawMaterialStore((state) => state.getTotalByMaterialType);
  const deleteRawMaterial = useRawMaterialStore((state) => state.deleteRawMaterial);
  
  const processedMaterials = useProcessedRawMaterialStore((state) => state.processedMaterials);
  
  const productions = useProductStore((state) => state.productions);
  const getTotalStock = useProductStore((state) => state.getTotalStock);
  
  const customers = useCustomerStore((state) => state.customers);
  const purchases = useCustomerPurchaseStore((state) => state.purchases);
  
  const expenses = useExpenseStore((state) => state.expenses);
  const getTotalByPeriod = useExpenseStore((state) => state.getTotalByPeriod);
  
  const [showRawMaterialForm, setShowRawMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const today = new Date();
  const todayPurchases = purchases.filter(
    (p) => new Date(p.date) >= startOfDay(today) && new Date(p.date) <= endOfDay(today)
  );
  const todayPurchasesTotal = todayPurchases.reduce((sum, p) => sum + (p.price || 0), 0);
  const monthExpenses = getTotalByPeriod(startOfMonth(today), endOfMonth(today));

  const recentPurchases = purchases.slice(0, 5).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentExpenses = expenses.slice(0, 5).sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const totalStock = getTotalStock();

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
          <div className="text-3xl font-bold text-gray-900">{productions.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Total Customers</div>
          <div className="text-3xl font-bold text-brand-blue">{customers.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Today's Purchases</div>
          <div className="text-3xl font-bold text-green-600">{formatCurrency(todayPurchasesTotal)}</div>
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
          <Button variant="primary" onClick={() => navigate('/raw-materials')}>
            Add Raw Material
          </Button>
          <Button variant="primary" onClick={() => navigate('/processed-materials')}>
            Add Processed Material
          </Button>
          <Button variant="primary" onClick={() => navigate('/products')}>
            Add Product
          </Button>
          <Button variant="primary" onClick={() => navigate('/customers')}>
            Add Customer
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

      {/* Product Stock Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Stock Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Stock (Foot)</div>
            <div className="text-2xl font-bold text-brand-orange">{totalStock.foot.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Stock (Bundles)</div>
            <div className="text-2xl font-bold text-brand-blue">{totalStock.bundles.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Purchases</h2>
          {recentPurchases.length === 0 ? (
            <p className="text-gray-500">No purchases yet</p>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map((purchase) => {
                const customer = customers.find((c) => c.id === purchase.customerId);
                return (
                  <div key={purchase.id} className="border-b pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{customer?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{purchase.productName}</div>
                        <div className="text-xs text-gray-400">{formatDate(purchase.date)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(purchase.price || 0)}</div>
                        <div className="text-xs text-gray-500">Qty: {purchase.quantityBundles.toFixed(2)} bundles</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Processed Materials Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Processed Materials</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Processed Materials</div>
              <div className="text-2xl font-bold text-brand-orange">{processedMaterials.length}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Raw Materials</div>
              <div className="text-2xl font-bold text-brand-blue">{rawMaterials.length}</div>
            </div>
          </div>
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
