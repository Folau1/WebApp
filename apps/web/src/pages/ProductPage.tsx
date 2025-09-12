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
    if (!product || isInCart) return;
    
    addToCart(product);
    hapticFeedback('notification', 'success');
  };

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
    <div className="pb-20">
      {/* Media */}
      <MediaViewer media={product.media} />

      {/* Content */}
      <div className="px-4 py-4">
        <h1 className="text-xl font-semibold text-telegram-text mb-2">
          {product.title}
        </h1>

        {/* Price */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-telegram-text">
            {formatPrice(product.finalPrice)}
          </span>
          
          {product.compareAt && product.compareAt > product.finalPrice && (
            <>
              <span className="text-lg text-telegram-hint line-through">
                {formatPrice(product.compareAt)}
              </span>
              {product.discount && (
                <span className="badge badge-discount">
                  -{product.discount.percentage}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Category */}
        <div className="mb-4">
          <span className="text-sm text-telegram-hint">Категория: </span>
          <span className="text-sm text-telegram-link">{product.category.name}</span>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-telegram-text mb-2">Описание</h2>
            <p className="text-telegram-text whitespace-pre-wrap">{product.description}</p>
          </div>
        )}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-telegram-bg border-t border-telegram-hint/20">
        {isInCart ? (
          <button
            onClick={handleGoToCart}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Перейти в корзину
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full btn-primary"
          >
            Добавить в корзину
          </button>
        )}
      </div>
    </div>
  );
}
