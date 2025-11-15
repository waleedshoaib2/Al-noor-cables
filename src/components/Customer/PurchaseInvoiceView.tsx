import { useTranslation } from '@/hooks/useTranslation';
import { useProductStore } from '@/store/useProductStore';
import type { CustomerPurchase, Customer } from '@/types';
import { format } from 'date-fns';

interface PurchaseInvoiceViewProps {
  purchase: CustomerPurchase;
  customer: Customer | undefined;
  invoiceNumber?: string;
}

export default function PurchaseInvoiceView({ purchase, customer, invoiceNumber }: PurchaseInvoiceViewProps) {
  const { t, language } = useTranslation();
  const productions = useProductStore((state) => state.productions);
  
  // Get the product production to find feet per bundle
  const production = productions.find((p) => p.id === purchase.productProductionId);
  const feetPerBundle = production && production.quantityBundles > 0 
    ? production.quantityFoot / production.quantityBundles 
    : 0;
  
  const totalFeet = feetPerBundle * purchase.quantityBundles;
  const ratePerFoot = totalFeet > 0 ? purchase.price / totalFeet : 0;
  
  const formattedDate = format(new Date(purchase.date), 'dd/MM/yyyy');
  const invoiceNum = invoiceNumber || `No.${String(purchase.id).padStart(3, '0')}`;

  return (
    <div className="print-view p-8" style={{ pageBreakAfter: 'always' }}>
      {/* Header */}
      <div className="mb-6" dir="rtl">
        <div className="flex justify-between items-start mb-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-2">{invoiceNum}</div>
            <div className="text-sm text-gray-700">
              {language === 'ur' ? 'تاریخ:' : 'Date:'} {formattedDate}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
              النور كيبل هاؤس
            </div>
            <div className="text-sm text-gray-700">
              {language === 'ur' ? 'نام خریدار' : 'Customer Name'}
            </div>
          </div>
        </div>
        
        {/* Customer Name - Centered */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-gray-900 py-2">
            {customer?.name || 'Unknown Customer'}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border-2 border-gray-800" dir="rtl">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900">
                {language === 'ur' ? 'بنڈل' : 'Bundle'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900">
                {language === 'ur' ? 'نام' : 'Name'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900">
                {language === 'ur' ? 'تار' : 'Wire'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900">
                {language === 'ur' ? 'فٹ' : 'Feet'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900">
                {language === 'ur' ? 'توتل فت' : 'Total Feet'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900">
                {language === 'ur' ? 'ریت' : 'Rate'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900">
                {language === 'ur' ? 'رویے' : 'Bill'}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                {purchase.quantityBundles.toFixed(0)}
              </td>
              <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                {purchase.productName}
              </td>
              <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                {purchase.productTara || '-'}
              </td>
              <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                {feetPerBundle > 0 ? Math.round(feetPerBundle).toLocaleString() : '-'}
              </td>
              <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                {totalFeet > 0 ? Math.round(totalFeet).toLocaleString() : '-'}
              </td>
              <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                {ratePerFoot > 0 ? Math.round(ratePerFoot).toLocaleString() : '-'}
              </td>
              <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                {Math.round(purchase.price).toLocaleString()}
              </td>
            </tr>
            {/* Empty rows for spacing */}
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index}>
                <td className="border-2 border-gray-800 px-4 py-2"></td>
                <td className="border-2 border-gray-800 px-4 py-2"></td>
                <td className="border-2 border-gray-800 px-4 py-2"></td>
                <td className="border-2 border-gray-800 px-4 py-2"></td>
                <td className="border-2 border-gray-800 px-4 py-2"></td>
                <td className="border-2 border-gray-800 px-4 py-2"></td>
                <td className="border-2 border-gray-800 px-4 py-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6" dir="rtl">
        <div className="text-lg font-bold text-gray-900">
          {language === 'ur' ? 'توتل :' : 'Total:'} {Math.round(purchase.price).toLocaleString()}
        </div>
        <div className="text-sm text-gray-700">
          {language === 'ur' ? 'بابتر موڑ سمال انڈسٹری واہ کینٹ' : 'Babtar Mor Small Industry Wah Cantt'}
        </div>
      </div>
    </div>
  );
}

