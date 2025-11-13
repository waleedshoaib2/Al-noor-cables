import { useState, useEffect } from 'react';
import { supabaseSyncService } from '@/services/supabaseSyncService';
import { Button } from '@/components/Common/Button';
import { useLanguageStore } from '@/store/useLanguageStore';

export default function SyncStatus() {
  const language = useLanguageStore((state) => state.language);
  const [syncStatus, setSyncStatus] = useState(supabaseSyncService.getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    supabaseSyncService.loadSyncStatus();
    setSyncStatus(supabaseSyncService.getSyncStatus());

    // Update status periodically
    const interval = setInterval(() => {
      setSyncStatus(supabaseSyncService.getSyncStatus());
    }, 5000);

    // Listen to online/offline events
    const handleOnline = () => setSyncStatus(supabaseSyncService.getSyncStatus());
    const handleOffline = () => setSyncStatus(supabaseSyncService.getSyncStatus());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    const result = await supabaseSyncService.syncToCloud();

    if (result.success) {
      setSyncMessage(language === 'ur' ? 'کامیابی سے سنک ہو گیا' : 'Successfully synced to cloud');
      setSyncStatus(supabaseSyncService.getSyncStatus());
    } else {
      setSyncMessage(result.error || (language === 'ur' ? 'سنک ناکام' : 'Sync failed'));
    }

    setIsSyncing(false);
    setTimeout(() => setSyncMessage(null), 5000);
  };

  const totalPending = Object.values(syncStatus.pendingChanges).reduce((a, b) => a + b, 0);
  const isOnline = syncStatus.isOnline;
  const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {language === 'ur' ? 'کلاؤڈ سنک' : 'Cloud Sync'}
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isOnline 
              ? (language === 'ur' ? 'آن لائن' : 'Online')
              : (language === 'ur' ? 'آف لائن' : 'Offline')}
          </span>
        </div>
      </div>

      {!isConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
          <p className="text-sm text-yellow-800">
            {language === 'ur' 
              ? 'Supabase ترتیب نہیں دی گئی۔ براہ کرم .env فائل میں VITE_SUPABASE_URL اور VITE_SUPABASE_ANON_KEY شامل کریں۔'
              : 'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file.'}
          </p>
        </div>
      )}

      {syncStatus.lastSyncTime && (
        <p className="text-sm text-gray-600 mb-3">
          {language === 'ur' ? 'آخری سنک:' : 'Last sync:'}{' '}
          {new Date(syncStatus.lastSyncTime).toLocaleString()}
        </p>
      )}

      {totalPending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
          <p className="text-sm text-yellow-800">
            {language === 'ur' 
              ? `${totalPending} تبدیلیاں سنک کی منتظر ہیں`
              : `${totalPending} pending changes to sync`}
          </p>
        </div>
      )}

      {syncMessage && (
        <div className={`mb-3 p-2 rounded-md text-sm ${
          syncMessage.includes('Success') || syncMessage.includes('کامیابی')
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
        }`}>
          {syncMessage}
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleSync}
        disabled={!isOnline || isSyncing || !isConfigured}
        className="w-full"
      >
        {isSyncing
          ? (language === 'ur' ? 'سنک ہو رہا ہے...' : 'Syncing...')
          : (language === 'ur' ? 'کلاؤڈ پر سنک کریں' : 'Sync to Cloud')}
      </Button>
    </div>
  );
}

