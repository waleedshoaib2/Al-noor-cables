import { useCustomProcessedRawMaterialStore } from '@/store/useCustomProcessedRawMaterialStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { CustomProcessedRawMaterial } from '@/types';

interface CustomProcessedRawMaterialListProps {
  materials?: CustomProcessedRawMaterial[];
  onEdit: (material: CustomProcessedRawMaterial) => void;
  onDelete: (id: number) => void;
}

export default function CustomProcessedRawMaterialList({
  materials,
  onEdit,
  onDelete,
}: CustomProcessedRawMaterialListProps) {
  const { t, language } = useTranslation();
  const allMaterials = useCustomProcessedRawMaterialStore((state) => state.customProcessedMaterials);
  const displayMaterials = materials || allMaterials;

  if (displayMaterials.length === 0) {
    return <p className="text-gray-500">{t('noCustomMaterialsFound', 'customProcessedMaterial')}</p>;
  }

  return (
    <div className="space-y-2">
      {displayMaterials.map((material) => (
        <div key={material.id} className="border rounded-lg p-3 bg-white shadow-sm flex justify-between items-center">
          <div className="flex-1">
            <div className="font-medium text-gray-900">{material.name}</div>
            <div className="text-sm text-gray-500">
              {t('priorRawMaterial', 'customProcessedMaterial')}: {material.priorRawMaterial}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(material)}
              className="text-brand-blue hover:text-brand-blue-dark text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded"
            >
              {t('edit', 'customProcessedMaterial')}
            </button>
            <button
              onClick={() => onDelete(material.id)}
              className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded"
            >
              {t('delete', 'customProcessedMaterial')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

