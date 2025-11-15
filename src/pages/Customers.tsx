import { useState, useEffect, useRef, useMemo } from 'react';
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
import CustomerPrintView from '@/components/Customer/CustomerPrintView';
import PurchasePrintView from '@/components/Customer/PurchasePrintView';
import PurchaseInvoiceView from '@/components/Customer/PurchaseInvoiceView';
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
  const [filterCustomerName, setFilterCustomerName] = useState<string>('all');
  const [filterProductName, setFilterProductName] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [printingInvoiceId, setPrintingInvoiceId] = useState<number | null>(null);
  const reportSectionRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Print invoice handler
  const handlePrintInvoice = (purchaseId: number) => {
    setPrintingInvoiceId(purchaseId);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setPrintingInvoiceId(null);
      }, 100);
    }, 100);
  };

  // Get unique customer names and product names for filters
  const uniqueCustomerNames = useMemo(() => {
    const names = new Set(customers.map(c => c.name));
    return Array.from(names).sort();
  }, [customers]);

  const uniqueProductNames = useMemo(() => {
    const names = new Set(purchases.map(p => p.productName));
    return Array.from(names).sort();
  }, [purchases]);

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      // Filter by customer name
      if (filterCustomerName !== 'all') {
        const customer = customers.find(c => c.id === purchase.customerId);
        if (customer?.name !== filterCustomerName) {
          return false;
        }
      }

      // Filter by product name
      if (filterProductName !== 'all') {
        if (purchase.productName !== filterProductName) {
          return false;
        }
      }

      // Filter by date range
      if (filterStartDate) {
        const purchaseDate = new Date(purchase.date);
        const startDate = new Date(filterStartDate);
        startDate.setHours(0, 0, 0, 0);
        if (purchaseDate < startDate) {
          return false;
        }
      }

      if (filterEndDate) {
        const purchaseDate = new Date(purchase.date);
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (purchaseDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [purchases, customers, filterCustomerName, filterProductName, filterStartDate, filterEndDate]);

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
      <div className="flex justify-between items-center no-print">
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

      {/* Tabs */}
      <div className="border-b border-gray-200 no-print">
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
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-gray-50 rounded-lg p-5 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-150"
                    >
                      {t('edit', 'customer')}
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-150"
                    >
                      {t('delete', 'customer')}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-gray-400">📞</span>
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-gray-400">📍</span>
                      <span>{customer.address}</span>
                    </div>
                  )}
                  {customer.details && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 italic">
                      {customer.details}
                    </div>
                  )}
                </div>
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
        <div id="customers-report-section" ref={reportSectionRef} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 no-print">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredPurchases.length === 0
                ? (language === 'ur' ? 'کوئی خریداری نہیں ملی' : 'No purchases found')
                : `${filteredPurchases.length} ${language === 'ur' ? 'خریداری ملی' : 'Purchases Found'}`}
            </h2>
            {filteredPurchases.length > 0 && (
              <Button variant="secondary" onClick={handlePrint} className="no-print">
                🖨️ {language === 'ur' ? 'پرنٹ' : 'Print'}
              </Button>
            )}
          </div>

          {/* Filters Section */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              {language === 'ur' ? 'فلٹرز' : 'Filters'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Customer Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ur' ? 'گاہک کا نام' : 'Customer Name'}
                </label>
                <select
                  value={filterCustomerName}
                  onChange={(e) => setFilterCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent text-sm"
                >
                  <option value="all">{language === 'ur' ? 'تمام' : 'All'}</option>
                  {uniqueCustomerNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ur' ? 'مصنوعات' : 'Product'}
                </label>
                <select
                  value={filterProductName}
                  onChange={(e) => setFilterProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent text-sm"
                >
                  <option value="all">{language === 'ur' ? 'تمام' : 'All'}</option>
                  {uniqueProductNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ur' ? 'شروع کی تاریخ' : 'Start Date'}
                </label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent text-sm"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ur' ? 'آخر کی تاریخ' : 'End Date'}
                </label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filterCustomerName !== 'all' || filterProductName !== 'all' || filterStartDate || filterEndDate) && (
              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilterCustomerName('all');
                    setFilterProductName('all');
                    setFilterStartDate('');
                    setFilterEndDate('');
                  }}
                  className="text-sm"
                >
                  {language === 'ur' ? 'فلٹرز صاف کریں' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </div>
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{language === 'ur' ? 'کوئی خریداری نہیں ملی' : 'No purchases found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {language === 'ur' ? 'گاہک' : 'Customer'}
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {language === 'ur' ? 'نام' : 'Name'}
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {language === 'ur' ? 'نمبر' : 'Number'}
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {language === 'ur' ? 'تارا' : 'Tara'}
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {language === 'ur' ? 'مقدار (بنڈلز)' : 'Quantity (Bundles)'}
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {language === 'ur' ? 'قیمت' : 'Price'}
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {language === 'ur' ? 'تاریخ' : 'Date'}
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {language === 'ur' ? 'نوٹس' : 'Notes'}
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {language === 'ur' ? 'اعمال' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPurchases.map((purchase) => {
                    const customer = customers.find((c) => c.id === purchase.customerId);
                    return (
                      <tr
                        key={purchase.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {customer?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {purchase.productName}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {purchase.productNumber || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {purchase.productTara || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {purchase.quantityBundles.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {purchase.price > 0 ? Math.round(purchase.price).toLocaleString() : '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {new Date(purchase.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {purchase.notes || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handlePrintInvoice(purchase.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-150"
                              title={language === 'ur' ? 'بل پرنٹ کریں' : 'Print Invoice'}
                            >
                              🖨️
                            </button>
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
                              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-150"
                            >
                              {language === 'ur' ? 'حذف' : 'Delete'}
                            </button>
                          </div>
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

      {/* Print Views - Only visible when printing */}
      {printingInvoiceId ? (
        (() => {
          const purchase = purchases.find((p) => p.id === printingInvoiceId);
          const customer = purchase ? customers.find((c) => c.id === purchase.customerId) : undefined;
          return purchase ? (
            <div className="print-view" style={{ display: 'none' }}>
              <PurchaseInvoiceView 
                purchase={purchase} 
                customer={customer}
                invoiceNumber={`No.${String(purchase.id).padStart(3, '0')}`}
              />
            </div>
          ) : null;
        })()
      ) : (
        <div className="print-view" style={{ display: 'none' }}>
          {activeTab === 'customers' ? (
            <CustomerPrintView customers={customers} />
          ) : (
            <PurchasePrintView 
              purchases={filteredPurchases} 
              customers={customers}
              filters={{
                customerName: filterCustomerName !== 'all' ? filterCustomerName : undefined,
                productName: filterProductName !== 'all' ? filterProductName : undefined,
                startDate: filterStartDate || undefined,
                endDate: filterEndDate || undefined,
              }}
            />
          )}
        </div>
      )}
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
                {language === 'ur' 
                  ? `نام: ${production.productName} - نمبر: ${production.productNumber} - تارا: ${production.productTara} - ${stock.bundles.toFixed(2)} بنڈلز دستیاب`
                  : `Name: ${production.productName} - Number: ${production.productNumber} - Tara: ${production.productTara} - ${stock.bundles.toFixed(2)} bundles available`}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {`${language === 'ur' ? 'مقدار (بنڈلز)' : 'Quantity (Bundles)'} *`}
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={formData.quantityBundles}
          onChange={(e) => {
            // Allow numbers and one decimal point
            const value = e.target.value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = value.split('.');
            const filteredValue = parts.length > 2 
              ? parts[0] + '.' + parts.slice(1).join('')
              : value;
            setFormData({ ...formData, quantityBundles: filteredValue });
          }}
          placeholder="0.00"
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.quantityBundles ? 'border-red-500' : ''
          }`}
        />
        {errors.quantityBundles && (
          <p className="mt-1 text-sm text-red-600">{errors.quantityBundles}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {`${language === 'ur' ? 'قیمت' : 'Price'}`}
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={formData.price}
          onChange={(e) => {
            // Allow numbers and one decimal point
            const value = e.target.value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = value.split('.');
            const filteredValue = parts.length > 2 
              ? parts[0] + '.' + parts.slice(1).join('')
              : value;
            setFormData({ ...formData, price: filteredValue });
          }}
          placeholder="0.00"
          className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors ${
            errors.price ? 'border-red-500' : ''
          }`}
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price}</p>
        )}
      </div>

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

