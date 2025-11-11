import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { formatDate } from '@/utils/helpers';
import { Button } from '@/components/Common/Button';
import type { RawMaterial } from '@/types';

interface RawMaterialListProps {
  materials?: RawMaterial[];
  onEdit: (material: RawMaterial) => void;
  onDelete: (id: number) => void;
  limit?: number;
}

export default function RawMaterialList({ materials, onEdit, onDelete, limit }: RawMaterialListProps) {
  const rawMaterialsStore = useRawMaterialStore((state) =>
    limit ? state.getRecentMaterials(limit) : state.rawMaterials
  );

  // Use provided materials or fall back to store
  const rawMaterials = materials || rawMaterialsStore;

  if (rawMaterials.length === 0) {
    return <p className="text-gray-500">No raw materials recorded yet</p>;
  }

  return (
    <div className="space-y-3">
      {rawMaterials.map((material) => (
        <div
          key={material.id}
          className="border-b pb-3 last:border-b-0 flex justify-between items-start"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-900">{material.materialType}</div>
              <span className="text-sm text-gray-500">•</span>
              <div className="text-sm text-gray-600">{material.supplier}</div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Batch ID: {material.batchId}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {formatDate(material.date)}
            </div>
            {material.notes && (
              <div className="text-xs text-gray-500 mt-1 italic">
                {material.notes}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-right">
              <div className="font-bold text-brand-blue">
                {material.quantity.toFixed(2)} kgs
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(material)}
                className="text-brand-blue hover:text-brand-blue-dark text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(material.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

