import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useTelegram } from '../hooks/useTelegram';
import { discountApi, orderApi, paymentApi } from '../lib/api';
import CartItem from '../components/CartItem';
import { formatPrice } from '../utils/format';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, discount, setDiscount, getCartTotal, clearCart, user } = useStore();
  const { showBackButton, hideBackButton, onBackButtonClick, showMainButton, hideMainButton, showProgress, hideProgress, showAlert, hapticFeedback } = useTelegram();
  
  const [discountCode, setDiscountCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.product.finalPrice * item.qty), 0);
  const total = getCartTotal();
  const discountAmount = subtotal - total;

  useEffect(() => {
    showBackButton();
    const cleanup = onBackButtonClick(() => navigate(-1));
    
    return () => {
      hideBackButton();
      cleanup?.();
    };
  }, [navigate, showBackButton, hideBackButton, onBackButtonClick]);

  useEffect(() => {
    if (cart.length > 0) {
      const cleanup = showMainButton('Перейти к оформлению', () => navigate('/checkout'));
      return cleanup;
    } else {
      hideMainButton();
    }
  }, [cart, showMainButton, hideMainButton, navigate]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setDiscountLoading(true);
    setDiscountError('');
    
    try {
      const discountData = await discountApi.validate(discountCode);
      setDiscount(discountData);
      setDiscountCode('');
      hapticFeedback('notification', 'success');
    } catch (error) {
      setDiscountError('Неверный промокод');
      hapticFeedback('notification', 'error');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      showAlert('Необходимо войти в систему');
      return;
    }

    try {
      showProgress();
      
      // Create order
      const order = await orderApi.create({
        items: cart.map(item => ({
          productId: item.productId,
          qty: item.qty
        })),
        discountCode: discount?.code
      });

      // Create payment
      const payment = await paymentApi.createPayment(order.id);

      // Clear cart
      clearCart();

      // Open payment page
      window.open(payment.confirmationUrl, '_blank');
      
      // Navigate to success page
      navigate(`/payment/success?orderId=${order.id}&paymentId=${payment.paymentId}`);
    } catch (error) {
      console.error('Checkout failed:', error);
      showAlert('Ошибка при оформлении заказа');
    } finally {
      hideProgress();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <svg className="w-24 h-24 text-telegram-hint mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-xl font-medium text-telegram-text mb-2">Корзина пуста</h2>
        <p className="text-telegram-hint text-center mb-6">
          Добавьте товары, чтобы оформить заказ
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
    <div className="px-4 py-4 pb-32">
      <h1 className="text-xl font-semibold text-telegram-text mb-4">Корзина</h1>

      {/* Cart items */}
      <div className="space-y-3 mb-6">
        {cart.map((item) => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>

      {/* Discount code */}
      <div className="card mb-6">
        <h3 className="font-medium text-telegram-text mb-3">Промокод</h3>
        
        {discount ? (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                {discount.code}
              </p>
              <p className="text-sm text-green-600 dark:text-green-500">
                {discount.type === 'PERCENT' 
                  ? `Скидка ${discount.value}%`
                  : `Скидка ${formatPrice(discount.value)}`
                }
              </p>
            </div>
            <button
              onClick={() => setDiscount(null)}
              className="text-telegram-destructive-text"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Введите промокод"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="input flex-1"
              disabled={discountLoading}
            />
            <button
              onClick={handleApplyDiscount}
              disabled={discountLoading || !discountCode.trim()}
              className="btn-secondary"
            >
              {discountLoading ? 'Проверка...' : 'Применить'}
            </button>
          </div>
        )}
        
        {discountError && (
          <p className="text-sm text-telegram-destructive-text mt-2">{discountError}</p>
        )}
      </div>

      {/* Order summary */}
      <div className="card">
        <h3 className="font-medium text-telegram-text mb-3">Итого</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-telegram-text">
            <span>Товары ({cart.reduce((sum, item) => sum + item.qty, 0)})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Скидка</span>
              <span>−{formatPrice(discountAmount)}</span>
            </div>
          )}
          
          <div className="pt-2 border-t border-telegram-hint/20">
            <div className="flex justify-between text-lg font-semibold text-telegram-text">
              <span>К оплате</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка оформления заказа для браузера */}
      {cart.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full btn-primary"
          >
            Перейти к оформлению
          </button>
        </div>
      )}

    </div>
  );
}






