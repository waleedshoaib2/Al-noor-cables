import type { Bill } from '@/types';
import { format } from 'date-fns';

interface AllBillsPrintViewProps {
  bills: Bill[];
}

export default function AllBillsPrintView({ bills }: AllBillsPrintViewProps) {
  const printDate = new Date().toLocaleString();
  const totalAmount = bills.reduce((sum, bill) => sum + bill.total, 0);

  if (bills.length === 0) {
    return (
      <div className="print-view p-10" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff' }}>
        <p className="text-center text-gray-600">No bills found</p>
      </div>
    );
  }

  return (
    <div className="print-view" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
          النور كيبل هاؤس
        </h1>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
          All Sales Report
        </h2>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Printed on: {printDate}
        </p>
      </div>

      {/* Summary */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <div>
          <strong>Total Bills:</strong> {bills.length}
        </div>
        <div>
          <strong>Total Amount:</strong> {totalAmount.toLocaleString()} PKR
        </div>
      </div>

      {/* Bills Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', marginBottom: '30px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>
              Bill No.
            </th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>
              Customer Name
            </th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>
              Date
            </th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
              Items
            </th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
              Total (PKR)
            </th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => (
            <tr key={bill.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>
                {bill.billNumber}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>
                {bill.customerName}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', color: '#000' }}>
                {format(new Date(bill.date), 'dd/MM/yyyy')}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: '#000' }}>
                {bill.items.length}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                {bill.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
            <td colSpan={4} style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', color: '#000' }}>
              Grand Total:
            </td>
            <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', color: '#000' }}>
              {totalAmount.toLocaleString()} PKR
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <p>Al-Noor Cable House - Bahtar Mor Small Industry Wah Cantt</p>
      </div>
    </div>
  );
}

