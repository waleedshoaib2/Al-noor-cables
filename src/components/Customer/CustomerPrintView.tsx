import { useTranslation } from '@/hooks/useTranslation';
import type { Customer } from '@/types';

interface CustomerPrintViewProps {
  customers: Customer[];
}

export default function CustomerPrintView({ customers }: CustomerPrintViewProps) {
  const { t, language } = useTranslation();
  const printDate = new Date().toLocaleString();

  return (
    <div className="print-view p-8">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-800 pb-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Al Noor Cables</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          {language === 'ur' ? 'گاہکوں کی رپورٹ' : 'Customers Report'}
        </h2>
        <div className="text-sm text-gray-600 mt-2">
          {language === 'ur' ? 'پرنٹ کی تاریخ:' : 'Printed on:'} {printDate}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <div className="border border-gray-300 p-3 inline-block">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل گاہک' : 'Total Customers'}
          </div>
          <div className="text-xl font-bold text-gray-900">{customers.length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {language === 'ur' ? 'گاہکوں کی تفصیلات' : 'Customer Details'}
        </h3>
        <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'نام' : 'Name'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'فون' : 'Phone'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'پتہ' : 'Address'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'تفصیلات' : 'Details'}
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {customer.name}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {customer.phone || '-'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {customer.address || '-'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {customer.details || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <p>Al Noor Cables - {language === 'ur' ? 'گاہکوں کی رپورٹ' : 'Customers Report'}</p>
        <p>{language === 'ur' ? 'تاریخ پیدائش:' : 'Generated on'} {printDate}</p>
      </div>
    </div>
  );
}

