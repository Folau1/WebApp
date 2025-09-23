import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { authApi } from './lib/api';
import { useTelegram } from './hooks/useTelegram';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrdersPage from './pages/OrdersPage';
import OrderPage from './pages/OrderPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import DiscountsPage from './pages/DiscountsPage';
import ProfilePage from './pages/ProfilePage';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { setUser, setLoading, isLoading } = useStore();
  const { tg } = useTelegram();

  useEffect(() => {
    const initAuth = async () => {
      if (!tg?.initData) {
        console.warn('No Telegram init data');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const user = await authApi.validateTelegram();
        setUser(user);
      } catch (error) {
        console.error('Auth failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [tg, setUser, setLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="my-orders" element={<MyOrdersPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderPage />} />
        <Route path="payment/success" element={<PaymentSuccessPage />} />
        <Route path="discounts" element={<DiscountsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

