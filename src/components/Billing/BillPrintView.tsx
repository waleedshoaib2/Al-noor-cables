import type { Bill } from '@/types';
import { format } from 'date-fns';

interface BillPrintViewProps {
  bill: Bill;
}

export default function BillPrintView({ bill }: BillPrintViewProps) {
  const billDate = new Date(bill.date);
  const formattedDate = format(billDate, 'MMM dd, yyyy');

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
      {/* Top Header Bar with Bill Number and Company Name */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 12px', 
        marginBottom: '2px',
        marginTop: '0',
        backgroundColor: '#E6A756',
        border: '2px solid black'
      }}>
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '18px' }}>
          {bill.billNumber}
        </div>
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '20px', direction: 'rtl' }}>
          النور کیبل ہاؤس
        </div>
      </div>

      {/* Second Header Bar with Customer Name and Date */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 12px', 
        marginBottom: '2px',
        backgroundColor: '#B8D7E8',
        border: '2px solid black'
      }}>
        <div style={{ fontSize: '15px', color: '#000' }}>
          تاریخ: {formattedDate}
        </div>
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '18px', flex: 1, textAlign: 'center' }}>
          {bill.customerName}
        </div>
        <div style={{ fontSize: '15px', color: '#000' }}>
          : نام خریدار
        </div>
      </div>

      {/* Table Section Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 0 }}>
        <div style={{ 
          padding: '8px 12px', 
          fontWeight: 'bold', 
          color: '#000', 
          textAlign: 'center',
          fontSize: '18px',
          backgroundColor: '#B8D7E8',
          border: '2px solid black',
          borderBottom: 'none'
        }}>
          رقم
        </div>
        <div style={{ 
          padding: '8px 12px', 
          fontWeight: 'bold', 
          color: '#000', 
          textAlign: 'center',
          fontSize: '18px',
          backgroundColor: '#E6A756',
          border: '2px solid black',
          borderLeft: 'none',
          borderBottom: 'none'
        }}>
          تفصیل
        </div>
      </div>

      {/* Main Table */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        border: '2px solid black'
      }}>
        <thead>
          <tr>
            <th style={{ 
              padding: '4px 8px', 
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000',
              border: '1px solid black',
              textAlign: 'center',
              width: '18%'
            }}>
              رقم
            </th>
            <th style={{ 
              padding: '4px 8px', 
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000',
              border: '1px solid black',
              textAlign: 'center',
              width: '15%'
            }}>
              ٹوٹل فٹ
            </th>
            <th style={{ 
              padding: '4px 8px', 
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000',
              border: '1px solid black',
              textAlign: 'center',
              width: '12%'
            }}>
              فٹ
            </th>
            <th style={{ 
              padding: '4px 8px', 
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000',
              border: '1px solid black',
              textAlign: 'center',
              width: '15%'
            }}>
              تار
            </th>
            <th style={{ 
              padding: '4px 8px', 
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000',
              border: '1px solid black',
              textAlign: 'center',
              width: '15%'
            }}>
              نام
            </th>
            <th style={{ 
              padding: '4px 8px', 
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000',
              border: '1px solid black',
              textAlign: 'center',
              width: '8%'
            }}>
              بنڈل
            </th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={index}>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '15px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff',
                fontWeight: 'bold'
              }}>
                {item.price.toLocaleString()}
              </td>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '15px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff'
              }}>
                {item.totalFeet}
              </td>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '15px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff'
              }}>
                {item.feet}
              </td>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '15px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff',
                direction: 'rtl'
              }}>
                {item.wire}
              </td>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '15px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff'
              }}>
                {item.name}
              </td>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '15px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff'
              }}>
                {item.bundle}
              </td>
            </tr>
          ))}
          {/* Single empty row */}
          <tr>
            <td style={{ padding: '4px 8px', fontSize: '15px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '15px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '15px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '15px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '15px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '15px', border: '1px solid black', height: '24px', backgroundColor: '#fff' }}>&nbsp;</td>
          </tr>
        </tbody>
      </table>

      {/* Total Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 12px',
        backgroundColor: '#E6E6E6',
        border: '2px solid black',
        borderTop: 'none'
      }}>
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '18px' }}>
          {bill.total.toLocaleString()}
        </div>
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '18px', direction: 'rtl' }}>
          :ٹوٹل
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '4px' }}>
        <p style={{ fontSize: '15px', color: '#000', margin: 0 }}>
          {bill.address || 'بلائر موڑ سمال انڈسٹری واہ کینٹ'}
        </p>
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

