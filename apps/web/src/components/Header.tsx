import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useTelegram } from '../hooks/useTelegram';

export default function Header() {
  const navigate = useNavigate();
  const { cart, user } = useStore();
  const { hapticFeedback } = useTelegram();
  const itemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCartClick = () => {
    hapticFeedback('impact', 'light');
    navigate('/cart');
  };

  const handleOrdersClick = () => {
    hapticFeedback('impact', 'light');
    navigate('/orders');
  };

  return (
    <header className="sticky top-0 z-50 bg-telegram-header-bg border-b border-telegram-hint/20">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-telegram-text">
          Shop
        </Link>
        
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={handleOrdersClick}
              className="p-2 rounded-lg hover:bg-telegram-secondary-bg transition-colors"
            >
              <svg className="w-6 h-6 text-telegram-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          )}
          
          <button
            onClick={handleCartClick}
            className="p-2 rounded-lg hover:bg-telegram-secondary-bg transition-colors relative"
          >
            <svg className="w-6 h-6 text-telegram-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {itemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-telegram-button text-telegram-button-text text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {itemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
