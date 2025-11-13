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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {language === 'ur' ? 'نام' : 'Name'}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {language === 'ur' ? 'نمبر' : 'Number'}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {language === 'ur' ? 'تارا' : 'Tara'}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {t('foot', 'product')}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {t('bundles', 'product')}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {language === 'ur' ? 'بیچ آئی ڈی' : 'Batch ID'}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {language === 'ur' ? 'تاریخ' : 'Date'}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {language === 'ur' ? 'اعمال' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {productions.map((production) => (
                  <tr
                    key={production.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {production.productName}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {production.productNumber || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {production.productTara || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {production.quantityFoot > 0 ? production.quantityFoot.toFixed(2) : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {production.quantityBundles > 0 ? production.quantityBundles.toFixed(2) : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {production.batchId}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(production.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-3">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

