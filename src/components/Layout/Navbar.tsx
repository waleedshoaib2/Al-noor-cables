import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/Common/Button';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Al-Noor Cables</h1>
          </div>
          <div className="flex items-center space-x-4">
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
