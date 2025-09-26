import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../lib/api';
import { useTelegram } from '../hooks/useTelegram';
import { formatPrice, formatDate, formatOrderStatus } from '../utils/format';
import type { Order } from '../types/api';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showBackButton, hideBackButton, onBackButtonClick } = useTelegram();

  useEffect(() => {
    showBackButton();
    const cleanup = onBackButtonClick(() => navigate(-1));
    
    return () => {
      hideBackButton();
      cleanup?.();
    };
  }, [navigate, showBackButton, hideBackButton, onBackButtonClick]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 dark:text-green-400';
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'CANCELED':
        return 'text-red-600 dark:text-red-400';
      case 'FULFILLED':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-telegram-text';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-telegram-button border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <svg className="w-24 h-24 text-telegram-hint mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h2 className="text-xl font-medium text-telegram-text mb-2">Нет заказов</h2>
        <p className="text-telegram-hint text-center mb-6">
          Вы ещё не сделали ни одного заказа
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Перейти к покупкам
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-semibold text-telegram-text mb-4">Мои заказы</h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="card block hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-telegram-text">
                  Заказ №{order.number}
                </h3>
                <p className="text-sm text-telegram-hint">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                {formatOrderStatus(order.status)}
              </span>
            </div>

            <div className="flex justify-between items-end">
              <p className="text-sm text-telegram-hint">
                {order.items.length} товар{order.items.length === 1 ? '' : 'ов'}
              </p>
              <p className="font-medium text-telegram-text">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}








