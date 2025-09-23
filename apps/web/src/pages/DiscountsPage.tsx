import { useState, useEffect } from 'react';
import { catalogApi } from '../lib/api';
import type { Product } from '../types/api';
import { formatPrice } from '../utils/format';

export default function DiscountsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDiscountProducts();
  }, []);

  const loadDiscountProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await catalogApi.getProducts({});
      // Фильтруем товары со скидкой
      const discountProducts = response.products.filter(product => 
        product.compareAt && product.compareAt > product.finalPrice
      );
      setProducts(discountProducts);
    } catch (err) {
      console.error('Failed to load discount products:', err);
      setError('Не удалось загрузить товары со скидкой');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-sm mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка акций...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-sm mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadDiscountProducts}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-sm mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 text-center">
            🎉 Акции и скидки
          </h1>
        </div>
      </div>

      {/* Список товаров со скидкой */}
      <div className="max-w-sm mx-auto px-4 py-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">Нет активных акций</p>
            <p className="text-gray-400 text-sm mt-1">Следите за обновлениями!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product, index) => {
              const discountPercentage = Math.round(((product.compareAt - product.finalPrice) / product.compareAt) * 100);
              
              return (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Изображение товара */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img 
                      src={product.media.find(m => m.kind === 'IMAGE')?.url || '/placeholder.png'} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Скидка */}
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      -{discountPercentage}%
                    </div>
                  </div>
                  
                  {/* Контент карточки */}
                  <div className="p-3">
                    {/* Название товара */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
                      {product.title}
                    </h3>
                    
                    {/* Цена */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-base text-gray-900">
                          {formatPrice(product.finalPrice)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.compareAt)}
                      </span>
                      <span className="text-xs text-red-500 font-medium">
                        Экономия {formatPrice(product.compareAt - product.finalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
