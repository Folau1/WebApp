import { Routes, Route, Navigate } from 'react-router-dom';
import { authApi } from './lib/api';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductEditPage from './pages/ProductEditPage';
import CategoriesPage from './pages/CategoriesPage';
import DiscountsPage from './pages/DiscountsPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  const isAuthenticated = authApi.isAuthenticated();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductEditPage />} />
          <Route path="products/:id/edit" element={<ProductEditPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="discounts" element={<DiscountsPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
