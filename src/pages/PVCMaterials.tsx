import { useState } from 'react';
import { usePVCMaterialStore } from '@/store/usePVCMaterialStore';
import { useCustomPVCMaterialStore } from '@/store/useCustomPVCMaterialStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import PVCForm from '@/components/PVC/PVCForm';
import PVCList from '@/components/PVC/PVCList';
import CustomPVCMaterialForm from '@/components/PVC/CustomPVCMaterialForm';
import CustomPVCMaterialList from '@/components/PVC/CustomPVCMaterialList';
import PVCPrintView from '@/components/PVC/PVCPrintView';
import type { PVCMaterial, CustomPVCMaterial } from '@/types';

export default function PVCMaterials() {
  const { t, language } = useTranslation();
  const pvcMaterials = usePVCMaterialStore((state) => state.pvcMaterials);
  const deletePVCMaterial = usePVCMaterialStore((state) => state.deletePVCMaterial);
  const getTotalQuantity = usePVCMaterialStore((state) => state.getTotalQuantity);

  const [showPVCForm, setShowPVCForm] = useState(false);
  const [showCustomMaterialList, setShowCustomMaterialList] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<PVCMaterial | null>(null);
  const [editingCustomMaterial, setEditingCustomMaterial] = useState<CustomPVCMaterial | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const deleteCustomPVCMaterial = useCustomPVCMaterialStore((state) => state.deleteCustomPVCMaterial);

  const handleAddPVCMaterial = () => {
    setEditingMaterial(null);
    setShowPVCForm(true);
  };

  const handleEditPVCMaterial = (material: PVCMaterial) => {
    setEditingMaterial(material);
    setShowPVCForm(true);
  };

  const handleDeletePVCMaterial = (id: number) => {
    deletePVCMaterial(id);
  };

  const handlePVCMaterialSubmit = () => {
    setShowPVCForm(false);
    setEditingMaterial(null);
  };

  const handleManageCustomMaterials = () => {
    setShowCustomMaterialList(true);
    setEditingCustomMaterial(null);
  };

  const handleAddCustomMaterial = () => {
    setEditingCustomMaterial(null);
    setShowCustomForm(true);
  };

  const handleEditCustomMaterial = (material: CustomPVCMaterial) => {
    setEditingCustomMaterial(material);
    setShowCustomForm(true);
  };

  const handleDeleteCustomMaterial = (id: number) => {
    if (window.confirm(language === 'ur' ? 'کسٹم PVC مواد حذف کریں؟' : 'Delete custom PVC material?')) {
      deleteCustomPVCMaterial(id);
    }
  };

  const handleCustomMaterialSubmit = () => {
    setShowCustomForm(false);
    setEditingCustomMaterial(null);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  const totalQuantity = getTotalQuantity();

  // Clear all filters
  const handleClearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
  };

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ur' ? 'PVC مواد' : 'PVC Materials'}
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleManageCustomMaterials}>
            {language === 'ur' ? 'کسٹم مواد مینج کریں' : 'Manage Custom Materials'}
          </Button>
          {pvcMaterials.length > 0 && (
            <Button variant="secondary" onClick={handlePrint} className="no-print">
              🖨️ {language === 'ur' ? 'پرنٹ' : 'Print'}
            </Button>
          )}
          <Button variant="primary" onClick={handleAddPVCMaterial}>
            {language === 'ur' ? '+ PVC مواد شامل کریں' : '+ Add PVC Material'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {language === 'ur' ? 'کل PVC مواد' : 'Total PVC Materials'}
            </div>
            <div className="text-3xl font-bold text-gray-900">{pvcMaterials.length}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {language === 'ur' ? 'کل مقدار' : 'Total Quantity'}
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalQuantity.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">KG</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {language === 'ur' ? 'فلٹرز' : 'Filters'}
          </h3>
          {(filterStartDate || filterEndDate) && (
            <Button variant="secondary" onClick={handleClearFilters} className="text-sm">
              {language === 'ur' ? 'فلٹرز صاف کریں' : 'Clear Filters'}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ur' ? 'شروع کی تاریخ' : 'Start Date'}
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ur' ? 'آخر کی تاریخ' : 'End Date'}
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* PVC Materials List */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {pvcMaterials.length === 0
              ? language === 'ur' ? 'کوئی PVC مواد نہیں ملا' : 'No PVC materials found'
              : `${pvcMaterials.length} ${language === 'ur' ? 'PVC مواد' : 'PVC Materials'}`}
          </h2>
        </div>
        <PVCList
          materials={pvcMaterials}
          onEdit={handleEditPVCMaterial}
          onDelete={handleDeletePVCMaterial}
          filters={{
            startDate: filterStartDate || undefined,
            endDate: filterEndDate || undefined,
          }}
        />
      </div>

      {/* PVC Form Modal */}
      <Modal
        isOpen={showPVCForm}
        onClose={() => {
          setShowPVCForm(false);
          setEditingMaterial(null);
        }}
        title={
          editingMaterial
            ? language === 'ur' ? 'PVC مواد ترمیم کریں' : 'Edit PVC Material'
            : language === 'ur' ? 'PVC مواد شامل کریں' : 'Add PVC Material'
        }
        size="md"
      >
        <PVCForm
          material={editingMaterial}
          onClose={() => {
            setShowPVCForm(false);
            setEditingMaterial(null);
          }}
          onSubmit={handlePVCMaterialSubmit}
        />
      </Modal>

      {/* Custom Material Management Modal */}
      <Modal
        isOpen={showCustomMaterialList}
        onClose={() => {
          setShowCustomMaterialList(false);
          setEditingCustomMaterial(null);
        }}
        title={language === 'ur' ? 'کسٹم مواد مینج کریں' : 'Manage Custom Materials'}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleAddCustomMaterial}>
              {language === 'ur' ? 'کسٹم مواد شامل کریں' : 'Add Custom Material'}
            </Button>
          </div>
          <CustomPVCMaterialList
            onEdit={handleEditCustomMaterial}
            onDelete={handleDeleteCustomMaterial}
          />
        </div>
      </Modal>

      {/* Custom Material Form Modal */}
      <Modal
        isOpen={showCustomForm}
        onClose={() => {
          setShowCustomForm(false);
          setEditingCustomMaterial(null);
        }}
        title={
          editingCustomMaterial
            ? language === 'ur' ? 'کسٹم مواد ترمیم کریں' : 'Edit Custom Material'
            : language === 'ur' ? 'کسٹم مواد شامل کریں' : 'Add Custom Material'
        }
        size="md"
      >
        <CustomPVCMaterialForm
          material={editingCustomMaterial}
          onClose={() => {
            setShowCustomForm(false);
            setEditingCustomMaterial(null);
          }}
          onSubmit={handleCustomMaterialSubmit}
        />
      </Modal>

      {/* Print View - Only visible when printing */}
      <div className="print-view" style={{ display: 'none' }}>
        <PVCPrintView
          materials={pvcMaterials}
          filters={{
            startDate: filterStartDate || undefined,
            endDate: filterEndDate || undefined,
          }}
        />
      </div>
    </div>
  );
}

