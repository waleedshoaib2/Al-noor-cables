import { useTranslation } from '@/hooks/useTranslation';
import type { CustomKhata } from '@/types';

interface CustomKhataPrintViewProps {
  entries: CustomKhata[];
}

export default function CustomKhataPrintView({ entries }: CustomKhataPrintViewProps) {
  const { language } = useTranslation();
  const printDate = new Date().toLocaleString();

  // Sort entries by date (oldest first) - ledger order
  const sortedEntries = [...entries].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <div className="print-view p-8" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff' }}>
      {/* Main Table - Matching exact image layout */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #000',
        }}
      >
        <tbody>
          {/* Header Row 1 - Merged cells for title */}
          <tr>
            <td
              colSpan={4}
              style={{
                backgroundColor: '#FFE5B4',
                padding: '15px',
                border: '1px solid #000',
                textAlign: 'center',
              }}
            >
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', margin: 0 }} dir="rtl">
                رحمت نور کوٹ شمس
              </h1>
            </td>
          </tr>
          {/* Header Row 2 - Continuation of merged header */}
          <tr>
            <td
              colSpan={4}
              style={{
                backgroundColor: '#FFE5B4',
                padding: '15px',
                border: '1px solid #000',
                borderTop: 'none',
                textAlign: 'center',
              }}
            ></td>
          </tr>
          {/* Column Headers Row 3 */}
          <tr>
            <th
              style={{
                border: '1px solid #000',
                padding: '8px',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              }}
              dir="rtl"
            >
              {language === 'ur' ? 'تاریخ' : 'Date'}
            </th>
            <th
              style={{
                border: '1px solid #000',
                padding: '8px',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              }}
              dir="rtl"
            >
              {language === 'ur' ? 'تفصیل' : 'Details'}
            </th>
            <th
              style={{
                border: '1px solid #000',
                padding: '8px',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              }}
            >
              {language === 'ur' ? 'رقم' : 'Amount'}
            </th>
            <th
              style={{
                border: '1px solid #000',
                padding: '8px',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              }}
            >
              {language === 'ur' ? 'ID نمبر' : 'ID Number'}
            </th>
          </tr>
          {/* Data Rows */}
          {sortedEntries.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                style={{
                  border: '1px solid #000',
                  padding: '15px',
                  textAlign: 'center',
                  color: '#666',
                }}
              >
                {language === 'ur' ? 'کوئی انٹری نہیں ملی' : 'No entries found'}
              </td>
            </tr>
          ) : (
            sortedEntries.map((entry) => (
              <tr key={entry.id}>
                <td
                  style={{
                    border: '1px solid #000',
                    padding: '8px',
                    fontSize: '14px',
                  }}
                >
                  {entry.date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}
                </td>
                <td
                  style={{
                    border: '1px solid #000',
                    padding: '8px',
                    fontSize: '14px',
                  }}
                  dir="rtl"
                >
                  {entry.details}
                </td>
                <td
                  style={{
                    border: '1px solid #000',
                    padding: '8px',
                    fontSize: '14px',
                    textAlign: 'right',
                    color: entry.amountColor === 'red' ? '#dc2626' : '#000000',
                    fontWeight: 'bold',
                  }}
                >
                  {entry.amount.toLocaleString()}
                </td>
                <td
                  style={{
                    border: '1px solid #000',
                    padding: '8px',
                    fontSize: '14px',
                  }}
                >
                  {entry.idNumber}
                </td>
              </tr>
            ))
          )}
          {/* Empty rows to match spreadsheet appearance */}
          {Array.from({ length: Math.max(0, 20 - sortedEntries.length) }).map((_, index) => (
            <tr key={`empty-${index}`}>
              <td style={{ border: '1px solid #000', padding: '8px', minHeight: '25px' }}></td>
              <td style={{ border: '1px solid #000', padding: '8px' }}></td>
              <td style={{ border: '1px solid #000', padding: '8px' }}></td>
              <td style={{ border: '1px solid #000', padding: '8px' }}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div
        className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center"
        dir={language === 'ur' ? 'rtl' : 'ltr'}
      >
        <p>
          {language === 'ur' ? 'کسٹم کھاتہ رپورٹ' : 'Custom Khata Report'} - {language === 'ur' ? 'تاریخ پیدائش:' : 'Generated on'}{' '}
          {printDate}
        </p>
      </div>
    </div>
  );
}

