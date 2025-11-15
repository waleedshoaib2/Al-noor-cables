import { usePVCMaterialStore } from '@/store/usePVCMaterialStore';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import type { PVCMaterial } from '@/types';

interface PVCListProps {
  materials: PVCMaterial[];
  onEdit: (material: PVCMaterial) => void;
  onDelete: (id: number) => void;
  filters?: {
    startDate?: string;
    endDate?: string;
  };
}

export default function PVCList({ materials, onEdit, onDelete, filters }: PVCListProps) {
  const { t, language } = useTranslation();

  // Filter materials
  const filteredMaterials = materials.filter((m) => {
    if (filters?.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (m.date < startDate) {
        return false;
      }
    }

    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (m.date > endDate) {
        return false;
      }
    }

    return true;
  });

  const totalQuantity = filteredMaterials.reduce((sum, m) => sum + m.quantity, 0);

  if (filteredMaterials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {language === 'ur' ? 'کوئی PVC مواد نہیں ملا' : 'No PVC materials found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {language === 'ur' ? 'کل مقدار:' : 'Total Quantity:'}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {totalQuantity.toFixed(2)} KG
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {language === 'ur' ? 'نام' : 'Name'}
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {language === 'ur' ? 'مقدار (KG)' : 'Quantity (KG)'}
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {language === 'ur' ? 'تاریخ' : 'Date'}
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {language === 'ur' ? 'بیچ ID' : 'Batch ID'}
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {language === 'ur' ? 'نوٹس' : 'Notes'}
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {language === 'ur' ? 'اعمال' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMaterials.map((material) => (
              <tr key={material.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{material.name}</div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{material.quantity.toFixed(2)} KG</div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {format(new Date(material.date), 'dd/MM/yyyy')}
                  </div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{material.batchId}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {material.notes || '-'}
                  </div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex gap-3">
                    <button
                      onClick={() => onEdit(material)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-150"
                    >
                      {language === 'ur' ? 'ترمیم' : 'Edit'}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(language === 'ur' ? 'PVC مواد حذف کریں؟' : 'Delete PVC material?')) {
                          onDelete(material.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-150"
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
    </div>
  );
}

