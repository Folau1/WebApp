import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  compareAt?: number;
  stock: number;
  categoryId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  media: Array<{
    id: string;
    url: string;
    order: number;
  }>;
  category: {
    id: string;
    name: string;
  };
}

function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const productId = window.location.pathname.split('/').pop();

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      // Сначала получаем токен
      const loginResponse = await fetch('http://localhost:3000/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Ошибка авторизации');
      }

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Теперь получаем товар с правильным токеном
      const response = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Товар не найден');
      }
      const data = await response.json();
      setProduct(data.product);
    } catch (err) {
      setError('Не удалось загрузить товар');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error || 'Товар не найден'}</p>
          <button
            onClick={() => window.location.href = '/products'}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <button
              onClick={() => window.location.href = '/products'}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              ← Назад к товарам
            </button>
            <h1 style={{ 
              margin: 0, 
              color: '#1f2937',
              fontSize: '1.5rem',
              display: 'inline'
            }}>
              {product.title}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => window.location.href = `/products/${product.id}/edit`}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Редактировать
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 1rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
            {/* Изображения */}
            <div>
              {product.media && product.media.length > 0 ? (
                <div>
                  {/* Главное изображение */}
                  <div style={{ marginBottom: '1rem' }}>
                    <img
                      src={product.media[currentImageIndex]?.url}
                      alt={product.title}
                      style={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                  </div>
                  
                  {/* Миниатюры */}
                  {product.media.length > 1 && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: `repeat(${Math.min(product.media.length, 4)}, 1fr)`,
                      gap: '0.5rem'
                    }}>
                      {product.media.map((media, index) => (
                        <button
                          key={media.id}
                          onClick={() => setCurrentImageIndex(index)}
                          style={{
                            border: currentImageIndex === index ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                            borderRadius: '4px',
                            padding: 0,
                            cursor: 'pointer',
                            overflow: 'hidden'
                          }}
                        >
                          <img
                            src={media.url}
                            alt={`${product.title} ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '80px',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '400px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  fontSize: '1.125rem'
                }}>
                  Нет изображений
                </div>
              )}
            </div>

            {/* Информация о товаре */}
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: '#1f2937',
                  fontSize: '1.875rem'
                }}>
                  {product.title}
                </h2>
                <p style={{ 
                  margin: 0, 
                  color: '#6b7280',
                  fontSize: '1rem'
                }}>
                  {product.slug}
                </p>
              </div>

              {/* Цены */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {formatPrice(product.price)}
                </div>
                {product.compareAt && product.compareAt > product.price && (
                  <div style={{ 
                    fontSize: '1.25rem',
                    color: '#6b7280',
                    textDecoration: 'line-through'
                  }}>
                    {formatPrice(product.compareAt)}
                  </div>
                )}
              </div>

              {/* Описание */}
              {product.description && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: '#1f2937',
                    fontSize: '1.125rem'
                  }}>
                    Описание
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: '#374151',
                    lineHeight: '1.6'
                  }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Детали */}
              <div style={{ 
                backgroundColor: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#1f2937',
                  fontSize: '1.125rem'
                }}>
                  Детали товара
                </h3>
                
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Категория:</span>
                    <span style={{ color: '#1f2937', fontWeight: '500' }}>
                      {product.category.name}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Количество:</span>
                    <span style={{ 
                      color: product.stock > 0 ? '#10b981' : '#ef4444',
                      fontWeight: '500'
                    }}>
                      {product.stock} шт.
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Статус:</span>
                    <span style={{ 
                      color: product.active ? '#10b981' : '#ef4444',
                      fontWeight: '500'
                    }}>
                      {product.active ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Создан:</span>
                    <span style={{ color: '#1f2937', fontWeight: '500' }}>
                      {formatDate(product.createdAt)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Обновлен:</span>
                    <span style={{ color: '#1f2937', fontWeight: '500' }}>
                      {formatDate(product.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Действия */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => window.location.href = `/products/${product.id}/edit`}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    flex: 1
                  }}
                >
                  Редактировать товар
                </button>
                
                <button
                  onClick={() => {
                    const newStock = prompt('Введите новое количество:', product.stock.toString());
                    if (newStock !== null && !isNaN(parseInt(newStock))) {
                      // Здесь можно добавить логику обновления количества
                      alert('Функция обновления количества будет добавлена');
                    }
                  }}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    flex: 1
                  }}
                >
                  Изменить количество
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ProductDetailPage;
