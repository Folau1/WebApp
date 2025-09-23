import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../lib/api';
import { useTelegram } from '../hooks/useTelegram';
import { formatPrice, formatDate, formatOrderStatus } from '../utils/format';
import LoadingScreen from '../components/LoadingScreen';
import type { Order } from '../types/api';

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
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
    const loadOrder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await orderApi.getOrder(id);
        setOrder(data);
      } catch (error) {
        console.error('Failed to load order:', error);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CANCELED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'FULFILLED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!order) {
    return null;
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-telegram-text mb-2">
          Заказ №{order.number}
        </h1>
        <p className="text-sm text-telegram-hint mb-3">
          {formatDate(order.createdAt)}
        </p>
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {formatOrderStatus(order.status)}
        </span>
      </div>

      {/* Items */}
      <div className="card mb-6">
        <h3 className="font-medium text-telegram-text mb-3">Товары</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              {item.product?.media?.[0] && (
                <img
                  src={item.product.media[0].url}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-telegram-text line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-sm text-telegram-hint">
                  {item.qty} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="font-medium text-telegram-text">
                {formatPrice(item.subtotal)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h3 className="font-medium text-telegram-text mb-3">Итого</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-telegram-text">
            <span>Товары</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Скидка</span>
              <span>−{formatPrice(order.discountTotal)}</span>
            </div>
          )}
          
          <div className="pt-2 border-t border-telegram-hint/20">
            <div className="flex justify-between text-lg font-semibold text-telegram-text">
              <span>Итого</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment info */}
      {order.status === 'PENDING' && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-400 text-center">
            Заказ ожидает оплаты
          </p>
        </div>
      )}

      {order.status === 'PAID' && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-400 text-center">
            Заказ успешно оплачен
          </p>
        </div>
      )}
    </div>
  );
}






