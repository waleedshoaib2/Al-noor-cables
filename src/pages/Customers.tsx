import { useState, useRef } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useCustomerPurchaseStore } from '@/store/useCustomerPurchaseStore';
import { useProductStore } from '@/store/useProductStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import { Input } from '@/components/Common/Input';
import CustomerPrintView from '@/components/Customer/CustomerPrintView';
import PurchaseInvoiceView from '@/components/Customer/PurchaseInvoiceView';
import type { Customer } from '@/types';
import { format } from 'date-fns';

export default function Customers() {
  const { t, language } = useTranslation();
  
  // Customer store
  const customers = useCustomerStore((state) => state.customers);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);
  
  // Purchase store
  const purchases = useCustomerPurchaseStore((state) => state.purchases);
  const addPurchase = useCustomerPurchaseStore((state) => state.addPurchase);
  const deletePurchase = useCustomerPurchaseStore((state) => state.deletePurchase);
  const getPurchasesByCustomerId = useCustomerPurchaseStore((state) => state.getPurchasesByCustomerId);
  
  // Product store
  const productions = useProductStore((state) => state.productions);
  const getStockByName = useProductStore((state) => state.getStockByName);

  const [activeTab, setActiveTab] = useState<'customers' | 'purchases'>('customers');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedProductionId, setSelectedProductionId] = useState<number | null>(null);
  const [printingPurchase, setPrintingPurchase] = useState<{ purchaseId: number; customerId: number } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    details: '',
  });
  
  const [purchaseFormData, setPurchaseFormData] = useState({
    customerId: 0,
    productProductionId: 0,
    quantityBundles: 0,
    price: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const reportSectionRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 50);
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
    if (window.confirm(language === 'ur' ? 'کیا آپ واقعی اس گاہک کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this customer?')) {
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

  const handleAddPurchase = () => {
    setPurchaseFormData({
      customerId: 0,
      productProductionId: 0,
      quantityBundles: 0,
      price: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    });
    setSelectedProductionId(null);
    setErrors({});
    setShowPurchaseForm(true);
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!purchaseFormData.customerId) {
      newErrors.customerId = language === 'ur' ? 'گاہک منتخب کریں' : 'Select a customer';
    }
    if (!purchaseFormData.productProductionId) {
      newErrors.productProductionId = language === 'ur' ? 'مصنوعات منتخب کریں' : 'Select a product';
    }
    if (purchaseFormData.quantityBundles <= 0) {
      newErrors.quantityBundles = language === 'ur' ? 'مقدار 0 سے زیادہ ہونی چاہیے' : 'Quantity must be greater than 0';
    }
    if (purchaseFormData.price <= 0) {
      newErrors.price = language === 'ur' ? 'قیمت 0 سے زیادہ ہونی چاہیے' : 'Price must be greater than 0';
    }

    // Check stock availability and get product
    const selectedProduction = productions.find(p => p.id === purchaseFormData.productProductionId);
    if (!selectedProduction) {
      newErrors.productProductionId = language === 'ur' ? 'مصنوعات نہیں ملی' : 'Product not found';
    } else {
      const stock = getStockByName(selectedProduction.productName);
      if (purchaseFormData.quantityBundles > stock.bundles) {
        newErrors.quantityBundles = language === 'ur' 
          ? `اسٹاک میں صرف ${stock.bundles} بنڈل دستیاب ہیں` 
          : `Only ${stock.bundles} bundles available in stock`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!selectedProduction) return;

    // Create purchase - stock will be updated automatically by the store
    addPurchase({
      customerId: purchaseFormData.customerId,
      productProductionId: purchaseFormData.productProductionId,
      productName: selectedProduction.productName,
      productNumber: selectedProduction.productNumber,
      productTara: selectedProduction.productTara,
      quantityBundles: purchaseFormData.quantityBundles,
      price: purchaseFormData.price,
      date: new Date(purchaseFormData.date),
      notes: purchaseFormData.notes,
    });

    setShowPurchaseForm(false);
    setPurchaseFormData({
      customerId: 0,
      productProductionId: 0,
      quantityBundles: 0,
      price: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    });
    
    alert(language === 'ur' ? 'خریداری کامیابی سے شامل ہوگئی' : 'Purchase added successfully');
  };

  const handleDeletePurchase = (purchaseId: number) => {
    if (window.confirm(language === 'ur' ? 'کیا آپ واقعی اس خریداری کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this purchase?')) {
      deletePurchase(purchaseId);
    }
  };

  const handlePrintInvoice = (purchaseId: number, customerId: number) => {
    setPrintingPurchase({ purchaseId, customerId });
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Available products with stock > 0
  const availableProducts = productions.filter(prod => {
    const stock = getStockByName(prod.productName);
    return stock.bundles > 0;
  });

  // Filter purchases
  const filteredPurchases = filterCustomer === 'all' 
    ? purchases 
    : purchases.filter(p => p.customerId === parseInt(filterCustomer));

  // Get customer name helper
  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold text-gray-900">{t('title', 'customer')}</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md no-print">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'customers'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 {language === 'ur' ? 'گاہک' : 'Customers'} ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'purchases'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🛒 {language === 'ur' ? 'خریداری' : 'Purchases'} ({purchases.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <>
          <div className="flex justify-end no-print">
            <Button variant="primary" onClick={handleAddCustomer}>
              {t('addCustomer', 'customer')}
            </Button>
          </div>

          {/* Customers List */}
          <div id="customers-list-report-section" className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 no-print">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {customers.length === 0
                  ? t('noCustomersFound', 'customer')
                  : `${customers.length} ${t('customersFound', 'customer')}`}
              </h2>
              {customers.length > 0 && (
                <Button 
                  variant="secondary" 
                  onClick={handlePrint}
                  className="no-print"
                >
                  🖨️ {language === 'ur' ? 'پرنٹ' : 'Print'}
                </Button>
              )}
            </div>
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{t('noCustomersFound', 'customer')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => {
                  const customerPurchases = getPurchasesByCustomerId(customer.id);
                  const totalSpent = customerPurchases.reduce((sum, p) => sum + p.price, 0);
                  
                  return (
                    <div
                      key={customer.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="text-brand-blue hover:text-brand-blue-dark text-sm font-medium"
                          >
                            {language === 'ur' ? 'ترمیم' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            {language === 'ur' ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <span className="mr-2">📞</span>
                          {customer.phone}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <span className="mr-2">📍</span>
                          {customer.address}
                        </div>
                      )}
                      {customer.details && (
                        <div className="text-sm text-gray-500 mt-2">
                          {customer.details}
                        </div>
                      )}
                      {customerPurchases.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            {language === 'ur' ? 'خریداری:' : 'Purchases:'} {customerPurchases.length}
                          </div>
                          <div className="text-sm font-semibold text-green-600">
                            {language === 'ur' ? 'کل:' : 'Total:'} PKR {totalSpent.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <>
          <div className="flex justify-between items-center no-print">
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ur' ? 'فلٹر بذریعہ گاہک' : 'Filter by Customer'}
                </label>
                <select
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="all">{language === 'ur' ? 'تمام گاہک' : 'All Customers'}</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button variant="primary" onClick={handleAddPurchase}>
              {language === 'ur' ? 'نئی خریداری شامل کریں' : 'Add New Purchase'}
            </Button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 no-print">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {filteredPurchases.length === 0
                  ? (language === 'ur' ? 'کوئی خریداری نہیں ملی' : 'No purchases found')
                  : `${filteredPurchases.length} ${language === 'ur' ? 'خریداری ملی' : 'Purchases Found'}`}
              </h2>
            </div>
            
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {language === 'ur' ? 'ابھی تک کوئی خریداری نہیں ہے' : 'No purchases yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ur' ? 'گاہک' : 'Customer'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ur' ? 'مصنوعات' : 'Product'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ur' ? 'مقدار' : 'Quantity'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ur' ? 'قیمت' : 'Price'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ur' ? 'تاریخ' : 'Date'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ur' ? 'عمل' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {getCustomerName(purchase.customerId)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>{purchase.productName}</div>
                          <div className="text-xs text-gray-500">
                            {purchase.productTara}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {purchase.quantityBundles} {language === 'ur' ? 'بنڈل' : 'bundles'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                          PKR {purchase.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {format(new Date(purchase.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeletePurchase(purchase.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              {language === 'ur' ? 'حذف' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Summary */}
            {filteredPurchases.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {language === 'ur' ? 'کل خریداری' : 'Total Purchases'}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      PKR {filteredPurchases.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available Products Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 no-print">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📦 {language === 'ur' ? 'دستیاب مصنوعات' : 'Available Products'}
            </h2>
            {availableProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {language === 'ur' ? 'کوئی مصنوعات اسٹاک میں دستیاب نہیں' : 'No products available in stock'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableProducts.map((production) => {
                  const stock = getStockByName(production.productName);
                  return (
                    <div
                      key={production.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="font-semibold text-gray-900 mb-2">
                        {production.productName}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {production.productTara}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {language === 'ur' ? 'بیچ:' : 'Batch:'} {production.batchId}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <div className="text-sm">
                          <span className="text-gray-500">{language === 'ur' ? 'اسٹاک:' : 'Stock:'}</span>
                          <span className="font-bold text-green-600 ml-1">
                            {stock.bundles} {language === 'ur' ? 'بنڈل' : 'bundles'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Customer Form Modal */}
      <Modal
        isOpen={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false);
          setEditingCustomer(null);
          setFormData({ name: '', phone: '', address: '', details: '' });
        }}
        title={editingCustomer ? t('editCustomer', 'customer') : t('addCustomer', 'customer')}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('name', 'customer')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label={t('phone', 'customer')}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
          />
          <Input
            label={t('address', 'customer')}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={errors.address}
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
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCustomerForm(false);
                setEditingCustomer(null);
                setFormData({ name: '', phone: '', address: '', details: '' });
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

      {/* Purchase Form Modal */}
      <Modal
        isOpen={showPurchaseForm}
        onClose={() => {
          setShowPurchaseForm(false);
          setPurchaseFormData({
            customerId: 0,
            productProductionId: 0,
            quantityBundles: 0,
            price: 0,
            date: format(new Date(), 'yyyy-MM-dd'),
            notes: '',
          });
        }}
        title={language === 'ur' ? 'نئی خریداری شامل کریں' : 'Add New Purchase'}
        size="lg"
      >
        <form onSubmit={handlePurchaseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ur' ? 'گاہک' : 'Customer'} *
            </label>
            <select
              value={purchaseFormData.customerId}
              onChange={(e) => setPurchaseFormData({ ...purchaseFormData, customerId: parseInt(e.target.value) })}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              required
            >
              <option value={0}>{language === 'ur' ? 'گاہک منتخب کریں' : 'Select Customer'}</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && <p className="text-red-600 text-sm mt-1">{errors.customerId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ur' ? 'مصنوعات' : 'Product'} *
            </label>
            <select
              value={purchaseFormData.productProductionId}
              onChange={(e) => {
                const prodId = parseInt(e.target.value);
                setPurchaseFormData({ ...purchaseFormData, productProductionId: prodId });
                setSelectedProductionId(prodId);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              required
            >
              <option value={0}>{language === 'ur' ? 'مصنوعات منتخب کریں' : 'Select Product'}</option>
              {availableProducts.map(production => {
                const stock = getStockByName(production.productName);
                return (
                  <option key={production.id} value={production.id}>
                    {production.productName} - {production.productTara} | {language === 'ur' ? 'اسٹاک' : 'Stock'}: {stock.bundles} {language === 'ur' ? 'بنڈل' : 'bundles'}
                  </option>
                );
              })}
            </select>
            {errors.productProductionId && <p className="text-red-600 text-sm mt-1">{errors.productProductionId}</p>}
          </div>

          {selectedProductionId && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-sm text-gray-700">
                {(() => {
                  const prod = productions.find(p => p.id === selectedProductionId);
                  const stock = prod ? getStockByName(prod.productName) : null;
                  return (
                    <>
                      <div className="font-semibold mb-1">{language === 'ur' ? 'دستیاب اسٹاک' : 'Available Stock'}</div>
                      <div>{stock?.bundles || 0} {language === 'ur' ? 'بنڈل' : 'bundles'}</div>
                      <div>{stock?.foot || 0} {language === 'ur' ? 'فٹ' : 'feet'}</div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <Input
            label={`${language === 'ur' ? 'مقدار (بنڈل)' : 'Quantity (Bundles)'} *`}
            type="number"
            step="0.01"
            value={purchaseFormData.quantityBundles || ''}
            onChange={(e) => setPurchaseFormData({ ...purchaseFormData, quantityBundles: parseFloat(e.target.value) || 0 })}
            error={errors.quantityBundles}
            required
          />

          <Input
            label={`${language === 'ur' ? 'قیمت (PKR)' : 'Price (PKR)'} *`}
            type="number"
            step="0.01"
            value={purchaseFormData.price || ''}
            onChange={(e) => setPurchaseFormData({ ...purchaseFormData, price: parseFloat(e.target.value) || 0 })}
            error={errors.price}
            required
          />

          <Input
            label={`${language === 'ur' ? 'تاریخ' : 'Date'} *`}
            type="date"
            value={purchaseFormData.date}
            onChange={(e) => setPurchaseFormData({ ...purchaseFormData, date: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ur' ? 'نوٹس' : 'Notes'}
            </label>
            <textarea
              value={purchaseFormData.notes}
              onChange={(e) => setPurchaseFormData({ ...purchaseFormData, notes: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowPurchaseForm(false);
                setPurchaseFormData({
                  customerId: 0,
                  productProductionId: 0,
                  quantityBundles: 0,
                  price: 0,
                  date: format(new Date(), 'yyyy-MM-dd'),
                  notes: '',
                });
              }}
            >
              {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary">
              {language === 'ur' ? 'شامل کریں' : 'Add Purchase'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Print Views - Only visible when printing */}
      <div className="print-view" style={{ display: 'none' }}>
        {activeTab === 'customers' && <CustomerPrintView customers={customers} />}
        {activeTab === 'purchases' && printingPurchase && (() => {
          const purchase = purchases.find(p => p.id === printingPurchase.purchaseId);
          const customer = customers.find(c => c.id === printingPurchase.customerId);
          return purchase && <PurchaseInvoiceView purchase={purchase} customer={customer} />;
        })()}
      </div>
    </div>
  );
}
