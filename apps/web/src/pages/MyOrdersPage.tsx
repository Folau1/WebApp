import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { formatPrice } from '../utils/format';
import api from '../lib/api';

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  title: string;
  product: {
    id: string;
    title: string;
    media: Array<{ url: string; kind: string }>;
  };
}

interface Order {
  id: string;
  number: number;
  totalAmount: number;
  discountTotal: number;
  status: string;
  address: {
    city: string;
    index: string;
    street: string;
    house: string;
    apartment?: string;
    note?: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { showBackButton, hideBackButton, onBackButtonClick } = useTelegram();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    showBackButton();
    const cleanup = onBackButtonClick(() => navigate('/profile'));
    
    loadOrders();
    
    return () => {
      hideBackButton();
      cleanup?.();
    };
  }, [navigate, showBackButton, hideBackButton, onBackButtonClick]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем заказы пользователя через Telegram API
      const response = await api.get('/orders/my');
      setOrders(response.data.orders || []);
    } catch (err) {
      setError('Не удалось загрузить заказы: ' + (err as Error).message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Ожидает';
      case 'CONFIRMED': return 'Подтвержден';
      case 'SHIPPED': return 'Отправлен';
      case 'DELIVERED': return 'Доставлен';
      case 'CANCELLED': return 'Отменен';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-sm mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 text-center">
              📦 Мои заказы
            </h1>
          </div>
        </div>
        
        <div className="max-w-sm mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse"></div>
            <p className="text-gray-500">Загрузка заказов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-sm mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 text-center">
              📦 Мои заказы
            </h1>
          </div>
        </div>
        
        <div className="max-w-sm mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadOrders}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-sm mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 text-center">
            📦 Мои заказы
          </h1>
        </div>
      </div>

      {/* Список заказов */}
      <div className="max-w-sm mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Заказов пока нет</h2>
            <p className="text-gray-500 mb-6">Когда вы сделаете первый заказ, он появится здесь</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Перейти в магазин
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                {/* Заголовок заказа */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Заказ #{order.number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Товары */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Товары:
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={item.product.media.find(m => m.kind === 'IMAGE')?.url || '/placeholder.png'}
                          alt={item.product.title}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} шт. × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Адрес */}
                {order.address && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Адрес доставки:
                    </h4>
                    <p className="text-sm text-gray-600">
                      {order.address.city}, {order.address.index}, {order.address.street}, д. {order.address.house}
                      {order.address.apartment && `, кв. ${order.address.apartment}`}
                    </p>
                  </div>
                )}

                {/* Кнопка повторить заказ */}
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Повторить заказ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
