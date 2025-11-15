import { formatDate } from '@/utils/helpers';
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
      <div className="mb-6 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Al Noor Cables</h1>
        <h2 className="text-2xl font-semibold text-gray-700">Raw Material Stock Report</h2>
        <div className="text-sm text-gray-600 mt-2">
          Printed on: {printDate}
        </div>
        {filters && (
          <div className="text-sm text-gray-600 mt-2">
            {filters.materialType && filters.materialType !== 'all' && (
              <span>Material Type: {filters.materialType} | </span>
            )}
            {filters.supplier && filters.supplier !== 'all' && (
              <span>Supplier: {filters.supplier} | </span>
            )}
            {filters.startDate && (
              <span>From: {new Date(filters.startDate).toLocaleDateString()} | </span>
            )}
            {filters.endDate && (
              <span>To: {new Date(filters.endDate).toLocaleDateString()}</span>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">Total Entries</div>
          <div className="text-xl font-bold text-gray-900">{materials.length}</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">Total Quantity</div>
          <div className="text-xl font-bold text-gray-900">{totalQuantity.toFixed(2)} kgs</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">Material Types</div>
          <div className="text-xl font-bold text-gray-900">{Object.keys(totalByMaterial).length}</div>
        </div>
      </div>

      {/* Material Type Breakdown */}
      {Object.keys(totalByMaterial).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary by Material Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(totalByMaterial).map(([type, qty]) => (
              <div key={type} className="border border-gray-300 p-3">
                <div className="text-sm text-gray-600">{type}</div>
                <div className="text-lg font-bold text-gray-900">{qty.toFixed(2)} kgs</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw Material Entries</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                Batch ID
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                Material Type
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                Supplier
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                Date
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                Quantity (kgs)
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                Available (kgs)
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                Notes
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
                  {material.originalQuantity.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                  {material.quantity.toFixed(2)}
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
                Total:
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {totalQuantity.toFixed(2)} kgs
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                {totalAvailable.toFixed(2)} kgs
              </td>
              <td className="border border-gray-300 px-3 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center">
        <p>Al Noor Cables - Raw Material Stock Report</p>
        <p>Generated on {printDate}</p>
      </div>
    </div>
  );
}

