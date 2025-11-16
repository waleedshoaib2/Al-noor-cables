import { useState, useRef, useMemo } from 'react';
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
import ProductPrintView from '@/components/Product/ProductPrintView';
import CustomProductForm from '@/components/CustomProduct/CustomProductForm';
import CustomProductList from '@/components/CustomProduct/CustomProductList';
import { exportToPDF } from '@/utils/pdfExport';
import type { ProductProduction } from '@/types';
import type { CustomProduct } from '@/types';
import { useCustomProductStore } from '@/store/useCustomProductStore';

export default function Products() {
  const { t, language } = useTranslation();
  const productions = useProductStore((state) => state.productions);
  const deleteProduction = useProductStore((state) => state.deleteProduction);
  const getTotalStock = useProductStore((state) => state.getTotalStock);
  const productStock = useProductStore((state) => state.stock);
  const processedMaterials = useProcessedRawMaterialStore((state) => state.processedMaterials);
  const restoreProcessedMaterialForProduct = useProcessedRawMaterialStore((state) => state.restoreProcessedMaterialForProduct);
  const purchases = useCustomerPurchaseStore((state) => state.purchases);
  const customers = useCustomerStore((state) => state.customers);

  const [showProductionForm, setShowProductionForm] = useState(false);
  const [editingProduction, setEditingProduction] = useState<ProductProduction | null>(null);
  const [showCustomProductForm, setShowCustomProductForm] = useState(false);
  const [editingCustomProduct, setEditingCustomProduct] = useState<CustomProduct | null>(null);
  const [showCustomProductList, setShowCustomProductList] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const deleteCustomProduct = useCustomProductStore((state) => state.deleteCustomProduct);

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

  const handleAddCustomProduct = () => {
    setEditingCustomProduct(null);
    setShowCustomProductForm(true);
  };

  const handleEditCustomProduct = (product: CustomProduct) => {
    setEditingCustomProduct(product);
    setShowCustomProductForm(true);
  };

  const handleDeleteCustomProduct = (id: number) => {
    if (window.confirm(t('deleteConfirm', 'product'))) {
      deleteCustomProduct(id);
    }
  };

  const handleCustomProductSubmit = () => {
    setShowCustomProductForm(false);
    setEditingCustomProduct(null);
  };

  const totalStock = getTotalStock();
  const reportSectionRef = useRef<HTMLDivElement>(null);

  // Filter productions based on search term, availability, and date range
  const filteredProductions = useMemo(() => {
    return productions.filter((production) => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        production.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        production.productNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        production.productTara?.toLowerCase().includes(searchTerm.toLowerCase());

      // Availability filter
      const productStockData = productStock[production.productName] || { foot: 0, bundles: 0 };
      const isAvailable = productStockData.bundles > 0;
      const matchesAvailability = 
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && isAvailable) ||
        (availabilityFilter === 'unavailable' && !isAvailable);

      // Date range filter
      const productionDate = new Date(production.date);
      const matchesStartDate = startDate === '' || productionDate >= new Date(startDate);
      const matchesEndDate = endDate === '' || productionDate <= new Date(endDate);

      return matchesSearch && matchesAvailability && matchesStartDate && matchesEndDate;
    });
  }, [productions, searchTerm, availabilityFilter, startDate, endDate, productStock]);

  // Count total productions (not just unique products)
  const totalProductionsCount = productions.length;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('title', 'product')}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowCustomProductList(true)}>
            {t('manageCustomProducts', 'product')}
          </Button>
          <Button variant="primary" onClick={handleAddProduction}>
            {t('addProduction', 'product')}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {language === 'ur' ? 'مصنوعات کی تعداد' : 'Number of Products'}
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalProductionsCount}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {language === 'ur' ? 'دستیاب اسٹاک (بنڈلز میں)' : 'Available Stock (in bundles)'}
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalStock.bundles.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'ur' ? 'فلٹرز' : 'Filters'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ur' ? 'تلاش کریں' : 'Search'}
            </label>
            <input
              type="text"
              placeholder={language === 'ur' ? 'نام، نمبر یا تارا' : 'Name, Number or Tara'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ur' ? 'دستیابی' : 'Availability'}
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'unavailable')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{language === 'ur' ? 'تمام' : 'All'}</option>
              <option value="available">{language === 'ur' ? 'دستیاب' : 'Available'}</option>
              <option value="unavailable">{language === 'ur' ? 'دستیاب نہیں' : 'Unavailable'}</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ur' ? 'شروع کی تاریخ' : 'Start Date'}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ur' ? 'آخری تاریخ' : 'End Date'}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || availabilityFilter !== 'all' || startDate || endDate) && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setAvailabilityFilter('all');
                setStartDate('');
                setEndDate('');
              }}
            >
              {language === 'ur' ? 'فلٹرز صاف کریں' : 'Clear Filters'}
            </Button>
          </div>
        )}
      </div>

      {/* Productions List */}
      <div id="products-report-section" ref={reportSectionRef} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 no-print">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredProductions.length === 0
              ? t('noProductionsFound', 'product')
              : `${filteredProductions.length} ${t('productionsFound', 'product')}`}
          </h2>
          {filteredProductions.length > 0 && (
            <Button variant="secondary" onClick={handlePrint} className="no-print">
              🖨️ {language === 'ur' ? 'پرنٹ' : 'Print'}
            </Button>
          )}
        </div>
        {filteredProductions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || availabilityFilter !== 'all' || startDate || endDate
                ? (language === 'ur' ? 'کوئی نتیجہ نہیں ملا' : 'No results found')
                : t('noProductionsFound', 'product')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {language === 'ur' ? 'نام' : 'Name'}
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {language === 'ur' ? 'نمبر' : 'Number'}
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {language === 'ur' ? 'تارا' : 'Tara'}
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('foot', 'product')}
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('bundles', 'product')}
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {language === 'ur' ? 'تاریخ' : 'Date'}
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {language === 'ur' ? 'دستیاب' : 'Available'}
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {language === 'ur' ? 'اعمال' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProductions.map((production) => {
                  // Get purchases for this specific product production
                  const productPurchases = purchases.filter((p) => p.productProductionId === production.id);
                  const totalPurchasedBundles = productPurchases.reduce((sum, p) => sum + p.quantityBundles, 0);
                  
                  // Check if product is available (has bundles > 0 in stock)
                  const productStockData = productStock[production.productName] || { foot: 0, bundles: 0 };
                  const isAvailable = productStockData.bundles > 0;
                  
                  return (
                    <>
                      <tr
                        key={production.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {production.productName}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {production.productNumber || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {production.productTara || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {production.quantityFoot > 0 ? production.quantityFoot.toFixed(2) : '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {production.quantityBundles > 0 ? production.quantityBundles.toFixed(2) : '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {new Date(production.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              isAvailable
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isAvailable
                              ? language === 'ur' ? 'دستیاب' : 'Available'
                              : language === 'ur' ? 'دستیاب نہیں' : 'Not Available'}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex gap-4">
                            <button
                              onClick={() => handleEditProduction(production)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-150"
                            >
                              {t('edit', 'product')}
                            </button>
                            <button
                              onClick={() => handleDeleteProduction(production.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-150"
                            >
                              {t('delete', 'product')}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {productPurchases.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="py-3 px-6">
                            <div className="text-xs font-semibold text-gray-700 mb-2">
                              {language === 'ur' ? 'خریداری' : 'Purchases'} ({productPurchases.length}):
                            </div>
                            <div className="space-y-1.5">
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
                              <div className="text-xs font-semibold text-gray-800 mt-2 pt-2 border-t border-gray-300 flex items-center gap-2">
                                <span>
                                  {language === 'ur' 
                                    ? `کل فروخت: ${totalPurchasedBundles.toFixed(2)} بنڈلز`
                                    : `Total Sold: ${totalPurchasedBundles.toFixed(2)} bundles`}
                                </span>
                                <span>•</span>
                                <span className={isAvailable ? 'text-green-700' : 'text-red-700'}>
                                  {language === 'ur' 
                                    ? `دستیاب: ${productStockData.bundles.toFixed(2)} بنڈلز`
                                    : `Available: ${productStockData.bundles.toFixed(2)} bundles`}
                                </span>
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

      {/* Custom Product Management Modal */}
      <Modal
        isOpen={showCustomProductList}
        onClose={() => {
          setShowCustomProductList(false);
          setEditingCustomProduct(null);
        }}
        title={t('manageCustomProducts', 'product')}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleAddCustomProduct}>
              {t('addCustomProduct', 'product')}
            </Button>
          </div>
          <CustomProductList
            onEdit={handleEditCustomProduct}
            onDelete={handleDeleteCustomProduct}
          />
        </div>
      </Modal>

      {/* Custom Product Form Modal */}
      <Modal
        isOpen={showCustomProductForm}
        onClose={() => {
          setShowCustomProductForm(false);
          setEditingCustomProduct(null);
        }}
        title={editingCustomProduct ? t('editCustomProduct', 'product') : t('addCustomProduct', 'product')}
      >
        <CustomProductForm
          product={editingCustomProduct}
          onClose={() => {
            setShowCustomProductForm(false);
            setEditingCustomProduct(null);
          }}
          onSubmit={handleCustomProductSubmit}
        />
      </Modal>

      {/* Print View - Only visible when printing */}
      <div className="print-view" style={{ display: 'none' }}>
        <ProductPrintView productions={productions} />
      </div>
    </div>
  );
}

