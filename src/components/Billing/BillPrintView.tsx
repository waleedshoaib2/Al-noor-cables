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
      width: '100%',
      maxWidth: '148mm',
      height: '210mm',
      margin: '0 auto',
      padding: '8mm',
      boxSizing: 'border-box'
    }}>
      {/* Top Header Bar with Bill Number and Company Name */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 12px', 
        marginBottom: '2px',
        backgroundColor: '#E6A756',
        border: '2px solid black'
      }}>
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '14px' }}>
          {bill.billNumber}
        </div>
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '16px', direction: 'rtl' }}>
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
        <div style={{ fontSize: '12px', color: '#000' }}>
          تاریخ: {formattedDate}
        </div>
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '14px', flex: 1, textAlign: 'center' }}>
          {bill.customerName}
        </div>
        <div style={{ fontSize: '12px', color: '#000' }}>
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
          fontSize: '14px',
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
          fontSize: '14px',
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
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#000',
              border: '1px solid black',
              textAlign: 'center',
              width: '8%'
            }}>
              بنڈل
            </th>
            <th style={{ 
              padding: '4px 8px', 
              fontSize: '11px',
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
              fontSize: '11px',
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
              fontSize: '11px',
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
              fontSize: '11px',
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
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#000',
              border: '1px solid black',
              textAlign: 'center',
              width: '12%'
            }}>
              پٹ
            </th>
            <th style={{ 
              padding: '4px 8px', 
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#000',
              border: '1px solid black',
              textAlign: 'center',
              width: '18%'
            }}>
              رقم
            </th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={index}>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '11px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff'
              }}>
                {item.bundle}
              </td>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '11px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff'
              }}>
                {item.name}
              </td>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '11px',
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
                fontSize: '11px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff'
              }}>
                {item.feet}
              </td>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '11px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff'
              }}>
                {item.totalFeet}
              </td>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '11px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff'
              }}>
                {(item.price / item.totalFeet).toFixed(0)}
              </td>
              <td style={{ 
                padding: '4px 8px', 
                fontSize: '11px',
                color: '#000',
                border: '1px solid black',
                textAlign: 'center',
                backgroundColor: '#fff',
                fontWeight: 'bold'
              }}>
                {item.price.toLocaleString()}
              </td>
            </tr>
          ))}
          {/* Single empty row */}
          <tr>
            <td style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid black', height: '24px', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
            <td style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid black', backgroundColor: '#fff' }}>&nbsp;</td>
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
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '14px' }}>
          {bill.total.toLocaleString()}
        </div>
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '14px', direction: 'rtl' }}>
          :ٹوٹل
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '4px' }}>
        <p style={{ fontSize: '11px', color: '#000', margin: 0 }}>
          {bill.address || 'بلائر موڑ سمال انڈسٹری واہ کینٹ'}
        </p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }
          .print-view {
            width: 148mm !important;
            height: 210mm !important;
            padding: 8mm !important;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}

