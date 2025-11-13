import { useState, useEffect, useRef } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useCustomerPurchaseStore } from '@/store/useCustomerPurchaseStore';
import { useProductStore } from '@/store/useProductStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import { Input } from '@/components/Common/Input';
import { exportToPDF } from '@/utils/pdfExport';
import type { Customer, CustomerPurchase } from '@/types';

export default function Customers() {
  const { t, language } = useTranslation();
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const customers = useCustomerStore((state) => state.customers);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);
  
  const purchases = useCustomerPurchaseStore((state) => state.purchases);
  const addPurchase = useCustomerPurchaseStore((state) => state.addPurchase);
  const deletePurchase = useCustomerPurchaseStore((state) => state.deletePurchase);
  const getPurchasesByCustomerId = useCustomerPurchaseStore((state) => state.getPurchasesByCustomerId);
  
  const productions = useProductStore((state) => state.productions);
  const getStockByName = useProductStore((state) => state.getStockByName);

  const [activeTab, setActiveTab] = useState<'customers' | 'purchases'>('customers');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<CustomerPurchase | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    details: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reportSectionRef = useRef<HTMLDivElement>(null);

  // PDF Export handler
  const handleExportPDF = async () => {
    if (reportSectionRef.current) {
      await exportToPDF(
        'customers-report-section',
        `Customers_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        activeTab === 'customers' ? 'Customers Report' : 'Purchases/Transactions Report'
      );
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', address: '', details: '' });
    setErrors({});
    setShowCustomerForm(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
      details: customer.details || '',
    });
    setErrors({});
    setShowCustomerForm(true);
  };

  const handleDeleteCustomer = (id: number) => {
    if (window.confirm(t('deleteConfirm', 'customer'))) {
      deleteCustomer(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = language === 'ur' ? 'نام درکار ہے' : 'Name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }

    setShowCustomerForm(false);
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', address: '', details: '' });
  };

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('title', 'customer')}</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={toggleLanguage}
            className="text-sm"
            title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
          >
            {language === 'en' ? '🇵🇰 اردو' : '🇬🇧 English'}
          </Button>
          {activeTab === 'customers' ? (
            <Button variant="primary" onClick={handleAddCustomer}>
              {t('addCustomer', 'customer')}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setShowPurchaseForm(true)}>
              {language === 'ur' ? 'نیا خرید' : 'Add Purchase'}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">
          {language === 'ur' ? 'گاہکوں کا انتظام' : 'Customers Management'}
        </h2>
        <p className="text-white/90 leading-relaxed">
          {language === 'ur' 
            ? 'یہ صفحہ آپ کو گاہکوں کی معلومات ریکارڈ کرنے اور ان کی خریداری/لین دین کو ٹریک کرنے کی سہولت فراہم کرتا ہے۔ آپ یہاں گاہک کا نام، فون، پتہ، تفصیلات شامل کر سکتے ہیں اور ان کی خریداری کی تاریخ، مقدار، قیمت اور نوٹس ریکارڈ کر سکتے ہیں۔'
            : 'This page allows you to record customer information and track their purchases/transactions. You can add customer name, phone, address, details, and record their purchase history, quantity, price, and notes here.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {language === 'ur' ? 'گاہکوں کی فہرست' : 'Customers'}
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'purchases'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {language === 'ur' ? 'خریداری/لین دین' : 'Purchases/Transactions'}
          </button>
        </nav>
      </div>

      {activeTab === 'customers' ? (
        <>
      {/* Customers List */}
      <div id="customers-list-report-section" className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {customers.length === 0
              ? t('noCustomersFound', 'customer')
              : `${customers.length} ${t('customersFound', 'customer')}`}
          </h2>
          {customers.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={() => {
                const element = document.getElementById('customers-list-report-section');
                if (element) {
                  exportToPDF(
                    'customers-list-report-section',
                    `Customers_List_Report_${new Date().toISOString().split('T')[0]}.pdf`,
                    'Customers List Report'
                  );
                }
              }} 
              className="no-print"
            >
              📄 {language === 'ur' ? 'PDF برآمد کریں' : 'Export PDF'}
            </Button>
          )}
        </div>
        {customers.length === 0 ? (
          <p className="text-gray-500">{t('noCustomersFound', 'customer')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="text-brand-blue hover:text-brand-blue-dark text-sm font-medium"
                    >
                      {t('edit', 'customer')}
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      {t('delete', 'customer')}
                    </button>
                  </div>
                </div>
                {customer.phone && (
                  <div className="text-sm text-gray-600 mt-1">📞 {customer.phone}</div>
                )}
                {customer.address && (
                  <div className="text-sm text-gray-600 mt-1">📍 {customer.address}</div>
                )}
                {customer.details && (
                  <div className="text-xs text-gray-500 mt-1 italic">{customer.details}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      <Modal
        isOpen={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false);
          setEditingCustomer(null);
        }}
        title={
          editingCustomer ? t('editCustomer', 'customer') : t('addCustomer', 'customer')
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={`${t('name', 'customer')} *`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label={t('phone', 'customer')}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0300-0000000"
          />
          <Input
            label={t('address', 'customer')}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('details', 'customer')}
            </label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
              rows={3}
              placeholder={t('additionalDetails', 'customer')}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCustomerForm(false);
                setEditingCustomer(null);
              }}
            >
              {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary">
              {editingCustomer ? t('update', 'customer') : t('add', 'customer')}
            </Button>
          </div>
        </form>
      </Modal>
        </>
      ) : (
        /* Purchases/Transactions Tab */
        <div id="customers-report-section" ref={reportSectionRef} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {purchases.length === 0
                ? (language === 'ur' ? 'کوئی خریداری نہیں ملی' : 'No purchases found')
                : `${purchases.length} ${language === 'ur' ? 'خریداری ملی' : 'Purchases Found'}`}
            </h2>
            {purchases.length > 0 && (
              <Button variant="secondary" onClick={handleExportPDF} className="no-print">
                📄 {language === 'ur' ? 'PDF برآمد کریں' : 'Export PDF'}
              </Button>
            )}
          </div>
          {purchases.length === 0 ? (
            <p className="text-gray-500">{language === 'ur' ? 'کوئی خریداری نہیں ملی' : 'No purchases found'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'گاہک' : 'Customer'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'نام' : 'Name'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'نمبر' : 'Number'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'تارا' : 'Tara'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'مقدار (بنڈلز)' : 'Quantity (Bundles)'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'قیمت' : 'Price'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'تاریخ' : 'Date'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'نوٹس' : 'Notes'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {language === 'ur' ? 'اعمال' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => {
                    const customer = customers.find((c) => c.id === purchase.customerId);
                    return (
                      <tr
                        key={purchase.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {customer?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {purchase.productName}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {purchase.productNumber || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {purchase.productTara || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {purchase.quantityBundles.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {purchase.price > 0 ? Math.round(purchase.price).toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(purchase.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {purchase.notes || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              if (window.confirm(language === 'ur' ? 'خریداری حذف کریں؟' : 'Delete purchase?')) {
                                // Restore product stock
                                const purchaseProduction = productions.find((p) => p.id === purchase.productProductionId);
                                if (purchaseProduction) {
                                  const updatedStock = { ...useProductStore.getState().stock };
                                  if (!updatedStock[purchaseProduction.productName]) {
                                    updatedStock[purchaseProduction.productName] = { foot: 0, bundles: 0 };
                                  }
                                  updatedStock[purchaseProduction.productName].bundles += purchase.quantityBundles;
                                  useProductStore.setState({ stock: updatedStock });
                                  useProductStore.getState().saveToStorage();
                                }
                                
                                deletePurchase(purchase.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            {language === 'ur' ? 'حذف' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Purchase Form Modal */}
      <Modal
        isOpen={showPurchaseForm}
        onClose={() => {
          setShowPurchaseForm(false);
          setEditingPurchase(null);
        }}
        title={language === 'ur' ? 'نیا خرید' : 'Add Purchase'}
        size="md"
      >
        <PurchaseForm
          purchase={editingPurchase}
          onClose={() => {
            setShowPurchaseForm(false);
            setEditingPurchase(null);
          }}
          onSubmit={() => {
            setShowPurchaseForm(false);
            setEditingPurchase(null);
          }}
        />
      </Modal>
    </div>
  );
}

// Purchase Form Component
interface PurchaseFormProps {
  purchase?: CustomerPurchase | null;
  onClose: () => void;
  onSubmit: () => void;
}

function PurchaseForm({ purchase, onClose, onSubmit }: PurchaseFormProps) {
  const { t, language } = useTranslation();
  const customers = useCustomerStore((state) => state.customers);
  const addPurchase = useCustomerPurchaseStore((state) => state.addPurchase);
  const updatePurchase = useCustomerPurchaseStore((state) => state.updatePurchase);
  const productions = useProductStore((state) => state.productions);
  const getStockByName = useProductStore((state) => state.getStockByName);

  // Get available products (productions with stock)
  const availableProductions = productions.filter((p) => {
    const stock = getStockByName(p.productName);
    return stock.bundles > 0;
  });

  const [formData, setFormData] = useState({
    customerId: '',
    productProductionId: '',
    quantityBundles: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (purchase) {
      setFormData({
        customerId: purchase.customerId.toString(),
        productProductionId: purchase.productProductionId.toString(),
        quantityBundles: purchase.quantityBundles.toString(),
        price: purchase.price.toString(),
        date: purchase.date.toISOString().split('T')[0],
        notes: purchase.notes || '',
      });
    } else {
      setFormData({
        customerId: '',
        productProductionId: '',
        quantityBundles: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setErrors({});
  }, [purchase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.customerId) {
      newErrors.customerId = language === 'ur' ? 'گاہک منتخب کریں' : 'Please select a customer';
    }
    if (!formData.productProductionId) {
      newErrors.productProductionId = language === 'ur' ? 'پروڈکٹ منتخب کریں' : 'Please select a product';
    }
    const quantityBundles = parseFloat(formData.quantityBundles) || 0;
    if (quantityBundles <= 0) {
      newErrors.quantityBundles = language === 'ur' ? 'مقدار درکار ہے' : 'Quantity is required';
    } else {
      // Check stock
      const selectedProduction = productions.find((p) => p.id === parseInt(formData.productProductionId));
      if (selectedProduction) {
        const stock = getStockByName(selectedProduction.productName);
        if (quantityBundles > stock.bundles) {
          newErrors.quantityBundles =
            language === 'ur'
              ? `دستیاب: ${stock.bundles.toFixed(2)} بنڈلز`
              : `Available: ${stock.bundles.toFixed(2)} bundles`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedProduction = productions.find((p) => p.id === parseInt(formData.productProductionId));
    if (!selectedProduction) {
      setErrors({ productProductionId: language === 'ur' ? 'پروڈکٹ نہیں ملا' : 'Product not found' });
      return;
    }

    // Update product stock
    const updatedStock = { ...useProductStore.getState().stock };
    if (!updatedStock[selectedProduction.productName]) {
      updatedStock[selectedProduction.productName] = { foot: 0, bundles: 0 };
    }
    updatedStock[selectedProduction.productName].bundles -= quantityBundles;
    useProductStore.setState({ stock: updatedStock });
    useProductStore.getState().saveToStorage();

    if (purchase) {
      // Restore old stock first
      const oldProduction = productions.find((p) => p.id === purchase.productProductionId);
      if (oldProduction) {
        const oldUpdatedStock = { ...useProductStore.getState().stock };
        if (!oldUpdatedStock[oldProduction.productName]) {
          oldUpdatedStock[oldProduction.productName] = { foot: 0, bundles: 0 };
        }
        oldUpdatedStock[oldProduction.productName].bundles += purchase.quantityBundles;
        if (oldProduction.productName !== selectedProduction.productName) {
          oldUpdatedStock[selectedProduction.productName].bundles -= quantityBundles;
        }
        useProductStore.setState({ stock: oldUpdatedStock });
        useProductStore.getState().saveToStorage();
      }
      
      const price = parseFloat(formData.price) || 0;
      updatePurchase(purchase.id, {
        customerId: parseInt(formData.customerId),
        productProductionId: parseInt(formData.productProductionId),
        productName: selectedProduction.productName,
        productNumber: selectedProduction.productNumber,
        productTara: selectedProduction.productTara,
        quantityBundles,
        price,
        date: new Date(formData.date),
        notes: formData.notes || undefined,
      });
    } else {
      const price = parseFloat(formData.price) || 0;
      addPurchase({
        customerId: parseInt(formData.customerId),
        productProductionId: parseInt(formData.productProductionId),
        productName: selectedProduction.productName,
        productNumber: selectedProduction.productNumber,
        productTara: selectedProduction.productTara,
        quantityBundles,
        price,
        date: new Date(formData.date),
        notes: formData.notes || undefined,
      });
    }

    onSubmit();
  };

  const selectedProduction = formData.productProductionId 
    ? productions.find((p) => p.id === parseInt(formData.productProductionId))
    : null;
  const selectedProductStock = selectedProduction 
    ? getStockByName(selectedProduction.productName) 
    : { foot: 0, bundles: 0 };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ur' ? 'گاہک' : 'Customer'} *
        </label>
        <select
          value={formData.customerId}
          onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.customerId ? 'border-red-500' : ''
          }`}
        >
          <option value="">{language === 'ur' ? 'گاہک منتخب کریں' : 'Select Customer'}</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ur' ? 'پروڈکٹ' : 'Product'} *
        </label>
        <select
          value={formData.productProductionId}
          onChange={(e) => setFormData({ ...formData, productProductionId: e.target.value })}
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.productProductionId ? 'border-red-500' : ''
          }`}
        >
          <option value="">{language === 'ur' ? 'پروڈکٹ منتخب کریں' : 'Select Product'}</option>
          {availableProductions.map((production) => {
            const stock = getStockByName(production.productName);
            return (
              <option key={production.id} value={production.id}>
                {production.productName} ({production.productNumber}) - {production.productTara} - {stock.bundles.toFixed(2)} {language === 'ur' ? 'بنڈلز دستیاب' : 'bundles available'}
              </option>
            );
          })}
        </select>
        {errors.productProductionId && <p className="mt-1 text-sm text-red-600">{errors.productProductionId}</p>}
        {selectedProduction && (
          <p className="mt-1 text-sm text-gray-500">
            {language === 'ur' 
              ? `دستیاب: ${selectedProductStock.bundles.toFixed(2)} بنڈلز`
              : `Available: ${selectedProductStock.bundles.toFixed(2)} bundles`}
          </p>
        )}
      </div>

      <Input
        label={`${language === 'ur' ? 'مقدار (بنڈلز)' : 'Quantity (Bundles)'} *`}
        type="number"
        min="0"
        step="0.01"
        value={formData.quantityBundles}
        onChange={(e) => setFormData({ ...formData, quantityBundles: e.target.value })}
        placeholder="0.00"
        error={errors.quantityBundles}
      />

      <Input
        label={`${language === 'ur' ? 'قیمت' : 'Price'}`}
        type="number"
        min="0"
        step="0.01"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        placeholder="0.00"
      />

      <Input
        label={`${language === 'ur' ? 'تاریخ' : 'Date'} *`}
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ur' ? 'نوٹس' : 'Notes'}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
          rows={3}
          placeholder={language === 'ur' ? 'اضافی تفصیلات' : 'Additional notes'}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary">
          {purchase ? (language === 'ur' ? 'اپڈیٹ' : 'Update') : (language === 'ur' ? 'شامل کریں' : 'Add')}
        </Button>
      </div>
    </form>
  );
}

