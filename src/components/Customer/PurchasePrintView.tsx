import { formatDate } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import { useProductStore } from '@/store/useProductStore';
import type { CustomerPurchase, Customer } from '@/types';
import { format } from 'date-fns';

// Helper function to convert number to words
function numberToWords(num: number): string {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  
  if (num === 0) return 'ZERO';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return ones[hundred] + ' HUNDRED' + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 100000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return numberToWords(thousand) + ' THOUSAND' + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 10000000) {
    const lakh = Math.floor(num / 100000);
    const remainder = num % 100000;
    return numberToWords(lakh) + ' LAKH' + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  return num.toString();
}

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

  // Ensure we have purchases to display
  if (!purchases || purchases.length === 0) {
    return (
      <div className="print-view p-10">
        <p className="text-center text-gray-600">
          {language === 'ur' ? 'کوئی خریداری نہیں ملی' : 'No purchases found'}
        </p>
      </div>
    );
  }

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

  return (
    <div className="print-view" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff' }}>
      {Object.entries(purchasesByCustomer).map(([customerId, customerData], customerIndex) => {
        const firstPurchase = customerData.purchases[0];
        const invoiceDate = firstPurchase ? new Date(firstPurchase.date) : new Date();
        const formattedDate = format(invoiceDate, 'MMM dd, yyyy');
        const invoiceNumber = `2024-ALN-${String(firstPurchase?.id || customerId).padStart(4, '0')}`;
        const totalAmount = Math.round(customerData.totalPrice);
        const amountInWords = numberToWords(Math.floor(totalAmount)) + ' RUPEES ONLY';

        return (
          <div key={customerId} className="p-10" style={{ pageBreakAfter: customerIndex < Object.keys(purchasesByCustomer).length - 1 ? 'always' : 'auto' }}>
            {/* Header */}
            <div className="mb-8 pb-6 border-b-2 border-black">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2 text-black">
                    {language === 'ur' ? 'بل' : 'Work Order Invoice'}
                  </h1>
                  <p className="text-3xl text-black font-bold">Al Noor Cables</p>
                </div>
                <div className="text-right" style={{ minWidth: '200px' }}>
                  <div className="bg-gray-50 p-4 rounded-lg border border-black">
                    <div className="text-xs font-bold text-black uppercase mb-2">
                      {language === 'ur' ? 'بل نمبر' : 'Invoice Number'}
                    </div>
                    <div className="text-lg font-bold text-black">#{invoiceNumber}</div>
                    <div className="text-xs font-bold text-black uppercase mt-3 mb-1">
                      {language === 'ur' ? 'بل کی تاریخ' : 'Invoice Date'}
                    </div>
                    <div className="text-sm text-black font-bold">{formattedDate}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billed By / Billed To Sections */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Billed By */}
              <div className="p-5 rounded-lg border-2 border-black bg-white">
                <h3 className="text-lg font-bold mb-3 text-black">
                  {language === 'ur' ? 'بل دینے والا' : 'Billed By'}
                </h3>
                <div className="text-sm text-black space-y-1">
                  <p className="font-bold">Al Noor Cables</p>
                  <p className="font-bold">Bahatar Mor</p>
                  <p className="font-bold">Wah Cantt, Pakistan</p>
                  <p className="mt-3 text-xs font-bold">
                    {language === 'ur' ? 'فون:' : 'Phone:'} +92 319 3374381
                  </p>
                </div>
              </div>

              {/* Billed To */}
              <div className="p-5 rounded-lg border-2 border-black bg-white">
                <h3 className="text-lg font-bold mb-3 text-black">
                  {language === 'ur' ? 'بل وصول کنندہ' : 'Billed To'}
                </h3>
                <div className="text-sm text-black space-y-1">
                  <p className="font-bold">{customerData.customer?.name || 'Unknown Customer'}</p>
                  {customerData.customer?.address && <p className="font-bold">{customerData.customer.address}</p>}
                  {customerData.customer?.phone && (
                    <p className="mt-3 text-xs font-bold">
                      {language === 'ur' ? 'فون:' : 'Phone:'} {customerData.customer.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="mb-8">
              <table className="w-full border-collapse border-2 border-black" style={{ borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-black border-2 border-black">
                      {language === 'ur' ? 'آئٹم' : 'Item'}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-black border-2 border-black">
                      {language === 'ur' ? 'مقدار' : 'Quantity'}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-black border-2 border-black">
                      {language === 'ur' ? 'ریٹ' : 'Rate'}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-black border-2 border-black">
                      {language === 'ur' ? 'رقم' : 'Amount'}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-black border-2 border-black">
                      {language === 'ur' ? 'کل' : 'Total'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-4 py-3 text-sm text-black border-2 border-black">
                        <div className="font-bold">{purchase.productName}</div>
                        <div className="text-xs font-bold mt-1">
                          {language === 'ur' ? 'تار:' : 'Wire:'} {purchase.productTara || '-'} | {language === 'ur' ? 'فٹ:' : 'Feet:'} {purchase.totalFeet > 0 ? Math.round(purchase.totalFeet).toLocaleString() : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-black text-center border-2 border-black font-bold">
                        {purchase.quantityBundles.toFixed(0)} {language === 'ur' ? 'بنڈل' : 'bundles'}
                      </td>
                      <td className="px-4 py-3 text-sm text-black text-right border-2 border-black font-bold">
                        {purchase.ratePerFoot > 0 ? `PKR ${Math.round(purchase.ratePerFoot).toLocaleString()}/${language === 'ur' ? 'فٹ' : 'ft'}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-black text-right border-2 border-black font-bold">
                        PKR {Math.round(purchase.price).toLocaleString()}.00
                      </td>
                      <td className="px-4 py-3 text-sm text-black text-right border-2 border-black font-bold">
                        PKR {Math.round(purchase.price).toLocaleString()}.00
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-sm font-bold text-black border-2 border-black">
                      {language === 'ur' ? 'کل' : 'Total'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-black text-right border-2 border-black">
                      PKR {totalAmount.toLocaleString()}.00
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-black text-right border-2 border-black">
                      PKR {totalAmount.toLocaleString()}.00
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary Section */}
            <div className="mb-6">
              <p className="text-sm text-black mb-2 font-bold">
                <span className="font-bold">{language === 'ur' ? 'کل (الفاظ میں):' : 'Total (in words):'}</span>{' '}
                <span className="uppercase font-bold">{amountInWords}</span>
              </p>
            </div>

            {/* Final Total */}
            <div className="border-t-2 border-black pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-black">
                  {language === 'ur' ? 'کل (PKR)' : 'Total (PKR)'}
                </span>
                <span className="text-2xl font-bold text-black">
                  PKR {totalAmount.toLocaleString()}.00
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-black text-center text-xs text-black font-bold">
              <p>Al Noor Cables - {language === 'ur' ? 'بہاتر موڑ واہ کینٹ' : 'Bahatar Mor Wah Cantt'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

