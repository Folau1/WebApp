import { Routes, Route, Navigate } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductEditPage from './pages/ProductEditPage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';

// Простая страница логина без сложных компонентов
function SimpleLoginPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          color: '#1f2937',
          fontSize: '1.5rem'
        }}>
          Вход в админ-панель
        </h2>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          // Простая проверка
          const email = (e.target as any).email.value;
          const password = (e.target as any).password.value;
          
          if (email === 'admin@example.com' && password === 'admin123') {
            localStorage.setItem('adminToken', 'fake-token');
            window.location.href = '/';
          } else {
            alert('Неверные данные');
          }
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: '#374151',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              defaultValue="admin@example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: '#374151',
              fontWeight: '500'
            }}>
              Пароль
            </label>
            <input
              name="password"
              type="password"
              defaultValue="admin123"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}

// Простая главная страница
function SimpleDashboard() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: '#1f2937',
          fontSize: '1.5rem'
        }}>
          Админ-панель
        </h1>
      </div>
      
      <div style={{ padding: '0 1rem' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            marginTop: 0, 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Добро пожаловать в админ-панель!
          </h2>
          
          <p style={{ 
            color: '#6b7280',
            marginBottom: '2rem'
          }}>
            Управляйте товарами, категориями и заказами.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.href = '/products'}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Товары
            </button>
            
            <button
              onClick={() => window.location.href = '/categories'}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Категории
            </button>
            
            <button
              onClick={() => window.location.href = '/orders'}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Заказы
            </button>
            
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/login';
              }}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const isAuthenticated = !!localStorage.getItem('adminToken');

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <SimpleLoginPage />
      } />
      
      <Route path="/" element={
        isAuthenticated ? <SimpleDashboard /> : <Navigate to="/login" replace />
      } />
      
      <Route path="/products" element={
        isAuthenticated ? <ProductsPage /> : <Navigate to="/login" replace />
      } />
      
      <Route path="/products/new" element={
        isAuthenticated ? <ProductCreatePage /> : <Navigate to="/login" replace />
      } />
      
      <Route path="/products/:id" element={
        isAuthenticated ? <ProductDetailPage /> : <Navigate to="/login" replace />
      } />
      
      <Route path="/products/:id/edit" element={
        isAuthenticated ? <ProductEditPage /> : <Navigate to="/login" replace />
      } />
      
      <Route path="/categories" element={
        isAuthenticated ? <CategoriesPage /> : <Navigate to="/login" replace />
      } />
      
      <Route path="/orders" element={
        isAuthenticated ? <OrdersPage /> : <Navigate to="/login" replace />
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;