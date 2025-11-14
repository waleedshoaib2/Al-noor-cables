import { useState, useRef } from 'react';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import ProcessedRawMaterialForm from '@/components/ProcessedRawMaterial/ProcessedRawMaterialForm';
import ProcessedRawMaterialList from '@/components/ProcessedRawMaterial/ProcessedRawMaterialList';
import CustomProcessedRawMaterialForm from '@/components/CustomProcessedRawMaterial/CustomProcessedRawMaterialForm';
import CustomProcessedRawMaterialList from '@/components/CustomProcessedRawMaterial/CustomProcessedRawMaterialList';
import { exportToPDF } from '@/utils/pdfExport';
import type { ProcessedRawMaterial } from '@/types';
import type { CustomProcessedRawMaterial } from '@/types';
import { useCustomProcessedRawMaterialStore } from '@/store/useCustomProcessedRawMaterialStore';

export default function ProcessedRawMaterials() {
  const { t, language } = useTranslation();
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const processedMaterials = useProcessedRawMaterialStore(
    (state) => state.processedMaterials
  );
  const deleteProcessedMaterial = useProcessedRawMaterialStore(
    (state) => state.deleteProcessedMaterial
  );
  const restoreStock = useRawMaterialStore((state) => state.restoreStock);
  const getAllProcessedMaterialNames = useProcessedRawMaterialStore(
    (state) => state.getAllProcessedMaterialNames
  );
  const processedMaterialNames = getAllProcessedMaterialNames();

  const [showProcessedMaterialForm, setShowProcessedMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ProcessedRawMaterial | null>(null);
  const [showCustomMaterialForm, setShowCustomMaterialForm] = useState(false);
  const [editingCustomMaterial, setEditingCustomMaterial] = useState<CustomProcessedRawMaterial | null>(null);
  const [filterMaterialType, setFilterMaterialType] = useState<string>('all');
  const [filterProcessedMaterialName, setFilterProcessedMaterialName] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const deleteCustomProcessedMaterial = useCustomProcessedRawMaterialStore(
    (state) => state.deleteCustomProcessedMaterial
  );

  const handleAddProcessedMaterial = () => {
    setEditingMaterial(null);
    setShowProcessedMaterialForm(true);
  };

  const handleEditProcessedMaterial = (material: ProcessedRawMaterial) => {
    setEditingMaterial(material);
    setShowProcessedMaterialForm(true);
  };

  const handleDeleteProcessedMaterial = (id: number) => {
    if (window.confirm(t('deleteConfirm', 'processedMaterial'))) {
      const material = processedMaterials.find((m) => m.id === id);
      if (material) {
        // Check if this is the only material in the batch
        const batchMaterials = processedMaterials.filter(
          (m) => m.batchId === material.batchId && m.date.getTime() === material.date.getTime()
        );
        
        // Only restore raw material stock if deleting the entire batch
        // (i.e., this is the last or only material in the batch)
        if (batchMaterials.length === 1 && material.rawMaterialBatchesUsed && material.rawMaterialBatchesUsed.length > 0) {
          restoreStock(material.rawMaterialBatchesUsed);
        }
        
        deleteProcessedMaterial(id);
      }
    }
  };

  const handleProcessedMaterialSubmit = () => {
    setShowProcessedMaterialForm(false);
    setEditingMaterial(null);
  };

  // Calculate totals for ALL materials by type (unfiltered - for summary stats)
  const allBatchGroups = processedMaterials.reduce((groups, material) => {
    const batchKey = `${material.batchId}-${material.date.toISOString()}`;
    if (!groups[batchKey]) {
      groups[batchKey] = {
        materialType: material.materialType,
        inputQuantity: material.inputQuantity, // Each batch has one input quantity
        materials: [],
      };
    }
    groups[batchKey].materials.push(material);
    return groups;
  }, {} as Record<string, { materialType: string; inputQuantity: number; materials: ProcessedRawMaterial[] }>);

  // Calculate totals by material type from ALL batches (unfiltered)
  const allCopperBatches = Object.values(allBatchGroups).filter((b) => b.materialType.toLowerCase() === 'copper');
  const allSilverBatches = Object.values(allBatchGroups).filter((b) => b.materialType.toLowerCase() === 'silver');
  
  const copperInput = allCopperBatches.reduce((sum, batch) => sum + batch.inputQuantity, 0);
  // Calculate total output produced from all copper materials (sum of all outputQuantity)
  const copperOutput = allCopperBatches.reduce((sum, batch) => 
    sum + batch.materials.reduce((mSum, m) => mSum + m.outputQuantity, 0), 0
  );
  
  const silverInput = allSilverBatches.reduce((sum, batch) => sum + batch.inputQuantity, 0);
  // Calculate total output produced from all silver materials (sum of all outputQuantity)
  const silverOutput = allSilverBatches.reduce((sum, batch) => 
    sum + batch.materials.reduce((mSum, m) => mSum + m.outputQuantity, 0), 0
  );

  // Filter materials for the list display only
  const filteredMaterials = processedMaterials.filter((m) => {
    // Material type filter
    if (filterMaterialType !== 'all' && m.materialType.toLowerCase() !== filterMaterialType.toLowerCase()) {
      return false;
    }

    // Processed material name filter
    if (filterProcessedMaterialName !== 'all' && m.name.toLowerCase() !== filterProcessedMaterialName.toLowerCase()) {
      return false;
    }

    // Date range filter
    if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      startDate.setHours(0, 0, 0, 0);
      if (m.date < startDate) {
        return false;
      }
    }

    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      if (m.date > endDate) {
        return false;
      }
    }

    return true;
  });

  // Clear all filters
  const handleClearFilters = () => {
    setFilterMaterialType('all');
    setFilterProcessedMaterialName('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const handleAddCustomMaterial = () => {
    setEditingCustomMaterial(null);
    setShowCustomMaterialForm(true);
  };

  const handleEditCustomMaterial = (material: CustomProcessedRawMaterial) => {
    setEditingCustomMaterial(material);
    setShowCustomMaterialForm(true);
  };

  const handleDeleteCustomMaterial = (id: number) => {
    if (window.confirm(language === 'ur' ? 'کیا آپ واقعی اس کسٹم مواد کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this custom material?')) {
      deleteCustomProcessedMaterial(id);
    }
  };

  const handleCustomMaterialSubmit = () => {
    setShowCustomMaterialForm(false);
    setEditingCustomMaterial(null);
  };

  const reportSectionRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Export handler
  const handleExportPDF = async () => {
    if (reportSectionRef.current) {
      await exportToPDF(
        'processed-materials-report-section',
        `Processed_Materials_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        'Processed Materials Report'
      );
    }
  };

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('title', 'processedMaterial')}</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={toggleLanguage}
            className="text-sm"
            title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
          >
            {language === 'en' ? '🇵🇰 اردو' : '🇬🇧 English'}
          </Button>
          <Button variant="secondary" onClick={handleAddCustomMaterial}>
            {t('manageCustomMaterials', 'processedMaterial')}
          </Button>
          <Button variant="primary" onClick={handleAddProcessedMaterial}>
            {t('addProcessedMaterial', 'processedMaterial')}
          </Button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">
          {language === 'ur' ? 'پروسیسڈ خام مال کا انتظام' : 'Processed Raw Materials Management'}
        </h2>
        <p className="text-white/90 leading-relaxed">
          {language === 'ur' 
            ? 'یہ صفحہ آپ کو خام مال سے پروسیسڈ خام مال بنانے کی سہولت فراہم کرتا ہے۔ آپ یہاں پروسیسڈ مٹیریل کا نام، ان پٹ مقدار، بنڈلز کی تعداد، فی بنڈل وزن، اور آؤٹ پٹ مقدار شامل کر سکتے ہیں۔ یہ سسٹم خود بخود خام مال کی اسٹاک کو اپڈیٹ کرتا ہے۔'
            : 'This page allows you to create processed raw materials from raw materials. You can add processed material name, input quantity, number of bundles, weight per bundle, and output quantity here. The system automatically updates raw material stock.'}
        </p>
      </div>

      {/* Summary Stats - Copper */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Copper</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">
              {language === 'ur' ? 'استعمال شدہ مقدار' : 'Amount Utilized'}
            </div>
            <div className="text-2xl font-bold text-brand-orange">{copperInput.toFixed(2)} kgs</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">
              {language === 'ur' ? 'دستیاب مقدار' : 'Amount Available'}
            </div>
            <div className="text-2xl font-bold text-brand-orange">{copperOutput.toFixed(2)} kgs</div>
          </div>
        </div>
      </div>

      {/* Summary Stats - Silver */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Silver</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">
              {language === 'ur' ? 'استعمال شدہ مقدار' : 'Amount Utilized'}
            </div>
            <div className="text-2xl font-bold text-brand-orange">{silverInput.toFixed(2)} kgs</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">
              {language === 'ur' ? 'دستیاب مقدار' : 'Amount Available'}
            </div>
            <div className="text-2xl font-bold text-brand-orange">{silverOutput.toFixed(2)} kgs</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('filters', 'processedMaterial')}</h2>
          <Button variant="secondary" onClick={handleClearFilters} className="text-sm">
            {t('clearAll', 'processedMaterial')}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Material Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('materialType', 'processedMaterial')}
            </label>
            <select
              value={filterMaterialType}
              onChange={(e) => setFilterMaterialType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="all">{t('allMaterials', 'processedMaterial')}</option>
              <option value="Copper">Copper</option>
              <option value="Silver">Silver</option>
            </select>
          </div>

          {/* Processed Material Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('processedMaterialName', 'processedMaterial')}
            </label>
            <select
              value={filterProcessedMaterialName}
              onChange={(e) => setFilterProcessedMaterialName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="all">{t('allProcessedMaterials', 'processedMaterial')}</option>
              {processedMaterialNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('startDate', 'processedMaterial')}
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('endDate', 'processedMaterial')}
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
        </div>
      </div>

      {/* Processed Materials List */}
      <div id="processed-materials-report-section" ref={reportSectionRef} className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredMaterials.length === 0
              ? t('noMaterialsFound', 'processedMaterial')
              : `${filteredMaterials.length} ${
                  filteredMaterials.length === 1
                    ? t('materialFound', 'processedMaterial')
                    : t('materialsFound', 'processedMaterial')
                }`}
          </h2>
          {filteredMaterials.length > 0 && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleExportPDF} className="no-print">
                📄 {language === 'ur' ? 'PDF برآمد کریں' : 'Export PDF'}
              </Button>
              <Button variant="secondary" onClick={handlePrint} className="no-print">
                🖨️ {t('print', 'processedMaterial')}
              </Button>
            </div>
          )}
        </div>
        {filteredMaterials.length === 0 ? (
          <p className="text-gray-500">{t('noMaterialsFound', 'processedMaterial')}</p>
        ) : (
          <ProcessedRawMaterialList
            materials={filteredMaterials}
            onEdit={handleEditProcessedMaterial}
            onDelete={handleDeleteProcessedMaterial}
          />
        )}
      </div>

      {/* Processed Material Form Modal */}
      <Modal
        isOpen={showProcessedMaterialForm}
        onClose={() => {
          setShowProcessedMaterialForm(false);
          setEditingMaterial(null);
        }}
        title={
          editingMaterial
            ? t('editProcessedMaterial', 'processedMaterial')
            : t('addProcessedMaterial', 'processedMaterial')
        }
        size="lg"
      >
        <ProcessedRawMaterialForm
          material={editingMaterial}
          onClose={() => {
            setShowProcessedMaterialForm(false);
            setEditingMaterial(null);
          }}
          onSubmit={handleProcessedMaterialSubmit}
        />
      </Modal>

      {/* Custom Processed Material Management Modal */}
      <Modal
        isOpen={showCustomMaterialForm}
        onClose={() => {
          setShowCustomMaterialForm(false);
          setEditingCustomMaterial(null);
        }}
        title={editingCustomMaterial ? t('editCustomMaterial', 'processedMaterial') : t('manageCustomMaterials', 'processedMaterial')}
      >
        <div className="space-y-4">
          {!editingCustomMaterial && (
            <>
              <div className="flex justify-end mb-4">
                <Button variant="primary" onClick={() => setEditingCustomMaterial({ id: 0, name: '', priorRawMaterial: '', createdAt: new Date() })}>
                  {t('addCustomMaterial', 'processedMaterial')}
                </Button>
              </div>
              <CustomProcessedRawMaterialList
                onEdit={handleEditCustomMaterial}
                onDelete={handleDeleteCustomMaterial}
              />
            </>
          )}
          {editingCustomMaterial && (
            <CustomProcessedRawMaterialForm
              material={editingCustomMaterial.id === 0 ? null : editingCustomMaterial}
              onClose={() => {
                setShowCustomMaterialForm(false);
                setEditingCustomMaterial(null);
              }}
              onSubmit={handleCustomMaterialSubmit}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}

