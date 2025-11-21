import { useState } from 'react';
import { useCustomKhataStore } from '@/store/useCustomKhataStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import CustomKhataForm from '@/components/CustomKhata/CustomKhataForm';
import CustomKhataList from '@/components/CustomKhata/CustomKhataList';
import CustomKhataPrintView from '@/components/CustomKhata/CustomKhataPrintView';
import type { CustomKhata } from '@/types';

export default function CustomKhata() {
  const { t, language } = useTranslation();
  const entries = useCustomKhataStore((state) => state.entries);
  const deleteEntry = useCustomKhataStore((state) => state.deleteEntry);

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CustomKhata | null>(null);
  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  const handleEditEntry = (entry: CustomKhata) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDeleteEntry = (id: number) => {
    if (window.confirm(language === 'ur' ? 'کیا آپ واقعی اس انٹری کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this entry?')) {
      deleteEntry(id);
    }
  };

  const handleSubmit = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ur' ? 'کسٹم کھاتہ' : 'Custom Khata'}
        </h1>
        <div className="flex gap-2">
          {entries.length > 0 && (
            <Button variant="secondary" onClick={handlePrint} className="no-print">
              🖨️ {language === 'ur' ? 'پرنٹ' : 'Print'}
            </Button>
          )}
          <Button variant="primary" onClick={handleAddEntry}>
            {language === 'ur' ? '+ انٹری شامل کریں' : '+ Add Entry'}
          </Button>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white p-6 rounded-lg shadow-md no-print">
        <CustomKhataList
          entries={entries}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingEntry(null);
        }}
        title={
          editingEntry
            ? (language === 'ur' ? 'انٹری میں ترمیم کریں' : 'Edit Entry')
            : (language === 'ur' ? 'نیا انٹری شامل کریں' : 'Add New Entry')
        }
      >
        <CustomKhataForm
          entry={editingEntry}
          onClose={() => {
            setShowForm(false);
            setEditingEntry(null);
          }}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* Print View - Only visible when printing */}
      <div className="print-view" style={{ display: 'none' }}>
        <CustomKhataPrintView entries={entries} />
      </div>
    </div>
  );
}

