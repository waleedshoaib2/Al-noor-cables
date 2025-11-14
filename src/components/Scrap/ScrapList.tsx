import { useScrapStore } from '@/store/useScrapStore';
import { formatDate } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import type { Scrap } from '@/types';

interface ScrapListProps {
  scraps?: Scrap[];
  onEdit: (scrap: Scrap) => void;
  onDelete: (id: number) => void;
}

export default function ScrapList({ scraps, onEdit, onDelete }: ScrapListProps) {
  const { t, language } = useTranslation();
  const allScraps = useScrapStore((state) => state.scraps);
  const displayScraps = scraps || allScraps;

  if (displayScraps.length === 0) {
    return <p className="text-gray-500">{t('noScrapsFound', 'scrap')}</p>;
  }

  // Sort by date (newest first)
  const sortedScraps = [...displayScraps].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-4">
      {sortedScraps.map((scrap) => (
        <div key={scrap.id} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-brand-blue text-white text-xs font-semibold rounded">
                  {scrap.materialType}
                </span>
                <span className="text-sm text-gray-500">{formatDate(scrap.date)}</span>
              </div>
              <div className="text-lg font-bold text-gray-900 mb-1">
                {scrap.amount.toFixed(2)} kgs
              </div>
              {scrap.notes && (
                <p className="text-sm text-gray-600 mt-2">{scrap.notes}</p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(scrap)}
                className="text-brand-blue hover:text-brand-blue-dark text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded"
              >
                {t('edit', 'scrap')}
              </button>
              <button
                onClick={() => onDelete(scrap.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded"
              >
                {t('delete', 'scrap')}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

