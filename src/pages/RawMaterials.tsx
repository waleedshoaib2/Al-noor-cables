import { useState } from 'react';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import RawMaterialForm from '@/components/RawMaterial/RawMaterialForm';
import RawMaterialList from '@/components/RawMaterial/RawMaterialList';
import RawMaterialPrintView from '@/components/RawMaterial/RawMaterialPrintView';
import type { RawMaterial } from '@/types';

export default function RawMaterials() {
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
    if (window.confirm('Are you sure you want to delete this raw material entry?')) {
      deleteRawMaterial(id);
    }
  };

  const handleRawMaterialSubmit = () => {
    setShowRawMaterialForm(false);
    setEditingMaterial(null);
  };

  const totalCopper = getTotalByMaterialType('Copper');
  const totalSilver = getTotalByMaterialType('Silver');
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

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Raw Material Intake</h1>
        <Button variant="primary" onClick={handleAddRawMaterial}>
          Add Raw Material
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Total Copper</div>
          <div className="text-3xl font-bold text-brand-orange">{totalCopper.toFixed(2)} kgs</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Total Silver</div>
          <div className="text-3xl font-bold text-brand-orange">{totalSilver.toFixed(2)} kgs</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Total All Materials</div>
          <div className="text-3xl font-bold text-brand-blue">{totalAll.toFixed(2)} kgs</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <Button variant="secondary" onClick={handleClearFilters} className="text-sm">
            Clear All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Material Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Type
            </label>
            <select
              value={filterMaterialType}
              onChange={(e) => setFilterMaterialType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="all">All Materials</option>
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
              Supplier
            </label>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="all">All Suppliers</option>
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
              Start Date
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
              End Date
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
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredMaterials.length === 0 
              ? 'No Raw Materials Found' 
              : `${filteredMaterials.length} Raw Material${filteredMaterials.length !== 1 ? 's' : ''} Found`}
          </h2>
          {filteredMaterials.length > 0 && (
            <Button variant="secondary" onClick={handlePrint} className="no-print">
              🖨️ Print
            </Button>
          )}
        </div>
        {filteredMaterials.length === 0 ? (
          <p className="text-gray-500">No raw materials match the selected filters</p>
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
        title={editingMaterial ? 'Edit Raw Material' : 'Add Raw Material'}
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

