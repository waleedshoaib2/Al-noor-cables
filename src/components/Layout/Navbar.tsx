import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Button } from '@/components/Common/Button';
import { useNavigate } from 'react-router-dom';
import { clearAllStorage } from '@/utils/storage';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const language = useLanguageStore((state) => state.language);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllStorage();
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Al-Noor Cables</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              onClick={toggleLanguage}
              className="text-sm"
              title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
            >
              {language === 'en' ? '🇵🇰 اردو' : '🇬🇧 English'}
            </Button>
            <Button
              variant="danger"
              onClick={handleClearAll}
              className="text-sm"
              title="Clear all data from localStorage"
            >
              🗑️ Clear All Data
            </Button>
            <span className="text-sm text-gray-700">{user?.fullName}</span>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
