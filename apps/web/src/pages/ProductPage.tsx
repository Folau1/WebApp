import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogApi } from '../lib/api';
import { useStore } from '../store';
import { useTelegram } from '../hooks/useTelegram';
import MediaViewer from '../components/MediaViewer';
import LoadingScreen from '../components/LoadingScreen';
import { formatPrice } from '../utils/format';
import type { Product } from '../types/api';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useStore();
  const { showBackButton, hideBackButton, onBackButtonClick, hapticFeedback } = useTelegram();

  const isInCart = product ? cart.some(item => item.productId === product.id) : false;

  useEffect(() => {
    showBackButton();
    const cleanup = onBackButtonClick(() => navigate(-1));
    
    return () => {
      hideBackButton();
      cleanup?.();
    };
  }, [navigate, showBackButton, hideBackButton, onBackButtonClick]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const data = await catalogApi.getProduct(slug);
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (!product || isInCart || product.stock === 0) return;
    
    addToCart(product);
    hapticFeedback('notification', 'success');
  };
  
  const isOutOfStock = product?.stock === 0;

  const handleGoToCart = () => {
    hapticFeedback('impact', 'light');
    navigate('/cart');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      {/* Media */}
      <div className="bg-gray-900 px-4 pt-4">
        <MediaViewer media={product.media} disableModal={true} />
      </div>

      {/* Content */}
      <div className="bg-gray-900 relative z-10">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
            {product.title}
          </h1>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-bold text-blue-400">
                {formatPrice(product.finalPrice)}
              </span>
              
              {product.compareAt && product.compareAt > product.finalPrice && (
                <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
                  -{Math.round(((product.compareAt - product.finalPrice) / product.compareAt) * 100)}%
                </span>
              )}
            </div>
            
            {product.compareAt && product.compareAt > product.finalPrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="mb-6">
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="font-semibold">Нет в наличии</span>
              </div>
            ) : product.stock <= 5 ? (
              <div className="flex items-center gap-2 text-orange-400">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="font-semibold">Осталось: {product.stock} шт.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-semibold">В наличии ({product.stock} шт.)</span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-white leading-relaxed text-base">
                  {product.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add to cart button */}
      <div className="fixed bottom-16 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="max-w-sm mx-auto">
          {isInCart ? (
            <button
              onClick={handleGoToCart}
              className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Перейти в корзину
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-colors ${
                isOutOfStock 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
              }`}
            >
              {isOutOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
