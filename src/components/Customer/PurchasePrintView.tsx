import { formatDate } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import { useProductStore } from '@/store/useProductStore';
import type { CustomerPurchase, Customer } from '@/types';
import { format } from 'date-fns';

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
  const productions = useProductStore((state) => state.productions);
  const printDate = new Date().toLocaleString();

  // Calculate totals
  const totalBundles = purchases.reduce((sum, p) => sum + p.quantityBundles, 0);
  const totalPrice = purchases.reduce((sum, p) => sum + p.price, 0);
  
  // Calculate total feet and get purchase details
  const purchasesWithDetails = purchases.map((purchase) => {
    const production = productions.find((p) => p.id === purchase.productProductionId);
    const feetPerBundle = production && production.quantityBundles > 0 
      ? production.quantityFoot / production.quantityBundles 
      : 0;
    const totalFeet = feetPerBundle * purchase.quantityBundles;
    const ratePerFoot = totalFeet > 0 ? purchase.price / totalFeet : 0;
    return {
      ...purchase,
      feetPerBundle,
      totalFeet,
      ratePerFoot,
    };
  });
  
  const totalFeet = purchasesWithDetails.reduce((sum, p) => sum + p.totalFeet, 0);

  // Group purchases by customer - each customer gets their own invoice
  const purchasesByCustomer = purchasesWithDetails.reduce((acc, purchase) => {
    const customer = customers.find((c) => c.id === purchase.customerId);
    const customerId = purchase.customerId;
    if (!acc[customerId]) {
      acc[customerId] = {
        customer,
        purchases: [],
        totalPrice: 0,
        totalBundles: 0,
        totalFeet: 0,
      };
    }
    acc[customerId].purchases.push(purchase);
    acc[customerId].totalPrice += purchase.price;
    acc[customerId].totalBundles += purchase.quantityBundles;
    acc[customerId].totalFeet += purchase.totalFeet;
    return acc;
  }, {} as Record<number, { customer: Customer | undefined; purchases: typeof purchasesWithDetails; totalPrice: number; totalBundles: number; totalFeet: number }>);

  // Get the most recent purchase date for invoice date
  const invoiceDate = purchases.length > 0 
    ? format(new Date(Math.max(...purchases.map(p => new Date(p.date).getTime()))), 'dd/MM/yyyy')
    : format(new Date(), 'dd/MM/yyyy');

  return (
    <div className="print-view" style={{ fontFamily: 'Arial, sans-serif' }}>
      {Object.entries(purchasesByCustomer).map(([customerId, customerData], customerIndex) => {
        const invoiceNumber = `No.${String(customerData.purchases[0]?.id || customerId).padStart(3, '0')}`;
        return (
          <div key={customerId} className="p-8" style={{ pageBreakAfter: customerIndex < Object.keys(purchasesByCustomer).length - 1 ? 'always' : 'auto' }}>
            {/* Header */}
            <div className="mb-6" dir="rtl">
              <div className="flex justify-between items-start mb-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-2">{invoiceNumber}</div>
                  <div className="text-sm text-gray-700">
                    {language === 'ur' ? 'تاریخ:' : 'Date:'} {invoiceDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '1px' }}>
                    النور كيبل هاؤس
                  </div>
                  <div className="text-sm text-gray-700">
                    {language === 'ur' ? 'نام خریدار' : 'Customer Name'}
                  </div>
                </div>
              </div>
              
              {/* Customer Name - Centered */}
              <div className="text-center mb-6 mt-4">
                <div className="text-2xl font-bold text-gray-900 py-2">
                  {customerData.customer?.name || 'Unknown Customer'}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mb-6">
              <table className="w-full border-collapse border-2 border-gray-800" dir="rtl" style={{ borderSpacing: 0 }}>
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
                  {customerData.purchases.map((purchase, index) => (
                    <tr key={purchase.id}>
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
                        {purchase.feetPerBundle > 0 ? Math.round(purchase.feetPerBundle).toLocaleString() : '-'}
                      </td>
                      <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                        {purchase.totalFeet > 0 ? Math.round(purchase.totalFeet).toLocaleString() : '-'}
                      </td>
                      <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                        {purchase.ratePerFoot > 0 ? Math.round(purchase.ratePerFoot).toLocaleString() : '-'}
                      </td>
                      <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                        {Math.round(purchase.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* Empty rows for spacing */}
                  {customerData.purchases.length < 10 && Array.from({ length: 10 - customerData.purchases.length }).map((_, index) => (
                    <tr key={`empty-${index}`}>
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
                {language === 'ur' ? 'توتل :' : 'Total:'} {Math.round(customerData.totalPrice).toLocaleString()}
              </div>
              <div className="text-sm text-gray-700">
                {language === 'ur' ? 'بابتر موڑ سمال انڈسٹری واہ کینٹ' : 'Babtar Mor Small Industry Wah Cantt'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

