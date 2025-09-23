import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { hideBackButton, showMainButton, hideMainButton } = useTelegram();
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    hideBackButton();
    
    // Генерируем номер заказа на основе ID
    if (orderId) {
      const number = orderId.slice(-6).toUpperCase();
      setOrderNumber(number);
    }

    const cleanup = showMainButton('Вернуться в магазин', () => navigate('/'));
    return cleanup;
  }, [orderId, navigate, hideBackButton, showMainButton]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-sm mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
          {/* Иконка успеха */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Заказ оформлен!
          </h1>

          {/* Номер заказа */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Ваш заказ</p>
              <p className="text-3xl font-bold text-blue-600">#{orderNumber}</p>
              <p className="text-xs text-gray-500 mt-1">успешно оформлен</p>
            </div>
          </div>

          {/* Информация */}
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Заказ принят в обработку</p>
                <p className="text-sm text-gray-600">Мы получили ваш заказ и начали его готовить</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Время доставки</p>
                <p className="text-sm text-gray-600">Обычно 1-3 рабочих дня</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Уведомления</p>
                <p className="text-sm text-gray-600">Мы отправим вам SMS о статусе заказа</p>
              </div>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 mb-3">
              <strong>Спасибо за покупку!</strong> Если у вас есть вопросы, 
              свяжитесь с нашей службой поддержки.
            </p>
            <button
              onClick={() => navigate('/my-orders')}
              className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
            >
              Посмотреть мои заказы
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
