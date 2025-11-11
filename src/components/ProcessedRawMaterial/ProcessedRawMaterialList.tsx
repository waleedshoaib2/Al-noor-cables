import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { formatDate } from '@/utils/helpers';
import type { ProcessedRawMaterial } from '@/types';

interface ProcessedRawMaterialListProps {
  materials?: ProcessedRawMaterial[];
  onEdit: (material: ProcessedRawMaterial) => void;
  onDelete: (id: number) => void;
  limit?: number;
}

export default function ProcessedRawMaterialList({
  materials,
  onEdit,
  onDelete,
  limit,
}: ProcessedRawMaterialListProps) {
  const processedMaterialsStore = useProcessedRawMaterialStore((state) =>
    limit ? state.getRecentProcessedMaterials(limit) : state.processedMaterials
  );

  // Use provided materials or fall back to store
  const processedMaterials = materials || processedMaterialsStore;

  if (processedMaterials.length === 0) {
    return <p className="text-gray-500">No processed materials recorded yet</p>;
  }

  return (
    <div className="space-y-3">
      {processedMaterials.map((material) => (
        <div
          key={material.id}
          className="border-b pb-3 last:border-b-0 flex justify-between items-start"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-900">{material.name}</div>
              <span className="text-sm text-gray-500">•</span>
              <div className="text-sm text-gray-600">{material.materialType}</div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Batch ID: {material.batchId}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {formatDate(material.date)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Input: {material.inputQuantity.toFixed(2)} kgs → Output:{' '}
              {material.numberOfBundles} bundles × {material.weightPerBundle.toFixed(2)} kgs ={' '}
              {material.outputQuantity.toFixed(2)} kgs
            </div>
            {material.rawMaterialBatchesUsed && material.rawMaterialBatchesUsed.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Raw Material Batches: {material.rawMaterialBatchesUsed.map((b) => b.batchId).join(', ')}
              </div>
            )}
            {material.notes && (
              <div className="text-xs text-gray-500 mt-1 italic">{material.notes}</div>
            )}
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-right">
              <div className="font-bold text-brand-blue">
                {material.outputQuantity.toFixed(2)} kgs
              </div>
              <div className="text-xs text-gray-500">
                {material.numberOfBundles} bundles
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

