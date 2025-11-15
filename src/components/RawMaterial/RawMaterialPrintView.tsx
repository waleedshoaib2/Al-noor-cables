import { formatDate } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import type { RawMaterial } from '@/types';

interface RawMaterialPrintViewProps {
  materials: RawMaterial[];
  filters?: {
    materialType?: string;
    supplier?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default function RawMaterialPrintView({ materials, filters }: RawMaterialPrintViewProps) {
  const { t, language } = useTranslation();
  const printDate = new Date().toLocaleString();
  
  // Calculate totals using originalQuantity (supplied quantity)
  const totalQuantity = materials.reduce((sum, m) => sum + m.originalQuantity, 0);
  const totalAvailable = materials.reduce((sum, m) => sum + m.quantity, 0);
  const totalByMaterial = materials.reduce((acc, m) => {
    acc[m.materialType] = (acc[m.materialType] || 0) + m.originalQuantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="print-view p-8">

      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-800 pb-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Al Noor Cables</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          {language === 'ur' ? 'خام مال اسٹاک رپورٹ' : 'Raw Material Stock Report'}
        </h2>
        <div className="text-sm text-gray-600 mt-2">
          {language === 'ur' ? 'پرنٹ کی تاریخ:' : 'Printed on:'} {printDate}
        </div>
        {filters && (
          <div className="text-sm text-gray-600 mt-2">
            {filters.materialType && filters.materialType !== 'all' && (
              <span>
                {language === 'ur' ? 'مواد کی قسم:' : 'Material Type:'} {filters.materialType} |{' '}
              </span>
            )}
            {filters.supplier && filters.supplier !== 'all' && (
              <span>
                {language === 'ur' ? 'سپلائر:' : 'Supplier:'} {filters.supplier} |{' '}
              </span>
            )}
            {filters.startDate && (
              <span>
                {language === 'ur' ? 'سے:' : 'From:'} {new Date(filters.startDate).toLocaleDateString()} |{' '}
              </span>
            )}
            {filters.endDate && (
              <span>
                {language === 'ur' ? 'تک:' : 'To:'} {new Date(filters.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل انٹریز' : 'Total Entries'}
          </div>
          <div className="text-xl font-bold text-gray-900">{materials.length}</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل مقدار' : 'Total Quantity'}
          </div>
          <div className="text-xl font-bold text-gray-900">{Math.round(totalQuantity)} kgs</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'مواد کی اقسام' : 'Material Types'}
          </div>
          <div className="text-xl font-bold text-gray-900">{Object.keys(totalByMaterial).length}</div>
        </div>
      </div>

      {/* Material Type Breakdown */}
      {Object.keys(totalByMaterial).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'مواد کی قسم کے لحاظ سے خلاصہ' : 'Summary by Material Type'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(totalByMaterial).map(([type, qty]) => (
              <div key={type} className="border border-gray-300 p-3">
                <div className="text-sm text-gray-600">{type}</div>
                <div className="text-lg font-bold text-gray-900">{Math.round(qty)} kgs</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {language === 'ur' ? 'خام مال کی انٹریز' : 'Raw Material Entries'}
        </h3>
        <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'بیچ آئی ڈی' : 'Batch ID'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'مواد کی قسم' : 'Material Type'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'سپلائر' : 'Supplier'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'تاریخ' : 'Date'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'مقدار (کلوگرام)' : 'Quantity (kgs)'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'دستیاب (کلوگرام)' : 'Available (kgs)'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'نوٹس' : 'Notes'}
              </th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr key={material.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {material.batchId}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {material.materialType}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {material.supplier}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {formatDate(material.date)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                  {Math.round(material.originalQuantity)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                  {Math.round(material.quantity)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                  {material.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={4} className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {language === 'ur' ? 'کل:' : 'Total:'}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {Math.round(totalQuantity)} kgs
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {Math.round(totalAvailable)} kgs
              </td>
              <td className="border border-gray-300 px-3 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <p>Al Noor Cables - {language === 'ur' ? 'خام مال اسٹاک رپورٹ' : 'Raw Material Stock Report'}</p>
        <p>{language === 'ur' ? 'تاریخ پیدائش:' : 'Generated on'} {printDate}</p>
      </div>
    </div>
  );
}

