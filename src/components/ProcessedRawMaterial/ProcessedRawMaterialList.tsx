import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { formatDate } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import type { ProcessedRawMaterial } from '@/types';

interface ProcessedRawMaterialListProps {
  materials?: ProcessedRawMaterial[];
  onEdit: (material: ProcessedRawMaterial) => void;
  onDelete: (id: number) => void;
  limit?: number;
}

interface BatchGroup {
  batchId: string;
  date: Date;
  materialType: string;
  inputQuantity: number;
  materials: ProcessedRawMaterial[];
  totalOutput: number;
  notes?: string;
  rawMaterialBatchesUsed: any[];
}

export default function ProcessedRawMaterialList({
  materials,
  onEdit,
  onDelete,
  limit,
}: ProcessedRawMaterialListProps) {
  const { t, language } = useTranslation();
  const processedMaterialsStore = useProcessedRawMaterialStore((state) =>
    limit ? state.getRecentProcessedMaterials(limit) : state.processedMaterials
  );

  // Use provided materials or fall back to store
  const processedMaterials = materials || processedMaterialsStore;

  if (processedMaterials.length === 0) {
    return <p className="text-gray-500">{t('noMaterialsFound', 'processedMaterial')}</p>;
  }

  // Group materials by batch (batchId + date)
  const batchGroups = processedMaterials.reduce((groups, material) => {
    const batchKey = `${material.batchId}-${material.date.toISOString()}`;
    if (!groups[batchKey]) {
      groups[batchKey] = {
        batchId: material.batchId,
        date: material.date,
        materialType: material.materialType,
        inputQuantity: material.inputQuantity, // All entries in batch share same input
        materials: [],
        totalOutput: 0,
        notes: material.notes,
        rawMaterialBatchesUsed: material.rawMaterialBatchesUsed || [],
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

  return (
    <div className="space-y-4">
      {sortedBatches.map((batch) => (
        <div key={batch.batchId} className="border rounded-lg p-4 bg-white shadow-sm">
          {/* Batch Header - Main Info */}
          <div className="flex justify-between items-start mb-4 pb-4 border-b">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="font-bold text-lg text-gray-900">
                  {t('batch', 'processedMaterial')}: {batch.batchId}
                </div>
                <span className="px-2 py-1 bg-brand-blue text-white text-xs font-semibold rounded">
                  {batch.materialType}
                </span>
              </div>
              <div className="text-sm text-gray-500">{formatDate(batch.date)}</div>
            </div>
            <div className="text-right ml-4">
              <div className="text-xs text-gray-600 mb-1">{t('input', 'processedMaterial')}</div>
              <div className="text-2xl font-bold text-brand-orange">{batch.inputQuantity.toFixed(2)} kgs</div>
            </div>
          </div>

          {/* Batch Summary - Compact */}
          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
            <div>
              <div className="text-xs text-gray-600 mb-1">{t('totalOutput', 'processedMaterial')}</div>
              <div className="text-lg font-bold text-brand-blue">
                {batch.totalOutput.toFixed(2)} kgs
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">{t('materialsCount', 'processedMaterial')}</div>
              <div className="text-lg font-bold text-gray-700">
                {batch.materials.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">{t('rawMaterialBatchesUsed', 'processedMaterial')}</div>
              <div className="text-sm font-medium text-gray-700">
                {batch.rawMaterialBatchesUsed && batch.rawMaterialBatchesUsed.length > 0
                  ? batch.rawMaterialBatchesUsed.map((b) => b.batchId).join(', ')
                  : '-'}
              </div>
            </div>
          </div>

          {/* Processed Materials in Batch - Compact List */}
          <div className="mb-3">
            <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              {t('materialsInBatch', 'processedMaterial')}:
            </div>
            <div className="space-y-2">
              {batch.materials.map((material) => {
                const usedQuantity = material.usedQuantity || 0;
                const availableQuantity = material.outputQuantity - usedQuantity;
                const isUsed = usedQuantity > 0;
                // Calculate bundles as decimals
                const usedBundles = usedQuantity / material.weightPerBundle;
                const availableBundles = availableQuantity / material.weightPerBundle;
                return (
                  <div
                    key={material.id}
                    className={`bg-gray-50 rounded p-2 flex justify-between items-center ${
                      isUsed ? 'border-l-4 border-orange-500' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{material.name}</span>
                        {isUsed && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                            {language === 'ur' ? 'استعمال شدہ' : 'Used'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        ({material.numberOfBundles.toFixed(2)} {t('bundles', 'processedMaterial')} × {material.weightPerBundle.toFixed(2)} kgs {t('safiWeightPerBundle', 'processedMaterial')} = {material.outputQuantity.toFixed(2)} kgs)
                        {material.grossWeightPerBundle && (
                          <span className="ml-1 text-gray-500">
                            ({t('weightPerBundle', 'processedMaterial')}: {material.grossWeightPerBundle.toFixed(2)} kgs)
                          </span>
                        )}
                        {isUsed && (
                          <span className="ml-2 text-orange-600">
                            ({language === 'ur' ? 'استعمال شدہ' : 'Used'}: {usedBundles.toFixed(2)} {t('bundles', 'processedMaterial')} ({usedQuantity.toFixed(2)} kgs), {language === 'ur' ? 'دستیاب' : 'Available'}: {availableBundles.toFixed(2)} {t('bundles', 'processedMaterial')} ({availableQuantity.toFixed(2)} kgs))
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onEdit(material)}
                        className="text-brand-blue hover:text-brand-blue-dark text-xs font-medium px-2 py-1 hover:bg-blue-50 rounded"
                      >
                        {t('edit', 'processedMaterial')}
                      </button>
                      <button
                        onClick={() => onDelete(material.id)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium px-2 py-1 hover:bg-red-50 rounded"
                      >
                        {t('delete', 'processedMaterial')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Batch Notes */}
          {batch.notes && (
            <div className="pt-3 border-t text-sm text-gray-600 italic">
              <span className="font-medium">{t('notes', 'processedMaterial')}:</span> {batch.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
