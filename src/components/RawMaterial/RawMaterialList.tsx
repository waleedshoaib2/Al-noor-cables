import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
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
  const processedMaterials = useProcessedRawMaterialStore((state) => state.processedMaterials);

  // Use provided materials or fall back to store
  const rawMaterials = materials || rawMaterialsStore;

  // Check if a raw material has been used in processed materials
  const isMaterialUsed = (rawMaterialId: number): boolean => {
    return processedMaterials.some((pm) =>
      pm.rawMaterialBatchesUsed?.some((batch) => batch.rawMaterialId === rawMaterialId)
    );
  };

  if (rawMaterials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No raw materials recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rawMaterials.map((material) => (
        <div
          key={material.id}
          className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-base font-semibold text-gray-900">{material.materialType}</div>
                <span className="text-sm text-gray-400">•</span>
                <div className="text-sm text-gray-600">{material.supplier}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Batch ID: <span className="font-mono">{material.batchId}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(material.date)}
              </div>
              {material.notes && (
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 italic">
                  {material.notes}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 ml-4">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {Math.round(material.originalQuantity)} <span className="font-bold">{material.materialType === 'Steel' ? 'foot' : 'kgs'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(material)}
                  disabled={isMaterialUsed(material.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
                    isMaterialUsed(material.id)
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 border border-blue-200'
                  }`}
                  title={isMaterialUsed(material.id) ? 'This material has been used in processed materials and cannot be edited' : 'Edit'}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDelete(material.id)}
                  disabled={isMaterialUsed(material.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
                    isMaterialUsed(material.id)
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200'
                  }`}
                  title={isMaterialUsed(material.id) ? 'This material has been used in processed materials and cannot be deleted' : 'Delete'}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

