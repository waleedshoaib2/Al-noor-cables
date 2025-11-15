import { formatDate } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import type { CustomerPurchase, Customer } from '@/types';

interface PurchasePrintViewProps {
  purchases: CustomerPurchase[];
  customers: Customer[];
  filters?: {
    customerName?: string;
    productName?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default function PurchasePrintView({ purchases, customers, filters }: PurchasePrintViewProps) {
  const { t, language } = useTranslation();
  const printDate = new Date().toLocaleString();

  // Calculate totals
  const totalBundles = purchases.reduce((sum, p) => sum + p.quantityBundles, 0);
  const totalPrice = purchases.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="print-view p-8">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-800 pb-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Al Noor Cables</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          {language === 'ur' ? 'خریداری/لین دین کی رپورٹ' : 'Purchases/Transactions Report'}
        </h2>
        <div className="text-sm text-gray-600 mt-2">
          {language === 'ur' ? 'پرنٹ کی تاریخ:' : 'Printed on:'} {printDate}
        </div>
        {filters && (
          <div className="text-sm text-gray-600 mt-2">
            {filters.customerName && (
              <span>
                {language === 'ur' ? 'گاہک:' : 'Customer:'} {filters.customerName} |{' '}
              </span>
            )}
            {filters.productName && (
              <span>
                {language === 'ur' ? 'مصنوعات:' : 'Product:'} {filters.productName} |{' '}
              </span>
            )}
            {filters.startDate && (
              <span>
                {language === 'ur' ? 'سے:' : 'From:'} {new Date(filters.startDate).toLocaleDateString()} |{' '}
              </span>
            )}
            {filters.endDate && (
              <span>
                {language === 'ur' ? 'تک:' : 'To:'} {new Date(filters.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل خریداری' : 'Total Purchases'}
          </div>
          <div className="text-xl font-bold text-gray-900">{purchases.length}</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل بنڈلز' : 'Total Bundles'}
          </div>
          <div className="text-xl font-bold text-gray-900">{Math.round(totalBundles)}</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل قیمت' : 'Total Price'}
          </div>
          <div className="text-xl font-bold text-gray-900">{Math.round(totalPrice).toLocaleString()} PKR</div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {language === 'ur' ? 'خریداری کی تفصیلات' : 'Purchase Details'}
        </h3>
        <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'گاہک' : 'Customer'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'نام' : 'Name'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'نمبر' : 'Number'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'تارا' : 'Tara'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'مقدار (بنڈلز)' : 'Quantity (Bundles)'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'قیمت' : 'Price'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'تاریخ' : 'Date'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'نوٹس' : 'Notes'}
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase, index) => {
              const customer = customers.find((c) => c.id === purchase.customerId);
              return (
                <tr key={purchase.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {customer?.name || 'Unknown'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {purchase.productName}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {purchase.productNumber || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {purchase.productTara || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {purchase.quantityBundles.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {purchase.price > 0 ? Math.round(purchase.price).toLocaleString() : '-'} PKR
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {formatDate(purchase.date)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {purchase.notes || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={4} className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {language === 'ur' ? 'کل:' : 'Total:'}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {Math.round(totalBundles).toFixed(2)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {Math.round(totalPrice).toLocaleString()} PKR
              </td>
              <td colSpan={2} className="border border-gray-300 px-3 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <p>Al Noor Cables - {language === 'ur' ? 'خریداری/لین دین کی رپورٹ' : 'Purchases/Transactions Report'}</p>
        <p>{language === 'ur' ? 'تاریخ پیدائش:' : 'Generated on'} {printDate}</p>
      </div>
    </div>
  );
}

