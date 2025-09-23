import { Link } from 'react-router-dom';
import { useState } from 'react';
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
  const [imageError, setImageError] = useState(false);
  
  const isInCart = cart.some(item => item.productId === product.id);
  const thumbnail = product.media.find(m => m.kind === 'IMAGE')?.url || '/placeholder.png';
  const hasDiscount = product.compareAt && product.compareAt > product.finalPrice;
  const discountPercentage = hasDiscount ? Math.round(((product.compareAt - product.finalPrice) / product.compareAt) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isInCart && product.stock > 0) {
      addToCart(product);
      hapticFeedback('notification', 'success');
    }
  };

  
  const isOutOfStock = product.stock === 0;

  return (
    <Link to={`/product/${product.slug}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02] active:scale-[0.98]">
        {/* Изображение товара */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {!imageError ? (
            <img 
              src={thumbnail} 
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Скидка */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              -{discountPercentage}%
            </div>
          )}
          
          {/* Статус наличия */}
          <div className="absolute top-2 right-2">
            {isOutOfStock ? (
              <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Нет в наличии
              </div>
            ) : product.stock <= 5 ? (
              <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Осталось {product.stock}
              </div>
            ) : (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                В наличии
              </div>
            )}
          </div>
        </div>
        
        {/* Контент карточки */}
        <div className="p-3">
          {/* Название товара */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
            {product.title}
          </h3>
          
          {/* Описание (если есть) */}
          {product.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          
          {/* Цена и кнопка */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-base text-gray-900">
                  {formatPrice(product.finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.compareAt)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span className="text-xs text-red-500 font-medium">
                  Экономия {formatPrice(product.compareAt - product.finalPrice)}
                </span>
              )}
            </div>
            
            {/* Кнопка добавления в корзину */}
            <button
              onClick={handleAddToCart}
              className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isInCart 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 active:scale-95'
              }`}
              disabled={isInCart || isOutOfStock}
            >
              {isInCart ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

