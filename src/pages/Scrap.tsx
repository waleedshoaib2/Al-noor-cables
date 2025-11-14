import { useState } from 'react';
import { useScrapStore } from '@/store/useScrapStore';
import ScrapList from '@/components/Scrap/ScrapList';
import ScrapForm from '@/components/Scrap/ScrapForm';
import { Button } from '@/components/Common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import type { Scrap } from '@/types';

export default function Scrap() {
  const { t, language } = useTranslation();
  const addScrap = useScrapStore((state) => state.addScrap);
  const updateScrap = useScrapStore((state) => state.updateScrap);
  const deleteScrap = useScrapStore((state) => state.deleteScrap);
  const scraps = useScrapStore((state) => state.scraps);
  const getTotalByMaterialType = useScrapStore((state) => state.getTotalByMaterialType);

  const [showScrapForm, setShowScrapForm] = useState(false);
  const [editingScrap, setEditingScrap] = useState<Scrap | null>(null);

  const handleAddScrap = () => {
    setEditingScrap(null);
    setShowScrapForm(true);
  };

  const handleEditScrap = (scrap: Scrap) => {
    setEditingScrap(scrap);
    setShowScrapForm(true);
  };

  const handleDeleteScrap = (id: number) => {
    if (window.confirm(language === 'ur' ? 'کیا آپ واقعی اس سکریپ کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this scrap entry?')) {
      deleteScrap(id);
    }
  };

  const handleScrapSubmit = () => {
    setShowScrapForm(false);
    setEditingScrap(null);
  };

  const totalCopper = getTotalByMaterialType('Copper');
  const totalSilver = getTotalByMaterialType('Silver');
  const totalScrap = scraps.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('title', 'scrap')}</h1>
        <Button variant="primary" onClick={handleAddScrap}>
          {t('addScrap', 'scrap')}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-1">{t('totalScrap', 'scrap')}</div>
          <div className="text-2xl font-bold text-brand-orange">{totalScrap.toFixed(2)} kgs</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-1">{t('totalCopper', 'scrap')}</div>
          <div className="text-2xl font-bold text-brand-orange">{totalCopper.toFixed(2)} kgs</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-1">{t('totalSilver', 'scrap')}</div>
          <div className="text-2xl font-bold text-brand-orange">{totalSilver.toFixed(2)} kgs</div>
        </div>
      </div>

      <ScrapList onEdit={handleEditScrap} onDelete={handleDeleteScrap} />

      {showScrapForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingScrap ? t('editScrap', 'scrap') : t('addScrap', 'scrap')}
              </h2>
              <button
                onClick={() => {
                  setShowScrapForm(false);
                  setEditingScrap(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ScrapForm
              scrap={editingScrap}
              onClose={() => {
                setShowScrapForm(false);
                setEditingScrap(null);
              }}
              onSubmit={handleScrapSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}

