import { useTranslation } from '@/hooks/useTranslation';
import { useProductStore } from '@/store/useProductStore';
import type { CustomerPurchase, Customer } from '@/types';
import { format } from 'date-fns';

interface PurchaseInvoiceViewProps {
  purchase: CustomerPurchase;
  customer: Customer | undefined;
  invoiceNumber?: string;
}

// Helper function to convert number to words (simplified version)
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
  
  const invoiceDate = new Date(purchase.date);
  const formattedDate = format(invoiceDate, 'MMM dd, yyyy');
  const invoiceNum = invoiceNumber || `2024-ALN-${String(purchase.id).padStart(4, '0')}`;
  
  const totalAmount = Math.round(purchase.price);
  const amountInWords = numberToWords(Math.floor(totalAmount)) + ' RUPEES ONLY';

  return (
    <div className="print-view" style={{ 
      fontFamily: 'Arial, sans-serif', 
      backgroundColor: '#ffffff', 
      width: '148mm',
      height: '210mm',
      margin: '0 auto',
      padding: '6mm',
      boxSizing: 'border-box'
    }}>
      {/* Top Header Bar with Invoice Number and Company Name */}
      <div className="flex justify-between items-center px-3 py-1" style={{ backgroundColor: '#E6A756', border: '2px solid black', marginBottom: '2px' }}>
        <div className="font-bold text-black" style={{ fontSize: '16px' }}>No.{invoiceNum.replace('2024-ALN-', '')}</div>
        <div className="font-bold text-black" style={{ direction: 'rtl', fontSize: '18px' }}>النور کیبل ہاؤس</div>
      </div>

      {/* Second Header Bar with Customer Name and Date */}
      <div className="flex justify-between items-center px-3 py-1" style={{ backgroundColor: '#B8D7E8', border: '2px solid black', marginBottom: '2px' }}>
        <div className="text-black" style={{ fontSize: '14px' }}>{language === 'ur' ? `تاریخ: ${formattedDate}` : `Date: ${formattedDate}`}</div>
        <div className="font-bold text-black text-center flex-1" style={{ direction: 'rtl', fontSize: '16px' }}>{customer?.name || 'Unknown Customer'}</div>
        <div className="text-black" style={{ fontSize: '14px' }}>{language === 'ur' ? 'نام خریدار:' : 'Customer Name:'}</div>
      </div>

      {/* Table Section Headers */}
      <div className="grid grid-cols-2 gap-0">
        <div className="px-3 py-1 font-bold text-black text-center" style={{ backgroundColor: '#B8D7E8', border: '2px solid black', borderBottom: 'none', fontSize: '16px' }}>
          {language === 'ur' ? 'رقم' : 'Amount'}
        </div>
        <div className="px-3 py-1 font-bold text-black text-center" style={{ backgroundColor: '#E6A756', border: '2px solid black', borderLeft: 'none', borderBottom: 'none', fontSize: '16px' }}>
          {language === 'ur' ? 'تفصیل' : 'Details'}
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full" style={{ borderCollapse: 'collapse', border: '2px solid black' }}>
        <thead>
          <tr>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '8%', fontSize: '14px' }}>
              {language === 'ur' ? 'بنڈل' : 'Bundle'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '15%', fontSize: '14px' }}>
              {language === 'ur' ? 'نام' : 'Name'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '15%', fontSize: '14px' }}>
              {language === 'ur' ? 'تار' : 'Wire'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '12%', fontSize: '14px' }}>
              {language === 'ur' ? 'فٹ' : 'Feet'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '15%', fontSize: '14px' }}>
              {language === 'ur' ? 'ٹوٹل فٹ' : 'Total Ft'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '12%', fontSize: '14px' }}>
              {language === 'ur' ? 'پٹ' : 'Rate'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '18%', fontSize: '14px' }}>
              {language === 'ur' ? 'رقم' : 'Amount'}
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Product Entry */}
          <tr>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', fontSize: '14px' }}>
              {purchase.quantityBundles.toFixed(0)}
            </td>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', fontSize: '14px' }}>
              {purchase.productName}
            </td>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', direction: 'rtl', fontSize: '14px' }}>
              {purchase.productTara || '-'}
            </td>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', fontSize: '14px' }}>
              {feetPerBundle > 0 ? Math.round(feetPerBundle) : '-'}
            </td>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', fontSize: '14px' }}>
              {totalFeet > 0 ? Math.round(totalFeet) : '-'}
            </td>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', fontSize: '14px' }}>
              {ratePerFoot > 0 ? Math.round(ratePerFoot) : '-'}
            </td>
            <td className="px-1 py-1 text-black text-center font-bold" style={{ border: '1px solid black', fontSize: '14px' }}>
              {totalAmount.toLocaleString()}
            </td>
          </tr>
          {/* Single empty row */}
          <tr>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', height: '24px', fontSize: '14px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '14px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '14px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '14px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '14px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '14px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '14px' }}>&nbsp;</td>
          </tr>
        </tbody>
      </table>

      {/* Total Section */}
      <div className="flex justify-between items-center px-3 py-1" style={{ backgroundColor: '#E6E6E6', border: '2px solid black', borderTop: 'none' }}>
        <div className="font-bold text-black" style={{ fontSize: '16px' }}>{totalAmount.toLocaleString()}</div>
        <div className="font-bold text-black" style={{ direction: 'rtl', fontSize: '16px' }}>{language === 'ur' ? ':ٹوٹل' : 'Total:'}</div>
      </div>

      {/* Footer */}
      <div className="text-center" style={{ marginTop: '4px' }}>
        <p className="text-black" style={{ fontSize: '14px' }}>{language === 'ur' ? 'بلائر موڑ سمال انڈسٹری واہ کینٹ' : 'Blair Mor Small Industry Wah Cantt'}</p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print-view {
            width: 148mm !important;
            height: 210mm !important;
            min-height: 210mm !important;
            max-height: 210mm !important;
            padding: 6mm !important;
            margin: 0 !important;
            page-break-after: always;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @page {
          size: A5 portrait;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
