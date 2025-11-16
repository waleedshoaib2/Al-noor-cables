import type { Bill } from '@/types';
import { format } from 'date-fns';

interface BillPrintViewProps {
  bill: Bill;
}

export default function BillPrintView({ bill }: BillPrintViewProps) {
  const billDate = new Date(bill.date);
  const formattedDate = format(billDate, 'dd/MM/yyyy');

  return (
    <div className="print-view" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', padding: '20px', direction: 'rtl' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          {/* Company Name - Top Right */}
          <div style={{ textAlign: 'right', flex: 1 }}>
            <h1 style={{ 
              color: '#000', 
              fontSize: '24px', 
              fontWeight: 'bold', 
              margin: 0,
              marginBottom: '10px'
            }}>
              النور كيبل هاؤس
            </h1>
            <div style={{ 
              backgroundColor: '#E3F2FD', 
              padding: '8px 12px', 
              borderRadius: '4px',
              marginTop: '10px'
            }}>
              <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                نام خریدار :
              </span>
            </div>
          </div>

          {/* Bill Number and Date - Top Left */}
          <div style={{ textAlign: 'left', minWidth: '150px' }}>
            <div style={{ 
              backgroundColor: '#f0f0f0', 
              color: '#000', 
              padding: '8px 12px', 
              borderRadius: '4px',
              marginBottom: '10px',
              textAlign: 'center',
              fontWeight: 'bold',
              border: '1px solid #ddd'
            }}>
              {bill.billNumber}
            </div>
            <div style={{ 
              backgroundColor: '#E3F2FD', 
              padding: '8px 12px', 
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                تاریخ: {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Name - Center */}
        <div style={{ 
          backgroundColor: '#E3F2FD', 
          padding: '12px', 
          borderRadius: '4px',
          textAlign: 'center',
          marginTop: '10px'
        }}>
          <span style={{ color: '#000', fontSize: '16px', fontWeight: 'bold' }}>
            {bill.customerName}
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          color: '#000', 
          padding: '10px', 
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '16px',
          marginBottom: '0',
          border: '1px solid #ddd'
        }}>
          تفصيل
        </div>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          border: '1px solid #ddd',
          direction: 'rtl'
        }}>
          <thead>
            <tr>
              <th style={{ 
                backgroundColor: '#f0f0f0', 
                color: '#000', 
                padding: '10px', 
                border: '1px solid #ddd',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                بنڈل
              </th>
              <th style={{ 
                backgroundColor: '#f0f0f0', 
                color: '#000', 
                padding: '10px', 
                border: '1px solid #ddd',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                نام
              </th>
              <th style={{ 
                backgroundColor: '#f0f0f0', 
                color: '#000', 
                padding: '10px', 
                border: '1px solid #ddd',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                تار
              </th>
              <th style={{ 
                backgroundColor: '#f0f0f0', 
                color: '#000', 
                padding: '10px', 
                border: '1px solid #ddd',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                فٹ
              </th>
              <th style={{ 
                backgroundColor: '#e8e8e8', 
                color: '#000', 
                padding: '10px', 
                border: '1px solid #ddd',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                ٹوٹل فٹ
              </th>
              <th style={{ 
                backgroundColor: '#f0f0f0', 
                color: '#000', 
                padding: '10px', 
                border: '1px solid #ddd',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                رویے
              </th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => (
              <tr key={index}>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#fff'
                }}>
                  {item.bundle}
                </td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#fff'
                }}>
                  {item.name}
                </td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#fff'
                }}>
                  {item.wire}
                </td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#fff'
                }}>
                  {item.feet}
                </td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#E8F5E9'
                }}>
                  {item.totalFeet}
                </td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#fff'
                }}>
                  {item.price.toLocaleString()}
                </td>
              </tr>
            ))}
            {/* Empty rows for template */}
            {Array.from({ length: Math.max(0, 10 - bill.items.length) }).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#fff' }}></td>
                <td style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#fff' }}></td>
                <td style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#fff' }}></td>
                <td style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#fff' }}></td>
                <td style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#E8F5E9' }}></td>
                <td style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#fff' }}></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} style={{ 
                padding: '10px', 
                border: '1px solid #ddd', 
                backgroundColor: '#fff',
                textAlign: 'right',
                fontWeight: 'bold'
              }}>
                ٹوٹل :
              </td>
              <td style={{ 
                padding: '10px', 
                border: '1px solid #ddd', 
                backgroundColor: '#fff',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {bill.total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer Section - Address */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        marginTop: '20px'
      }}>
        {/* Address - Bottom Right */}
        <div style={{ textAlign: 'right' }}>
          <span style={{ 
            color: '#000', 
            fontSize: '14px'
          }}>
            {bill.address || 'بابتر موڑ سمال انڈسٹری واہ کینٹ'}
          </span>
        </div>
      </div>
    </div>
  );
}

