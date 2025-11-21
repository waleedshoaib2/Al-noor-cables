import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import StockManagement from './pages/StockManagement';
import RawMaterials from './pages/RawMaterials';
import ProcessedRawMaterials from './pages/ProcessedRawMaterials';
import Products from './pages/Products';
import Customers from './pages/Customers';
import ExpenseTracker from './pages/ExpenseTracker';
import Reports from './pages/Reports';
import EmployeeManagement from './pages/EmployeeManagement';
import Scrap from './pages/Scrap';
import PVCMaterials from './pages/PVCMaterials';
import Billing from './pages/Billing';
import CustomKhata from './pages/CustomKhata';
import MainLayout from './components/Layout/MainLayout';
import { useAuthStore } from './store/useAuthStore';

// Component to log current route
function RouteLogger() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  console.log('📍 Current route:', location.pathname);
  console.log('📍 Location state:', location.state);
  
  // Force navigation to /login if not authenticated and not already on /login
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      console.log('🔄 Redirecting to /login (not authenticated)');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);
  
  return null;
}

function App() {
  console.log('📱 App component rendering...');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  console.log('🔐 Authentication status:', isAuthenticated);
  console.log('🌐 Window location:', window.location.href);
  console.log('🌐 Window pathname:', window.location.pathname);
  console.log('🌐 Window hash:', window.location.hash);

  return (
    <HashRouter>
      <RouteLogger />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Navigate to="/dashboard" replace />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/stock"
          element={
            isAuthenticated ? (
              <MainLayout>
                <StockManagement />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/raw-materials"
          element={
            isAuthenticated ? (
              <MainLayout>
                <RawMaterials />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/processed-materials"
          element={
            isAuthenticated ? (
              <MainLayout>
                <ProcessedRawMaterials />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/products"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Products />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/customers"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Customers />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/expenses"
          element={
            isAuthenticated ? (
              <MainLayout>
                <ExpenseTracker />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Reports />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/employees"
          element={
            isAuthenticated ? (
              <MainLayout>
                <EmployeeManagement />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/scrap"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Scrap />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pvc-materials"
          element={
            isAuthenticated ? (
              <MainLayout>
                <PVCMaterials />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/billing"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Billing />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/custom-khata"
          element={
            isAuthenticated ? (
              <MainLayout>
                <CustomKhata />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Catch-all route for debugging */}
        <Route
          path="*"
          element={
            <div>
              <h1>404 - Route not found</h1>
              <p>Current path: {window.location.pathname}</p>
              <p>Is authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              {!isAuthenticated && <Navigate to="/login" replace />}
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
