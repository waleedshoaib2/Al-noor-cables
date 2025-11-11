import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import StockManagement from './pages/StockManagement';
import RawMaterials from './pages/RawMaterials';
import ExpenseTracker from './pages/ExpenseTracker';
import Reports from './pages/Reports';
import MainLayout from './components/Layout/MainLayout';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
