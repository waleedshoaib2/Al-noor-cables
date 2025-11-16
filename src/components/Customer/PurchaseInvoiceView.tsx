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
      padding: '3mm',
      boxSizing: 'border-box'
    }}>
      {/* Top Header Bar with Invoice Number and Company Name */}
      <div className="flex justify-between items-center px-3 py-1" style={{ backgroundColor: '#E6A756', border: '2px solid black', marginBottom: '2px', marginTop: '0' }}>
        <div className="font-bold text-black" style={{ fontSize: '18px' }}>No.{invoiceNum.replace('2024-ALN-', '')}</div>
        <div className="font-bold text-black" style={{ direction: 'rtl', fontSize: '20px' }}>النور کیبل ہاؤس</div>
      </div>

      {/* Second Header Bar with Customer Name and Date */}
      <div className="flex justify-between items-center px-3 py-1" style={{ backgroundColor: '#B8D7E8', border: '2px solid black', marginBottom: '2px' }}>
        <div className="text-black" style={{ fontSize: '15px' }}>{language === 'ur' ? `تاریخ: ${formattedDate}` : `Date: ${formattedDate}`}</div>
        <div className="font-bold text-black text-center flex-1" style={{ direction: 'rtl', fontSize: '18px' }}>{customer?.name || 'Unknown Customer'}</div>
        <div className="text-black" style={{ fontSize: '15px' }}>{language === 'ur' ? 'نام خریدار:' : 'Customer Name:'}</div>
      </div>

      {/* Table Section Headers */}
      <div className="grid grid-cols-2 gap-0">
        <div className="px-3 py-1 font-bold text-black text-center" style={{ backgroundColor: '#B8D7E8', border: '2px solid black', borderBottom: 'none', fontSize: '18px' }}>
          {language === 'ur' ? 'رقم' : 'Amount'}
        </div>
        <div className="px-3 py-1 font-bold text-black text-center" style={{ backgroundColor: '#E6A756', border: '2px solid black', borderLeft: 'none', borderBottom: 'none', fontSize: '18px' }}>
          {language === 'ur' ? 'تفصیل' : 'Details'}
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full" style={{ borderCollapse: 'collapse', border: '2px solid black' }}>
        <thead>
          <tr>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '18%', fontSize: '15px' }}>
              {language === 'ur' ? 'رقم' : 'Amount'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '15%', fontSize: '15px' }}>
              {language === 'ur' ? 'ٹوٹل فٹ' : 'Total Ft'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '12%', fontSize: '15px' }}>
              {language === 'ur' ? 'فٹ' : 'Feet'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '15%', fontSize: '15px' }}>
              {language === 'ur' ? 'تار' : 'Wire'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '15%', fontSize: '15px' }}>
              {language === 'ur' ? 'نام' : 'Name'}
            </th>
            <th className="px-1 py-1 font-bold text-black text-center" style={{ border: '1px solid black', width: '8%', fontSize: '15px' }}>
              {language === 'ur' ? 'بنڈل' : 'Bundle'}
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Product Entry */}
          <tr>
            <td className="px-1 py-1 text-black text-center font-bold" style={{ border: '1px solid black', fontSize: '15px' }}>
              {totalAmount.toLocaleString()}
            </td>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', fontSize: '15px' }}>
              {totalFeet > 0 ? Math.round(totalFeet) : '-'}
            </td>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', fontSize: '15px' }}>
              {feetPerBundle > 0 ? Math.round(feetPerBundle) : '-'}
            </td>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', direction: 'rtl', fontSize: '15px' }}>
              {purchase.productTara || '-'}
            </td>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', fontSize: '15px' }}>
              {purchase.productName}
            </td>
            <td className="px-1 py-1 text-black text-center" style={{ border: '1px solid black', fontSize: '15px' }}>
              {purchase.quantityBundles.toFixed(0)}
            </td>
          </tr>
          {/* Single empty row */}
          <tr>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '15px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '15px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '15px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '15px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', fontSize: '15px' }}>&nbsp;</td>
            <td className="px-1 py-1 text-black" style={{ border: '1px solid black', height: '24px', fontSize: '15px' }}>&nbsp;</td>
          </tr>
        </tbody>
      </table>

      {/* Total Section */}
      <div className="flex justify-between items-center px-3 py-1" style={{ backgroundColor: '#E6E6E6', border: '2px solid black', borderTop: 'none' }}>
        <div className="font-bold text-black" style={{ fontSize: '18px' }}>{totalAmount.toLocaleString()}</div>
        <div className="font-bold text-black" style={{ direction: 'rtl', fontSize: '18px' }}>{language === 'ur' ? ':ٹوٹل' : 'Total:'}</div>
      </div>

      {/* Footer */}
      <div className="text-center" style={{ marginTop: '4px' }}>
        <p className="text-black" style={{ fontSize: '15px' }}>{language === 'ur' ? 'بلائر موڑ سمال انڈسٹری واہ کینٹ' : 'Blair Mor Small Industry Wah Cantt'}</p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            margin: 3mm;
          }
          html, body {
            margin: 0;
            padding: 0;
          }
          .print-view {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            padding: 3mm !important;
            margin: 0 !important;
            page-break-after: always;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @page {
          margin: 3mm;
        }
        
        /* A5 specific */
        @media print and (width: 148mm) and (height: 210mm) {
          @page {
            size: A5 portrait;
            margin: 3mm;
          }
          .print-view {
            padding: 3mm !important;
          }
        }
        
        /* Letter size specific */
        @media print and (width: 8.5in) and (height: 11in) {
          @page {
            size: letter portrait;
            margin: 5mm;
          }
          .print-view {
            padding: 5mm !important;
            max-width: 148mm !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
}
