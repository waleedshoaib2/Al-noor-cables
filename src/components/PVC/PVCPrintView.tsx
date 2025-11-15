import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import type { PVCMaterial } from '@/types';

interface PVCPrintViewProps {
  materials: PVCMaterial[];
  filters?: {
    startDate?: string;
    endDate?: string;
  };
}

export default function PVCPrintView({ materials, filters }: PVCPrintViewProps) {
  const { t, language } = useTranslation();
  const printDate = new Date().toLocaleString();

  // Filter materials if filters are provided
  const filteredMaterials = materials.filter((material) => {
    if (filters?.startDate) {
      const materialDate = format(new Date(material.date), 'yyyy-MM-dd');
      if (materialDate < filters.startDate) return false;
    }
    if (filters?.endDate) {
      const materialDate = format(new Date(material.date), 'yyyy-MM-dd');
      if (materialDate > filters.endDate) return false;
    }
    return true;
  });

  // Calculate totals
  const totalMaterials = filteredMaterials.length;
  const totalQuantity = filteredMaterials.reduce((sum, m) => sum + m.quantity, 0);

  return (
    <div className="print-view p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="mb-6 border-b-4 border-gray-900 pb-4" dir="rtl">
        <div className="flex justify-between items-start">
          <div className="text-right flex-1">
            <div className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '1px' }}>
              النور كيبل هاؤس
            </div>
            <div className="text-xl font-semibold text-gray-800 mb-2">
              {language === 'ur' ? 'PVC مواد کی رپورٹ' : 'PVC Materials Report'}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                {language === 'ur' ? 'پرنٹ کی تاریخ:' : 'Printed on:'} {printDate}
              </div>
              {(filters?.startDate || filters?.endDate) && (
                <div>
                  {language === 'ur' ? 'فلٹر:' : 'Filter:'}{' '}
                  {filters?.startDate && (
                    <span>
                      {language === 'ur' ? 'شروع:' : 'Start:'} {format(new Date(filters.startDate), 'dd/MM/yyyy')}
                    </span>
                  )}
                  {filters?.startDate && filters?.endDate && ' - '}
                  {filters?.endDate && (
                    <span>
                      {language === 'ur' ? 'آخر:' : 'End:'} {format(new Date(filters.endDate), 'dd/MM/yyyy')}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4" dir="rtl">
        <div className="border-2 border-gray-800 bg-gray-50 p-4 text-center">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
            {language === 'ur' ? 'کل PVC مواد' : 'Total PVC Materials'}
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalMaterials}</div>
        </div>
        <div className="border-2 border-gray-800 bg-gray-50 p-4 text-center">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
            {language === 'ur' ? 'کل مقدار' : 'Total Quantity'}
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalQuantity.toFixed(2)}</div>
          <div className="text-xs text-gray-600 mt-1">KG</div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          {language === 'ur' ? 'PVC مواد کی تفصیلات' : 'PVC Materials Details'}
        </h3>
        <table className="w-full border-collapse border-2 border-gray-800" dir={language === 'ur' ? 'rtl' : 'ltr'} style={{ borderSpacing: 0 }}>
          <thead>
            <tr className="bg-gray-200">
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{ backgroundColor: '#e5e7eb' }}>
                {language === 'ur' ? 'تاریخ' : 'Date'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{ backgroundColor: '#e5e7eb' }}>
                {language === 'ur' ? 'بیچ ID' : 'Batch ID'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{ backgroundColor: '#e5e7eb' }}>
                {language === 'ur' ? 'نام' : 'Name'}
              </th>
              <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{ backgroundColor: '#e5e7eb' }}>
                {language === 'ur' ? 'مقدار (KG)' : 'Quantity (KG)'}
              </th>
              {filteredMaterials.some((m) => m.notes) && (
                <th className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{ backgroundColor: '#e5e7eb' }}>
                  {language === 'ur' ? 'نوٹس' : 'Notes'}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.length === 0 ? (
              <tr>
                <td
                  colSpan={filteredMaterials.some((m) => m.notes) ? 5 : 4}
                  className="border-2 border-gray-800 px-4 py-4 text-center text-sm text-gray-600"
                >
                  {language === 'ur' ? 'کوئی PVC مواد نہیں ملا' : 'No PVC materials found'}
                </td>
              </tr>
            ) : (
              filteredMaterials.map((material, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr key={material.id} style={{ backgroundColor: isEven ? '#ffffff' : '#f9fafb' }}>
                    <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                      {format(new Date(material.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                      {material.batchId}
                    </td>
                    <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900 font-semibold">
                      {material.name}
                    </td>
                    <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                      {material.quantity.toFixed(2)}
                    </td>
                    {filteredMaterials.some((m) => m.notes) && (
                      <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm text-gray-900">
                        {material.notes || '-'}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredMaterials.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
                <td
                  colSpan={filteredMaterials.some((m) => m.notes) ? 3 : 2}
                  className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900"
                >
                  {language === 'ur' ? 'کل' : 'Total'}
                </td>
                <td className="border-2 border-gray-800 px-4 py-3 text-right text-sm font-bold text-gray-900">
                  {totalQuantity.toFixed(2)} KG
                </td>
                {filteredMaterials.some((m) => m.notes) && (
                  <td className="border-2 border-gray-800 px-4 py-3"></td>
                )}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-4 border-gray-900 text-center text-xs text-gray-600" dir="rtl">
        <p>Al Noor Cables - {language === 'ur' ? 'PVC مواد کی رپورٹ' : 'PVC Materials Report'}</p>
        <p>{language === 'ur' ? 'تاریخ پیدائش:' : 'Generated on'} {printDate}</p>
      </div>
    </div>
  );
}

