import { useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import ProductProductionForm from '@/components/Product/ProductProductionForm';
import type { ProductProduction } from '@/types';

export default function Products() {
  const { t, language } = useTranslation();
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const productions = useProductStore((state) => state.productions);
  const deleteProduction = useProductStore((state) => state.deleteProduction);
  const getTotalStock = useProductStore((state) => state.getTotalStock);
  const processedMaterials = useProcessedRawMaterialStore((state) => state.processedMaterials);
  const restoreProcessedMaterialForProduct = useProcessedRawMaterialStore((state) => state.restoreProcessedMaterialForProduct);

  const [showProductionForm, setShowProductionForm] = useState(false);
  const [editingProduction, setEditingProduction] = useState<ProductProduction | null>(null);

  const handleAddProduction = () => {
    setEditingProduction(null);
    setShowProductionForm(true);
  };

  const handleEditProduction = (production: ProductProduction) => {
    setEditingProduction(production);
    setShowProductionForm(true);
  };

  const handleDeleteProduction = (id: number) => {
    if (window.confirm(t('deleteConfirm', 'product'))) {
      const production = productions.find((p) => p.id === id);
      if (production && production.processedMaterialSnapshot) {
        // Restore the processed raw material entry that was used
        restoreProcessedMaterialForProduct(production.processedMaterialSnapshot);
      }
      deleteProduction(id);
    }
  };

  const handleProductionSubmit = () => {
    setShowProductionForm(false);
    setEditingProduction(null);
  };

  const totalStock = getTotalStock();

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('title', 'product')}</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={toggleLanguage}
            className="text-sm"
            title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
          >
            {language === 'en' ? '🇵🇰 اردو' : '🇬🇧 English'}
          </Button>
          <Button variant="primary" onClick={handleAddProduction}>
            {t('addProduction', 'product')}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">{t('totalStockFoot', 'product')}</div>
          <div className="text-3xl font-bold text-brand-orange">{totalStock.foot.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">{t('totalStockBundles', 'product')}</div>
          <div className="text-3xl font-bold text-brand-blue">{totalStock.bundles.toFixed(2)}</div>
        </div>
      </div>

      {/* Productions List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {productions.length === 0
            ? t('noProductionsFound', 'product')
            : `${productions.length} ${t('productionsFound', 'product')}`}
        </h2>
        {productions.length === 0 ? (
          <p className="text-gray-500">{t('noProductionsFound', 'product')}</p>
        ) : (
          <div className="space-y-3">
            {productions.map((production) => (
              <div
                key={production.id}
                className="border-b pb-3 last:border-b-0 flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-medium text-gray-900">{production.productName}</div>
                    {production.productNumber && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <div className="text-sm text-gray-600">{production.productNumber}</div>
                      </>
                    )}
                    {production.productTara && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <div className="text-sm text-gray-600">{production.productTara}</div>
                      </>
                    )}
                    {(production.quantityFoot > 0 || production.quantityBundles > 0) && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <div className="text-sm text-gray-600">
                          {production.quantityFoot > 0 && (
                            <span>{production.quantityFoot} {t('foot', 'product')}</span>
                          )}
                          {production.quantityFoot > 0 && production.quantityBundles > 0 && (
                            <span className="mx-1">+</span>
                          )}
                          {production.quantityBundles > 0 && (
                            <span>{production.quantityBundles} {t('bundles', 'product')}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Batch ID: {production.batchId}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(production.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProduction(production)}
                    className="text-brand-blue hover:text-brand-blue-dark text-sm font-medium"
                  >
                    {t('edit', 'product')}
                  </button>
                  <button
                    onClick={() => handleDeleteProduction(production.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    {t('delete', 'product')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Production Form Modal */}
      <Modal
        isOpen={showProductionForm}
        onClose={() => {
          setShowProductionForm(false);
          setEditingProduction(null);
        }}
        title={
          editingProduction
            ? t('editProduction', 'product')
            : t('addProduction', 'product')
        }
        size="lg"
      >
        <ProductProductionForm
          production={editingProduction}
          onClose={() => {
            setShowProductionForm(false);
            setEditingProduction(null);
          }}
          onSubmit={handleProductionSubmit}
        />
      </Modal>
    </div>
  );
}

