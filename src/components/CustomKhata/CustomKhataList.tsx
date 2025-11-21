import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/utils/helpers';
import type { CustomKhata } from '@/types';

interface CustomKhataListProps {
  entries: CustomKhata[];
  onEdit: (entry: CustomKhata) => void;
  onDelete: (id: number) => void;
}

export default function CustomKhataList({
  entries,
  onEdit,
  onDelete,
}: CustomKhataListProps) {
  const { language } = useTranslation();

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {language === 'ur' ? 'کوئی انٹری نہیں ملی' : 'No entries found'}
      </div>
    );
  }

  // Sort entries by date (oldest first) - ledger order
  const sortedEntries = [...entries].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
              {language === 'ur' ? 'ID نمبر' : 'ID Number'}
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
              {language === 'ur' ? 'رقم' : 'Amount'}
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
              {language === 'ur' ? 'تفصیلات' : 'Details'}
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
              {language === 'ur' ? 'تاریخ' : 'Date'}
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700 no-print">
              {language === 'ur' ? 'اعمال' : 'Actions'}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                {entry.idNumber}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm text-right">
                <span
                  style={{
                    color: entry.amountColor === 'red' ? '#dc2626' : '#000000',
                    fontWeight: 'bold',
                  }}
                >
                  {entry.amount.toLocaleString()}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900" dir="rtl">
                {entry.details}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                {formatDate(entry.date)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm no-print">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(entry)}
                    className="text-brand-blue hover:text-brand-blue-dark text-xs font-medium px-2 py-1 hover:bg-blue-50 rounded"
                  >
                    {language === 'ur' ? 'ترمیم' : 'Edit'}
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-red-600 hover:text-red-700 text-xs font-medium px-2 py-1 hover:bg-red-50 rounded"
                  >
                    {language === 'ur' ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

