import { useState, useRef } from 'react';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import RawMaterialForm from '@/components/RawMaterial/RawMaterialForm';
import RawMaterialList from '@/components/RawMaterial/RawMaterialList';
import RawMaterialPrintView from '@/components/RawMaterial/RawMaterialPrintView';
import { exportToPDF } from '@/utils/pdfExport';
import type { RawMaterial } from '@/types';

export default function RawMaterials() {
  const { t, language } = useTranslation();
  const rawMaterials = useRawMaterialStore((state) => state.rawMaterials);
  const deleteRawMaterial = useRawMaterialStore((state) => state.deleteRawMaterial);
  const getTotalByMaterialType = useRawMaterialStore((state) => state.getTotalByMaterialType);

  const [showRawMaterialForm, setShowRawMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [filterMaterialType, setFilterMaterialType] = useState<string>('all');
  const [filterSupplier, setFilterSupplier] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const handleAddRawMaterial = () => {
    setEditingMaterial(null);
    setShowRawMaterialForm(true);
  };

  const handleEditRawMaterial = (material: RawMaterial) => {
    setEditingMaterial(material);
    setShowRawMaterialForm(true);
  };

  const handleDeleteRawMaterial = (id: number) => {
    if (window.confirm(t('deleteConfirm'))) {
      deleteRawMaterial(id);
    }
  };

  const handleRawMaterialSubmit = () => {
    setShowRawMaterialForm(false);
    setEditingMaterial(null);
  };

  const totalCopper = getTotalByMaterialType('Copper');
  const totalSilver = getTotalByMaterialType('Silver');
  const totalSteel = getTotalByMaterialType('Steel');
  const totalAll = rawMaterials.reduce((sum, m) => sum + m.quantity, 0);

  // Get unique material types and suppliers for filter
  const materialTypes = useRawMaterialStore((state) => state.materialTypes);
  const suppliers = useRawMaterialStore((state) => state.suppliers);

  // Filter materials
  const filteredMaterials = rawMaterials.filter((m) => {
    // Material type filter
    if (filterMaterialType !== 'all' && m.materialType.toLowerCase() !== filterMaterialType.toLowerCase()) {
      return false;
    }

    // Supplier filter
    if (filterSupplier !== 'all' && m.supplier.toLowerCase() !== filterSupplier.toLowerCase()) {
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
    setFilterSupplier('all');
    setFilterStartDate('');
    setFilterEndDate('');
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
        'raw-materials-report-section',
        `Raw_Materials_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        'Raw Materials Report'
      );
    }
  };

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleAddRawMaterial}>
            {t('addRawMaterial')}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {t('totalCopper')}
            </div>
            <div className="text-3xl font-bold text-gray-900">{Math.round(totalCopper)} <span className="font-bold">kgs</span></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {t('totalSilver')}
            </div>
            <div className="text-3xl font-bold text-gray-900">{Math.round(totalSilver)} <span className="font-bold">kgs</span></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Steel
            </div>
            <div className="text-3xl font-bold text-gray-900">{Math.round(totalSteel)} <span className="font-bold">foot</span></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t('filters')}</h2>
          <Button variant="secondary" onClick={handleClearFilters} className="text-sm">
            {t('clearAll')}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Material Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('materialType')}
            </label>
            <select
              value={filterMaterialType}
              onChange={(e) => setFilterMaterialType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="all">{t('allMaterials')}</option>
              {materialTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('supplier')}
            </label>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="all">{t('allSuppliers')}</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('startDate')}
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
              {t('endDate')}
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

      {/* Raw Materials List */}
      <div id="raw-materials-report-section" ref={reportSectionRef} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredMaterials.length === 0 
              ? t('noMaterialsFound')
              : `${filteredMaterials.length} ${filteredMaterials.length === 1 ? t('materialFound') : t('materialsFound')}`}
          </h2>
          {filteredMaterials.length > 0 && (
            <Button variant="secondary" onClick={handlePrint} className="no-print">
              🖨️ {t('print')}
            </Button>
          )}
        </div>
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('noMaterialsFound')}</p>
          </div>
        ) : (
          <RawMaterialList
            materials={filteredMaterials}
            onEdit={handleEditRawMaterial}
            onDelete={handleDeleteRawMaterial}
          />
        )}
      </div>

      {/* Raw Material Form Modal */}
      <Modal
        isOpen={showRawMaterialForm}
        onClose={() => {
          setShowRawMaterialForm(false);
          setEditingMaterial(null);
        }}
        title={editingMaterial ? t('editRawMaterial') : t('addRawMaterial')}
        size="lg"
      >
        <RawMaterialForm
          material={editingMaterial}
          onClose={() => {
            setShowRawMaterialForm(false);
            setEditingMaterial(null);
          }}
          onSubmit={handleRawMaterialSubmit}
        />
      </Modal>

      {/* Print View - Only visible when printing */}
      <div className="print-view" style={{ display: 'none' }}>
        <RawMaterialPrintView
          materials={filteredMaterials}
          filters={{
            materialType: filterMaterialType,
            supplier: filterSupplier,
            startDate: filterStartDate,
            endDate: filterEndDate,
          }}
        />
      </div>
    </div>
  );
}

