import { useState } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import { Input } from '@/components/Common/Input';
import type { Customer } from '@/types';

export default function Customers() {
  const { t, language } = useTranslation();
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const customers = useCustomerStore((state) => state.customers);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    details: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
          <Button variant="primary" onClick={handleAddCustomer}>
            {t('addCustomer', 'customer')}
          </Button>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {customers.length === 0
            ? t('noCustomersFound', 'customer')
            : `${customers.length} ${t('customersFound', 'customer')}`}
        </h2>
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
    </div>
  );
}

