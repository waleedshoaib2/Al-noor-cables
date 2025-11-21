import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/raw-materials', label: 'Raw Materials', icon: '⚙️' },
    { path: '/processed-materials', label: 'Processed Materials', icon: '🔧' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/billing', label: 'Billing', icon: '🧾' },
    { path: '/expenses', label: 'Expenses', icon: '💰' },
    { path: '/employees', label: 'Employee Management', icon: '👔' },
    { path: '/scrap', label: 'Scrap', icon: '🗑️' },
    { path: '/pvc-materials', label: 'PVC Materials', icon: '🧪' },
    { path: '/custom-khata', label: 'Custom Khata', icon: '📝' },
    { path: '/reports', label: 'Reports', icon: '📄' },
  ];

  return (
    <aside className="w-64 bg-brand-blue border-r border-brand-blue-dark h-full">
      <nav className="p-4 h-full overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.hash === `#${item.path}`;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-blue-light text-white font-semibold'
                      : 'text-gray-200 hover:bg-brand-blue-dark hover:text-white'
                  }`}
                >
                  <span className={`mr-3 ${isActive ? 'text-white' : 'text-gray-200'}`}>{item.icon}</span>
                  <span className={isActive ? 'text-white' : 'text-gray-200'}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
