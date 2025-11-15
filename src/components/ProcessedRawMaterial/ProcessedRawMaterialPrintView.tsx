import { formatDate } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import type { ProcessedRawMaterial } from '@/types';

interface ProcessedRawMaterialPrintViewProps {
  materials: ProcessedRawMaterial[];
  filters?: {
    materialType?: string;
    processedMaterialName?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface BatchGroup {
  batchId: string;
  date: Date;
  materialType: string;
  inputQuantity: number;
  materials: ProcessedRawMaterial[];
  totalOutput: number;
  notes?: string;
}

export default function ProcessedRawMaterialPrintView({ materials, filters }: ProcessedRawMaterialPrintViewProps) {
  const { t, language } = useTranslation();
  const printDate = new Date().toLocaleString();
  
  // Group materials by batch (batchId + date)
  const batchGroups = materials.reduce((groups, material) => {
    const batchKey = `${material.batchId}-${material.date.toISOString()}`;
    if (!groups[batchKey]) {
      groups[batchKey] = {
        batchId: material.batchId,
        date: material.date,
        materialType: material.materialType,
        inputQuantity: material.inputQuantity,
        materials: [],
        totalOutput: 0,
        notes: material.notes,
      };
    }
    groups[batchKey].materials.push(material);
    groups[batchKey].totalOutput += material.outputQuantity;
    return groups;
  }, {} as Record<string, BatchGroup>);

  // Sort batches by date (newest first)
  const sortedBatches = Object.values(batchGroups).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  // Calculate totals
  const totalInput = sortedBatches.reduce((sum, batch) => sum + batch.inputQuantity, 0);
  const totalOutput = sortedBatches.reduce((sum, batch) => sum + batch.totalOutput, 0);
  const totalByMaterialType = sortedBatches.reduce((acc, batch) => {
    acc[batch.materialType] = (acc[batch.materialType] || 0) + batch.totalOutput;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="print-view p-8">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-800 pb-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Al Noor Cables</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          {language === 'ur' ? 'پروسیس شدہ خام مال کی رپورٹ' : 'Processed Raw Materials Report'}
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
            {filters.processedMaterialName && filters.processedMaterialName !== 'all' && (
              <span>
                {language === 'ur' ? 'پروسیس شدہ مواد:' : 'Processed Material:'} {filters.processedMaterialName} |{' '}
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
            {language === 'ur' ? 'کل بیچز' : 'Total Batches'}
          </div>
          <div className="text-xl font-bold text-gray-900">{sortedBatches.length}</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل ان پٹ' : 'Total Input'}
          </div>
          <div className="text-xl font-bold text-gray-900">{Math.round(totalInput)} kgs</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل آؤٹ پٹ' : 'Total Output'}
          </div>
          <div className="text-xl font-bold text-gray-900">{Math.round(totalOutput)} kgs</div>
        </div>
      </div>

      {/* Material Type Breakdown */}
      {Object.keys(totalByMaterialType).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'مواد کی قسم کے لحاظ سے خلاصہ' : 'Summary by Material Type'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(totalByMaterialType).map(([type, qty]) => (
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
          {language === 'ur' ? 'پروسیس شدہ خام مال کی انٹریز' : 'Processed Raw Material Entries'}
        </h3>
        <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'بیچ آئی ڈی' : 'Batch ID'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'تاریخ' : 'Date'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'مواد کی قسم' : 'Material Type'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'نام' : 'Name'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'ان پٹ (کلوگرام)' : 'Input (kgs)'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'آؤٹ پٹ (کلوگرام)' : 'Output (kgs)'}
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
            {sortedBatches.flatMap((batch) =>
              batch.materials.map((material, index) => {
                const availableQuantity = material.outputQuantity - (material.usedQuantity || 0);
                return (
                  <tr key={`${batch.batchId}-${material.id}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      {material.batchId}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      {formatDate(material.date)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      {material.materialType}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      {material.name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                      {Math.round(material.inputQuantity)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                      {Math.round(material.outputQuantity)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                      {Math.round(availableQuantity)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      {material.notes || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={4} className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {language === 'ur' ? 'کل:' : 'Total:'}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {Math.round(totalInput)} kgs
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {Math.round(totalOutput)} kgs
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {Math.round(totalOutput - materials.reduce((sum, m) => sum + (m.usedQuantity || 0), 0))} kgs
              </td>
              <td className="border border-gray-300 px-3 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <p>Al Noor Cables - {language === 'ur' ? 'پروسیس شدہ خام مال کی رپورٹ' : 'Processed Raw Materials Report'}</p>
        <p>{language === 'ur' ? 'تاریخ پیدائش:' : 'Generated on'} {printDate}</p>
      </div>
    </div>
  );
}

