import { useStore } from '../store';
import { useTelegram } from '../hooks/useTelegram';
import { formatPrice } from '../utils/format';
import type { CartItem as CartItemType } from '../types/api';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateCartItemQty, removeFromCart } = useStore();
  const { hapticFeedback } = useTelegram();
  const { product, qty } = item;
  
  const thumbnail = product.media.find(m => m.kind === 'IMAGE')?.url || '/placeholder.png';

  const handleIncrease = () => {
    updateCartItemQty(product.id, qty + 1);
    hapticFeedback('impact', 'light');
  };

  const handleDecrease = () => {
    if (qty > 1) {
      updateCartItemQty(product.id, qty - 1);
      hapticFeedback('impact', 'light');
    }
  };

  const handleRemove = () => {
    removeFromCart(product.id);
    hapticFeedback('notification', 'warning');
  };

  return (
    <div className="card flex gap-3">
      {/* Image */}
      <img
        src={thumbnail}
        alt={product.title}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-medium text-telegram-text mb-1 line-clamp-2">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-telegram-text font-medium">
              {formatPrice(product.finalPrice * qty)}
            </p>
            <p className="text-sm text-telegram-hint">
              {formatPrice(product.finalPrice)} × {qty}
            </p>
          </div>

          {/* Quantity controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 rounded-lg bg-telegram-secondary-bg flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <span className="w-8 text-center font-medium text-telegram-text">
              {qty}
            </span>
            
            <button
              onClick={handleIncrease}
              className="w-8 h-8 rounded-lg bg-telegram-secondary-bg flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <button
              onClick={handleRemove}
              className="w-8 h-8 rounded-lg bg-telegram-secondary-bg flex items-center justify-center hover:opacity-80 transition-opacity ml-2 text-telegram-destructive-text"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
