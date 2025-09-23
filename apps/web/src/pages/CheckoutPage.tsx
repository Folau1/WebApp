import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useTelegram } from '../hooks/useTelegram';
import { formatPrice } from '../utils/format';
import api from '../lib/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, discount, getCartTotal, clearCart, user } = useStore();
  const { showBackButton, hideBackButton, onBackButtonClick, showMainButton, hideMainButton, showProgress, hideProgress, showAlert, hapticFeedback } = useTelegram();
  
  const [addressData, setAddressData] = useState({
    city: '',
    index: '',
    street: '',
    house: '',
    apartment: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.finalPrice * item.qty), 0);
  const total = getCartTotal();
  const discountAmount = subtotal - total;

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    // Загружаем сохраненный адрес
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      try {
        const parsedAddress = JSON.parse(savedAddress);
        setAddressData(parsedAddress);
      } catch (e) {
        console.error('Error parsing saved address:', e);
      }
    }

    showBackButton();
    const cleanup = onBackButtonClick(() => navigate('/cart'));
    
    return () => {
      hideBackButton();
      cleanup?.();
    };
  }, [cart, navigate, showBackButton, hideBackButton, onBackButtonClick]);

  useEffect(() => {
    const cleanup = showMainButton('Оформить заказ', handleSubmit);
    return cleanup;
  }, [showMainButton]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Валидация формы
    if (!addressData.city || !addressData.index || !addressData.street || !addressData.house) {
      alert('Заполните все обязательные поля');
      return;
    }

    setLoading(true);

    try {
      // Создаем заказ
      const orderData = {
        items: cart.map(item => ({
          productId: item.product.id,
          qty: item.qty
        })),
        address: {
          city: addressData.city,
          index: addressData.index,
          street: addressData.street,
          house: addressData.house,
          apartment: addressData.apartment,
          note: addressData.note
        }
      };

      const response = await api.post('/orders', orderData);
      const { order } = response.data;
      
      // Очищаем корзину
      clearCart();
      
      // Переходим на страницу подтверждения
      navigate(`/order-success/${order.id}`);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Ошибка оформления заказа. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-sm mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 text-center">
            🛒 Оформление заказа
          </h1>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">
        {/* Адрес доставки */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🏠 Адрес доставки</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Город *
              </label>
              <input
                type="text"
                name="city"
                value={addressData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                placeholder="Введите город"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Индекс *
              </label>
              <input
                type="text"
                name="index"
                value={addressData.index}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                placeholder="Введите индекс"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Улица *
                </label>
                <input
                  type="text"
                  name="street"
                  value={addressData.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  placeholder="Улица"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дом *
                </label>
                <input
                  type="text"
                  name="house"
                  value={addressData.house}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  placeholder="Дом"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Квартира
              </label>
              <input
                type="text"
                name="apartment"
                value={addressData.apartment}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                placeholder="Квартира (необязательно)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Примечание
              </label>
              <textarea
                name="note"
                value={addressData.note}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                placeholder="Дополнительная информация для курьера"
              />
            </div>
          </div>
        </div>

        {/* Сводка заказа */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Сводка заказа</h2>
          
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.product.title}</p>
                  <p className="text-xs text-gray-500">{item.qty} шт. × {formatPrice(item.product.finalPrice)}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {formatPrice(item.product.finalPrice * item.qty)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Подытог:</span>
              <span className="text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            
            {discount && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Скидка:</span>
                <span className="text-green-600">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900">Итого:</span>
              <span className="text-blue-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Кнопка оформления заказа для браузера */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Оформляем заказ...' : 'Оформить заказ'}
          </button>
        </div>
      </div>
    </div>
  );
}
