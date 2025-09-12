import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { useTelegram } from '../hooks/useTelegram';
import type { Product } from '../types/api';
import { formatPrice } from '../utils/format';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cart } = useStore();
  const { hapticFeedback } = useTelegram();
  
  const isInCart = cart.some(item => item.productId === product.id);
  const thumbnail = product.media.find(m => m.kind === 'IMAGE')?.url || '/placeholder.png';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isInCart) {
      addToCart(product);
      hapticFeedback('notification', 'success');
    }
  };

  return (
    <Link to={`/product/${product.slug}`} className="block">
      <div className="card hover:shadow-md transition-shadow">
        <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-telegram-secondary-bg">
          <img 
            src={thumbnail} 
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {product.discount && (
            <span className="absolute top-2 right-2 badge badge-discount">
              -{product.discount.percentage}%
            </span>
          )}
        </div>
        
        <h3 className="font-medium text-telegram-text mb-1 line-clamp-2">
          {product.title}
        </h3>
        
        {product.description && (
          <p className="text-sm text-telegram-hint mb-2 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-telegram-text">
              {formatPrice(product.finalPrice)}
            </span>
            {product.compareAt && product.compareAt > product.finalPrice && (
              <span className="text-sm text-telegram-hint line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className={`p-2 rounded-lg transition-colors ${
              isInCart 
                ? 'bg-green-500 text-white' 
                : 'bg-telegram-button text-telegram-button-text hover:opacity-90'
            }`}
            disabled={isInCart}
          >
            {isInCart ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
