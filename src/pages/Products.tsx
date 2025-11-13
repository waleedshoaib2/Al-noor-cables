import { useState, useRef } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useCustomerPurchaseStore } from '@/store/useCustomerPurchaseStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import ProductProductionForm from '@/components/Product/ProductProductionForm';
import { exportToPDF } from '@/utils/pdfExport';
import type { ProductProduction } from '@/types';

export default function Products() {
  const { t, language } = useTranslation();
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const productions = useProductStore((state) => state.productions);
  const deleteProduction = useProductStore((state) => state.deleteProduction);
  const getTotalStock = useProductStore((state) => state.getTotalStock);
  const processedMaterials = useProcessedRawMaterialStore((state) => state.processedMaterials);
  const restoreProcessedMaterialForProduct = useProcessedRawMaterialStore((state) => state.restoreProcessedMaterialForProduct);
  const purchases = useCustomerPurchaseStore((state) => state.purchases);
  const customers = useCustomerStore((state) => state.customers);

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
        // Calculate the amount to restore based on bundlesUsed
        const bundlesUsed = production.bundlesUsed || 0;
        const quantityToRestore = bundlesUsed * production.processedMaterialSnapshot.weightPerBundle;
        
        // Manually restore by reducing usedQuantity
        const processedMaterials = useProcessedRawMaterialStore.getState().processedMaterials;
        const material = processedMaterials.find((m) => m.id === production.processedMaterialSnapshot!.id);
        if (material && quantityToRestore > 0) {
          const updatedMaterials = processedMaterials.map((m) =>
            m.id === material.id
              ? { ...m, usedQuantity: Math.max(0, (m.usedQuantity || 0) - quantityToRestore) }
              : m
          );
          // Recalculate stock
          const currentState = useProcessedRawMaterialStore.getState();
          const stock = { ...currentState.stock };
          const materialsWithName = updatedMaterials.filter((m) => m.name === material.name);
          stock[material.name] = materialsWithName.reduce(
            (sum, m) => sum + (m.outputQuantity - (m.usedQuantity || 0)),
            0
          );
          // Update the store
          useProcessedRawMaterialStore.setState({
            processedMaterials: updatedMaterials,
            stock,
          });
          // Save to storage
          const saveToStorage = useProcessedRawMaterialStore.getState().saveToStorage;
          if (saveToStorage) {
            saveToStorage();
          }

          // Restore raw material if processed material was created from it
          if (material.rawMaterialBatchesUsed && material.rawMaterialBatchesUsed.length > 0) {
            // Calculate the proportion of raw material to restore based on quantity restored
            const inputQuantity = material.inputQuantity;
            const proportion = quantityToRestore / material.outputQuantity;
            
            const batchesToRestore = material.rawMaterialBatchesUsed.map((batch) => ({
              ...batch,
              quantityUsed: batch.quantityUsed * proportion,
            }));
            
            useRawMaterialStore.getState().restoreStock(batchesToRestore);
          }
        }
      }
      deleteProduction(id);
    }
  };

  const handleProductionSubmit = () => {
    setShowProductionForm(false);
    setEditingProduction(null);
  };

  const totalStock = getTotalStock();
  const reportSectionRef = useRef<HTMLDivElement>(null);

  // PDF Export handler
  const handleExportPDF = async () => {
    if (reportSectionRef.current) {
      await exportToPDF(
        'products-report-section',
        `Products_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        'Products Report'
      );
    }
  };

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

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">
          {language === 'ur' ? 'مصنوعات کا انتظام' : 'Products Management'}
        </h2>
        <p className="text-white/90 leading-relaxed">
          {language === 'ur' 
            ? 'یہ صفحہ آپ کو پروسیسڈ خام مال سے مصنوعات بنانے کی سہولت فراہم کرتا ہے۔ آپ یہاں پروڈکٹ کا نام، نمبر، تارا، مقدار (فٹ اور بنڈلز)، بیچ آئی ڈی اور نوٹس شامل کر سکتے ہیں۔ یہ سسٹم خود بخود پروسیسڈ خام مال کی اسٹاک کو اپڈیٹ کرتا ہے۔'
            : 'This page allows you to create products from processed raw materials. You can add product name, number, tara, quantity (foot and bundles), batch ID, and notes here. The system automatically updates processed raw material stock.'}
        </p>
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
      <div id="products-report-section" ref={reportSectionRef} className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {productions.length === 0
              ? t('noProductionsFound', 'product')
              : `${productions.length} ${t('productionsFound', 'product')}`}
          </h2>
          {productions.length > 0 && (
            <Button variant="secondary" onClick={handleExportPDF} className="no-print">
              📄 {language === 'ur' ? 'PDF برآمد کریں' : 'Export PDF'}
            </Button>
          )}
        </div>
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
                {productions.map((production) => {
                  // Get purchases for this specific product production
                  const productPurchases = purchases.filter((p) => p.productProductionId === production.id);
                  const totalPurchasedBundles = productPurchases.reduce((sum, p) => sum + p.quantityBundles, 0);
                  
                  return (
                    <>
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
                      {productPurchases.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="py-2 px-4">
                            <div className="text-xs font-semibold text-gray-600 mb-1">
                              {language === 'ur' ? 'خریداری' : 'Purchases'} ({productPurchases.length}):
                            </div>
                            <div className="space-y-1">
                              {productPurchases.map((purchase) => {
                                const customer = customers.find((c) => c.id === purchase.customerId);
                                return (
                                  <div key={purchase.id} className="text-xs text-gray-600 flex items-center gap-2">
                                    <span className="font-medium">{customer?.name || 'Unknown'}</span>
                                    <span>•</span>
                                    <span>{purchase.quantityBundles.toFixed(2)} {language === 'ur' ? 'بنڈلز' : 'bundles'}</span>
                                    <span>•</span>
                                    <span>{new Date(purchase.date).toLocaleDateString()}</span>
                                  </div>
                                );
                              })}
                              <div className="text-xs font-medium text-gray-700 mt-1">
                                {language === 'ur' 
                                  ? `کل فروخت: ${totalPurchasedBundles.toFixed(2)} بنڈلز`
                                  : `Total Sold: ${totalPurchasedBundles.toFixed(2)} bundles`}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
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

