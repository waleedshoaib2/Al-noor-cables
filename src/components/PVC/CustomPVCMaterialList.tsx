import { useCustomPVCMaterialStore } from '@/store/useCustomPVCMaterialStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { CustomPVCMaterial } from '@/types';

interface CustomPVCMaterialListProps {
  materials?: CustomPVCMaterial[];
  onEdit: (material: CustomPVCMaterial) => void;
  onDelete: (id: number) => void;
}

export default function CustomPVCMaterialList({
  materials,
  onEdit,
  onDelete,
}: CustomPVCMaterialListProps) {
  const { t, language } = useTranslation();
  const allMaterials = useCustomPVCMaterialStore((state) => state.customPVCMaterials);
  const displayMaterials = materials || allMaterials;

  if (displayMaterials.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        {language === 'ur' ? 'کوئی کسٹم PVC مواد نہیں ملا' : 'No custom PVC materials found'}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {displayMaterials.map((material) => (
        <div
          key={material.id}
          className="border rounded-lg p-3 bg-white shadow-sm flex justify-between items-center"
        >
          <div>
            <div className="font-medium text-gray-900">
              {language === 'ur' ? 'نام' : 'Name'}: {material.name}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(material)}
              className="text-brand-blue hover:text-brand-blue-dark text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded"
            >
              {language === 'ur' ? 'ترمیم' : 'edit'}
            </button>
            <button
              onClick={() => onDelete(material.id)}
              className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded"
            >
              {language === 'ur' ? 'حذف' : 'delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

