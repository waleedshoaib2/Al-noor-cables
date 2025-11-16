import { useState, useMemo } from 'react';
import { useBillStore } from '@/store/useBillStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import { Input } from '@/components/Common/Input';
import BillPrintView from '@/components/Billing/BillPrintView';
import AllBillsPrintView from '@/components/Billing/AllBillsPrintView';
import type { Bill, BillItem } from '@/types';
import { format } from 'date-fns';

export default function Billing() {
  const { t, language } = useTranslation();
  const bills = useBillStore((state) => state.bills);
  const addBill = useBillStore((state) => state.addBill);
  const updateBill = useBillStore((state) => state.updateBill);
  const deleteBill = useBillStore((state) => state.deleteBill);
  const customers = useCustomerStore((state) => state.customers);

  const [activeTab, setActiveTab] = useState<'bills' | 'transactions'>('bills');
  const [showBillForm, setShowBillForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [printingBillId, setPrintingBillId] = useState<number | null>(null);
  const [printingAllBills, setPrintingAllBills] = useState(false);
  const [filterCustomerName, setFilterCustomerName] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [billFormData, setBillFormData] = useState({
    billNumber: '',
    customerName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    address: 'Bahtar Mor Small Industry Wah Cantt',
    items: [] as BillItem[],
  });

  // Initialize with one empty row
  const initializeBillForm = () => {
    setBillFormData({
      billNumber: `No.${String(bills.length + 1).padStart(3, '0')}`,
      customerName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      address: 'Bahtar Mor Small Industry Wah Cantt',
      items: [
        {
          bundle: 0,
          name: '',
          wire: '',
          feet: 0,
          totalFeet: 0,
          price: 0,
        },
      ],
    });
  };

  // Print handler
  const handlePrint = (billId: number) => {
    setPrintingBillId(billId);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setPrintingBillId(null);
      }, 100);
    }, 100);
  };

  // Print all bills handler
  const handlePrintAll = () => {
    setPrintingAllBills(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setPrintingAllBills(false);
      }, 100);
    }, 100);
  };

  // Get unique customer names for filter
  const uniqueCustomerNames = useMemo(() => {
    const names = new Set(bills.map(b => b.customerName));
    return Array.from(names).sort();
  }, [bills]);

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      // Filter by customer name
      if (filterCustomerName !== 'all') {
        if (bill.customerName !== filterCustomerName) {
          return false;
        }
      }

      // Filter by date range
      if (filterStartDate) {
        const billDate = new Date(bill.date);
        const startDate = new Date(filterStartDate);
        startDate.setHours(0, 0, 0, 0);
        if (billDate < startDate) {
          return false;
        }
      }

      if (filterEndDate) {
        const billDate = new Date(bill.date);
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (billDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [bills, filterCustomerName, filterStartDate, filterEndDate]);

  const handleAddBill = () => {
    initializeBillForm();
    setEditingBill(null);
    setShowBillForm(true);
  };

  const handleEditBill = (bill: Bill) => {
    setBillFormData({
      billNumber: bill.billNumber,
      customerName: bill.customerName,
      date: format(new Date(bill.date), 'yyyy-MM-dd'),
      address: bill.address || '',
      items: bill.items.length > 0 ? bill.items : [
        {
          bundle: 0,
          name: '',
          wire: '',
          feet: 0,
          totalFeet: 0,
          price: 0,
        },
      ],
    });
    setEditingBill(bill);
    setShowBillForm(true);
  };

  const handleAddRow = () => {
    setBillFormData({
      ...billFormData,
      items: [
        ...billFormData.items,
        {
          bundle: 0,
          name: '',
          wire: '',
          feet: 0,
          totalFeet: 0,
          price: 0,
        },
      ],
    });
  };

  const handleRemoveRow = (index: number) => {
    if (billFormData.items.length > 1) {
      setBillFormData({
        ...billFormData,
        items: billFormData.items.filter((_, i) => i !== index),
      });
    }
  };

  const handleItemChange = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...billFormData.items];
    const currentItem = { ...newItems[index] };
    
    // Update the field
    currentItem[field] = value as never;

    // Only calculate totalFeet = bundle * feet (when bundle or feet changes)
    if (field === 'bundle' || field === 'feet') {
      const bundle = field === 'bundle' ? Number(value) : currentItem.bundle;
      const feet = field === 'feet' ? Number(value) : currentItem.feet;
      currentItem.totalFeet = bundle * feet;
    }

    newItems[index] = currentItem;

    setBillFormData({
      ...billFormData,
      items: newItems,
    });
  };

  const calculateTotal = () => {
    return billFormData.items.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const handleSubmitBill = () => {
    if (!billFormData.customerName.trim()) {
      alert(language === 'ur' ? 'براہ کرم گاہک کا نام درج کریں' : 'Please enter customer name');
      return;
    }

    const total = calculateTotal();
    const billData = {
      billNumber: billFormData.billNumber,
      customerName: billFormData.customerName,
      date: new Date(billFormData.date),
      items: billFormData.items,
      total,
      address: billFormData.address,
    };

    if (editingBill) {
      updateBill(editingBill.id, billData);
    } else {
      addBill(billData);
    }

    setShowBillForm(false);
    setEditingBill(null);
    initializeBillForm();
  };

  const handleDeleteBill = (id: number) => {
    if (confirm(language === 'ur' ? 'کیا آپ واقعی اس بل کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this bill?')) {
      deleteBill(id);
    }
  };

  // Group bills by customer and calculate totals for transactions
  const customerTransactions = useMemo(() => {
    const grouped = bills.reduce((acc, bill) => {
      const customerName = bill.customerName;
      if (!acc[customerName]) {
        acc[customerName] = {
          customerName,
          totalPrice: 0,
          billCount: 0,
          latestDate: bill.date,
          bills: [],
        };
      }
      acc[customerName].totalPrice += bill.total;
      acc[customerName].billCount += 1;
      acc[customerName].bills.push(bill);
      // Update latest date
      if (new Date(bill.date) > new Date(acc[customerName].latestDate)) {
        acc[customerName].latestDate = bill.date;
      }
      return acc;
    }, {} as Record<string, {
      customerName: string;
      totalPrice: number;
      billCount: number;
      latestDate: Date;
      bills: Bill[];
    }>);
    
    return Object.values(grouped).sort((a, b) => 
      new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
    );
  }, [bills]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'ur' ? 'بلنگ' : 'Billing'}
        </h1>
        {activeTab === 'bills' && (
          <div className="flex gap-2">
            {bills.length > 0 && (
              <Button variant="secondary" onClick={handlePrintAll}>
                🖨️ {language === 'ur' ? 'تمام بلز پرنٹ کریں' : 'Print All Sales'}
              </Button>
            )}
            <Button variant="primary" onClick={handleAddBill}>
              {language === 'ur' ? 'نیا بل شامل کریں' : 'Add New Bill'}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('bills')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bills'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {language === 'ur' ? 'بلز' : 'Bills'}
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {language === 'ur' ? 'لین دین' : 'Transactions'}
          </button>
        </nav>
      </div>

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div className="mt-6">
          {/* Filters Section */}
          {bills.length > 0 && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                {language === 'ur' ? 'فلٹرز' : 'Filters'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {(filterCustomerName !== 'all' || filterStartDate || filterEndDate) && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFilterCustomerName('all');
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
          )}

          {bills.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg">
                {language === 'ur' ? 'کوئی بل نہیں ملا' : 'No bills found'}
              </p>
              <Button variant="primary" onClick={handleAddBill} className="mt-4">
                {language === 'ur' ? 'پہلا بل شامل کریں' : 'Add First Bill'}
              </Button>
            </div>
          ) : (
            <>
              {filteredBills.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-500 text-lg">
                    {language === 'ur' ? 'فلٹر کے مطابق کوئی بل نہیں ملا' : 'No bills found matching filters'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {language === 'ur' 
                        ? `${filteredBills.length} ${filteredBills.length === 1 ? 'بل ملا' : 'بلز ملے'}`
                        : `${filteredBills.length} ${filteredBills.length === 1 ? 'bill found' : 'bills found'}`}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'ur' ? 'بل نمبر' : 'Bill No.'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'ur' ? 'گاہک کا نام' : 'Customer Name'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'ur' ? 'تاریخ' : 'Date'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'ur' ? 'آئٹمز' : 'Items'}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'ur' ? 'کل' : 'Total'}
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'ur' ? 'اعمال' : 'Actions'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredBills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {bill.billNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {bill.customerName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(bill.date), 'dd/MM/yyyy')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {bill.items.length} {language === 'ur' ? 'آئٹمز' : 'items'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                {bill.total.toLocaleString()} {language === 'ur' ? 'روپے' : 'PKR'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                <button
                                  onClick={() => handlePrint(bill.id)}
                                  className="text-green-600 hover:text-green-800 mr-4"
                                >
                                  {language === 'ur' ? 'پرنٹ' : 'Print'}
                                </button>
                                <button
                                  onClick={() => handleEditBill(bill)}
                                  className="text-brand-blue hover:text-brand-blue-dark mr-4"
                                >
                                  {language === 'ur' ? 'ترمیم' : 'Edit'}
                                </button>
                                <button
                                  onClick={() => handleDeleteBill(bill.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  {language === 'ur' ? 'حذف' : 'Delete'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {language === 'ur' 
                ? `${customerTransactions.length} ${customerTransactions.length === 1 ? 'گاہک' : 'گاہکوں'} کی لین دین` 
                : `${customerTransactions.length} ${customerTransactions.length === 1 ? 'Customer' : 'Customers'} Transactions`}
            </p>
          </div>
          {customerTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">
                {language === 'ur' 
                  ? 'کوئی لین دین نہیں ملی' 
                  : 'No transactions found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customerTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {transaction.customerName}
                      </h3>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'ur' ? 'کل قیمت' : 'Total Price'}
                      </p>
                      <p className="text-xl font-bold text-brand-orange">
                        {transaction.totalPrice.toLocaleString()} {language === 'ur' ? 'روپے' : 'PKR'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'ur' ? 'تاریخ' : 'Date'}
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {format(new Date(transaction.latestDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-400">
                        {language === 'ur' 
                          ? `${transaction.billCount} ${transaction.billCount === 1 ? 'بل' : 'بلز'}`
                          : `${transaction.billCount} ${transaction.billCount === 1 ? 'Bill' : 'Bills'}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bill Form Modal */}
      <Modal
        isOpen={showBillForm}
        onClose={() => {
          setShowBillForm(false);
          setEditingBill(null);
          initializeBillForm();
        }}
        title={language === 'ur' ? (editingBill ? 'بل میں ترمیم کریں' : 'نیا بل شامل کریں') : (editingBill ? 'Edit Bill' : 'Add New Bill')}
        size="xl"
      >
        <div className="space-y-4">
          {/* Header Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={language === 'ur' ? 'بل نمبر' : 'Bill Number'}
              value={billFormData.billNumber}
              onChange={(e) => setBillFormData({ ...billFormData, billNumber: e.target.value })}
            />
            <Input
              label={language === 'ur' ? 'تاریخ' : 'Date'}
              type="date"
              value={billFormData.date}
              onChange={(e) => setBillFormData({ ...billFormData, date: e.target.value })}
            />
          </div>

          <Input
            label={language === 'ur' ? 'گاہک کا نام' : 'Customer Name'}
            value={billFormData.customerName}
            onChange={(e) => setBillFormData({ ...billFormData, customerName: e.target.value })}
            list="customers-list"
          />
          <datalist id="customers-list">
            {customers.map((customer) => (
              <option key={customer.id} value={customer.name} />
            ))}
          </datalist>

          <Input
            label={language === 'ur' ? 'پتہ' : 'Address'}
            value={billFormData.address}
            onChange={(e) => setBillFormData({ ...billFormData, address: e.target.value })}
          />

          {/* Bill Items Table */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'ur' ? 'بل آئٹمز' : 'Bill Items'}
              </h3>
              <Button variant="secondary" onClick={handleAddRow} size="sm">
                {language === 'ur' ? 'قطار شامل کریں' : 'Add Row'}
              </Button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-brand-orange">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase">
                      {language === 'ur' ? 'بنڈل' : 'Bundle'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase">
                      {language === 'ur' ? 'نام (mm)' : 'Name (mm)'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase">
                      {language === 'ur' ? 'تار' : 'Wire'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase">
                      {language === 'ur' ? 'فٹ' : 'Feet'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase bg-green-600">
                      {language === 'ur' ? 'توتل فت' : 'Total Feet'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase">
                      {language === 'ur' ? 'قیمت' : 'Price'}
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-white uppercase">
                      {language === 'ur' ? 'اعمال' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billFormData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          value={item.bundle || ''}
                          onChange={(e) => handleItemChange(index, 'bundle', Number(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          placeholder="20 mm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          value={item.wire}
                          onChange={(e) => handleItemChange(index, 'wire', e.target.value)}
                          placeholder="180 تارا و تمبر"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          value={item.feet || ''}
                          onChange={(e) => handleItemChange(index, 'feet', Number(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-3 py-2 bg-green-50">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-green-50"
                          value={item.totalFeet || ''}
                          readOnly
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          value={item.price || ''}
                          onChange={(e) => handleItemChange(index, 'price', Number(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        {billFormData.items.length > 1 && (
                          <button
                            onClick={() => handleRemoveRow(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            {language === 'ur' ? 'حذف' : 'Remove'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right font-semibold text-gray-900">
                      {language === 'ur' ? 'کل' : 'Total'}:
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-full border-2 border-gray-400 rounded px-2 py-1 text-sm font-bold bg-gray-100"
                        value={calculateTotal()}
                        readOnly
                      />
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setShowBillForm(false);
                setEditingBill(null);
                initializeBillForm();
              }}
            >
              {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
            </Button>
            <Button variant="primary" onClick={handleSubmitBill}>
              {language === 'ur' ? 'محفوظ کریں' : 'Save Bill'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Print View - Only visible when printing */}
      {printingBillId ? (
        (() => {
          const bill = bills.find((b) => b.id === printingBillId);
          return bill ? (
            <div className="print-view" style={{ display: 'none' }}>
              <BillPrintView bill={bill} />
            </div>
          ) : null;
        })()
      ) : null}
      
      {/* Print All Bills View - Only visible when printing */}
      {printingAllBills && (
        <div className="print-view" style={{ display: 'none' }}>
          <AllBillsPrintView bills={bills} />
        </div>
      )}
    </div>
  );
}

