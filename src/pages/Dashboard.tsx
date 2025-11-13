import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useProductStore } from '@/store/useProductStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useCustomerPurchaseStore } from '@/store/useCustomerPurchaseStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import RawMaterialForm from '@/components/RawMaterial/RawMaterialForm';
import RawMaterialList from '@/components/RawMaterial/RawMaterialList';
import SyncStatus from '@/components/Sync/SyncStatus';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import type { RawMaterial } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const language = useLanguageStore((state) => state.language);
  
  // New stores
  const rawMaterials = useRawMaterialStore((state) => state.rawMaterials);
  const getTotalByMaterialType = useRawMaterialStore((state) => state.getTotalByMaterialType);
  const deleteRawMaterial = useRawMaterialStore((state) => state.deleteRawMaterial);
  
  const processedMaterials = useProcessedRawMaterialStore((state) => state.processedMaterials);
  const processedMaterialStock = useProcessedRawMaterialStore((state) => state.stock);
  
  const productions = useProductStore((state) => state.productions);
  const getTotalStock = useProductStore((state) => state.getTotalStock);
  const productStock = useProductStore((state) => state.stock);
  
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
  // Count products with bundles > 0 (available products)
  const availableProductsCount = Object.values(productStock).filter(stock => stock.bundles > 0).length;

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
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold text-gray-900">
        {language === 'ur' ? 'ڈیش بورڈ' : 'Dashboard'}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل مصنوعات' : 'Total Products'}
          </div>
          <div className="text-3xl font-bold text-gray-900">{productions.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل گاہک' : 'Total Customers'}
          </div>
          <div className="text-3xl font-bold text-brand-blue">{customers.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'آج کی خریداری' : "Today's Purchases"}
          </div>
          <div className="text-3xl font-bold text-green-600">{formatCurrency(todayPurchasesTotal)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'اس مہینے کے اخراجات' : "This Month's Expenses"}
          </div>
          <div className="text-3xl font-bold text-blue-600">{formatCurrency(monthExpenses)}</div>
        </div>
      </div>

      {/* Cloud Sync Status */}
      <SyncStatus />

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'ur' ? 'فوری اعمال' : 'Quick Actions'}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => navigate('/raw-materials')}>
            {language === 'ur' ? 'خام مال شامل کریں' : 'Add Raw Material'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/processed-materials')}>
            {language === 'ur' ? 'پروسیسڈ مال شامل کریں' : 'Add Processed Material'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/products')}>
            {language === 'ur' ? 'مصنوعات شامل کریں' : 'Add Product'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/customers')}>
            {language === 'ur' ? 'گاہک شامل کریں' : 'Add Customer'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/expenses')}>
            {language === 'ur' ? 'خرچہ شامل کریں' : 'Add Expense'}
          </Button>
        </div>
      </div>

      {/* Raw Material Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'ur' ? 'دستیاب خام مال' : 'Available Raw Material'}
          </h2>
          <Button variant="primary" onClick={handleAddRawMaterial}>
            {language === 'ur' ? 'خام مال شامل کریں' : 'Add Raw Material'}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              {language === 'ur' ? 'کل کاپر' : 'Total Copper'}
            </div>
            <div className="text-2xl font-bold text-brand-orange">{totalCopper.toFixed(2)} kgs</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              {language === 'ur' ? 'کل سلور' : 'Total Silver'}
            </div>
            <div className="text-2xl font-bold text-brand-orange">{totalSilver.toFixed(2)} kgs</div>
          </div>
        </div>

        {/* Recent Raw Materials */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'حالیہ انٹریز' : 'Recent Entries'}
          </h3>
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
        title={editingMaterial ? (language === 'ur' ? 'خام مال میں ترمیم' : 'Edit Raw Material') : (language === 'ur' ? 'خام مال شامل کریں' : 'Add Raw Material')}
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'ur' ? 'مصنوعات کی اسٹاک کا خلاصہ' : 'Product Stock Summary'}
          </h2>
        </div>
        
        {/* Total Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              {language === 'ur' ? 'مصنوعات کی تعداد' : 'Number of Products'}
            </div>
            <div className="text-2xl font-bold text-brand-orange">{availableProductsCount}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              {language === 'ur' ? 'کل اسٹاک (بنڈلز)' : 'Total Stock (Bundles)'}
            </div>
            <div className="text-2xl font-bold text-brand-blue">{totalStock.bundles.toFixed(2)}</div>
          </div>
        </div>

        {/* Product Breakdown */}
        {Object.entries(productStock).filter(([, stock]) => stock.bundles > 0).length > 0 ? (
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              {language === 'ur' ? 'مصنوعات کی تفصیل' : 'Products in Inventory'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'مصنوعات کا نام' : 'Product Name'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'فٹ' : 'Foot'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'بنڈلز' : 'Bundles'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(productStock)
                    .filter(([, stock]) => stock.bundles > 0)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([productName, stock]) => (
                      <tr key={productName} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-900 font-medium">{productName}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {stock.foot > 0 ? stock.foot.toFixed(2) : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {stock.bundles.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            {language === 'ur' ? 'کوئی مصنوعات موجود نہیں' : 'No products in inventory'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'ur' ? 'حالیہ خریداری' : 'Recent Purchases'}
          </h2>
          {recentPurchases.length === 0 ? (
            <p className="text-gray-500">{language === 'ur' ? 'ابھی تک کوئی خریداری نہیں' : 'No purchases yet'}</p>
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
                        <div className="text-xs text-gray-500">
                          {language === 'ur' ? 'مقدار' : 'Qty'}: {purchase.quantityBundles.toFixed(2)} {language === 'ur' ? 'بنڈلز' : 'bundles'}
                        </div>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'ur' ? 'پروسیسڈ مال' : 'Processed Materials'}
          </h2>
          
          {/* Total Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'کل پروسیسڈ مال' : 'Total Processed Materials'}
              </div>
              <div className="text-2xl font-bold text-brand-orange">{processedMaterials.length}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'کل خام مال' : 'Total Raw Materials'}
              </div>
              <div className="text-2xl font-bold text-brand-blue">{rawMaterials.length}</div>
            </div>
          </div>

          {/* Processed Materials Breakdown */}
          {Object.keys(processedMaterialStock).length > 0 ? (
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-3">
                {language === 'ur' ? 'پروسیسڈ مال کی تفصیل' : 'Processed Materials in Inventory'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {language === 'ur' ? 'مٹیریل کا نام' : 'Material Name'}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {language === 'ur' ? 'دستیاب مقدار (کلو)' : 'Available Quantity (kgs)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(processedMaterialStock)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([materialName, stock]) => (
                        <tr key={materialName} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-900 font-medium">{materialName}</td>
                          <td className="py-3 px-4 text-gray-700">
                            {stock > 0 ? stock.toFixed(2) : '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              {language === 'ur' ? 'کوئی پروسیسڈ مال موجود نہیں' : 'No processed materials in inventory'}
            </p>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'ur' ? 'حالیہ اخراجات' : 'Recent Expenses'}
        </h2>
        {recentExpenses.length === 0 ? (
          <p className="text-gray-500">{language === 'ur' ? 'ابھی تک کوئی اخراجات نہیں' : 'No expenses yet'}</p>
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
