import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentApi } from '../lib/api';
import { useTelegram } from '../hooks/useTelegram';
import LoadingScreen from '../components/LoadingScreen';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const { showMainButton, hideMainButton } = useTelegram();

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!paymentId) {
        setStatus('error');
        return;
      }

      try {
        const data = await paymentApi.checkStatus(paymentId);
        
        if (data.paid) {
          setStatus('success');
        } else {
          setStatus('pending');
          // Check again after 3 seconds
          setTimeout(checkPaymentStatus, 3000);
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, [paymentId]);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const cleanup = showMainButton(
        status === 'success' ? 'Перейти к заказам' : 'На главную',
        () => navigate(status === 'success' ? '/orders' : '/')
      );
      return cleanup;
    } else {
      hideMainButton();
    }
  }, [status, navigate, showMainButton, hideMainButton]);

  if (status === 'loading' || status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <LoadingScreen />
        <p className="text-telegram-hint mt-4">
          {status === 'pending' ? 'Ожидаем подтверждение оплаты...' : 'Проверяем статус платежа...'}
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-telegram-text mb-2">
          Ошибка оплаты
        </h2>
        <p className="text-telegram-hint text-center mb-6">
          Не удалось обработать платёж. Попробуйте ещё раз или обратитесь в поддержку.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-telegram-text mb-2">
        Оплата прошла успешно!
      </h2>
      
      <p className="text-telegram-hint text-center mb-6">
        Спасибо за ваш заказ. Мы отправили подтверждение в Telegram.
      </p>

      {orderId && (
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="btn-secondary"
        >
          Посмотреть заказ
        </button>
      )}
    </div>
  );
}






