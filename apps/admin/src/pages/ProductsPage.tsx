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

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
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

      // Теперь получаем товары с правильным токеном
      const response = await fetch('http://localhost:3000/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки товаров');
      }
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError('Не удалось загрузить товары: ' + (err as Error).message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    // Валидация количества
    if (newStock < 0) {
      alert('Количество не может быть отрицательным');
      return;
    }

    try {
      // Сначала получаем реальный токен через логин
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

      // Теперь обновляем количество с правильным токеном
      const response = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления количества');
      }

      // Обновляем локальное состояние
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, stock: newStock } : product
      ));
      
      setEditingStock(null);
    } catch (err) {
      alert('Не удалось обновить количество товара: ' + (err as Error).message);
      console.error('Error updating stock:', err);
    }
  };

  const startEditingStock = (product: Product) => {
    setEditingStock(product.id);
    setStockValue(product.stock);
  };

  const cancelEditingStock = () => {
    setEditingStock(null);
    setStockValue(0);
  };

  const saveStock = () => {
    if (editingStock) {
      updateStock(editingStock, stockValue);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price / 100);
  };

  useEffect(() => {
    loadProducts();
  }, []);

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
          <p style={{ color: '#6b7280' }}>Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={loadProducts}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Попробовать снова
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
              onClick={() => window.location.href = '/'}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              ← Назад
            </button>
            <h1 style={{ 
              margin: 0, 
              color: '#1f2937',
              fontSize: '1.5rem',
              display: 'inline'
            }}>
              Управление товарами
            </h1>
          </div>
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

      {/* Content */}
      <div style={{ padding: '0 1rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '1.5rem', 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#1f2937',
              fontSize: '1.25rem'
            }}>
              Список товаров ({products.length})
            </h2>
            <button
              onClick={() => window.location.href = '/products/new'}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              + Добавить товар
            </button>
      </div>

      {products.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#6b7280' }}>Товары не найдены</p>
        </div>
      ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '0.875rem'
              }}>
              <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Товар
                    </th>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Категория
                    </th>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'right', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Цена
                    </th>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Количество
                    </th>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Действия
                    </th>
                </tr>
              </thead>
                <tbody>
                {products.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {product.media && product.media.length > 0 ? (
                        <img
                          src={product.media[0].url}
                          alt={product.title}
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #e5e7eb'
                              }}
                        />
                      ) : (
                            <div style={{
                              width: '48px',
                              height: '48px',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#9ca3af',
                              fontSize: '0.75rem'
                            }}>
                              Нет фото
                            </div>
                          )}
                          <div>
                            <div style={{ 
                              fontWeight: '500', 
                              color: '#1f2937',
                              marginBottom: '0.25rem'
                            }}>
                              {product.title}
                            </div>
                            <div style={{ 
                              color: '#6b7280', 
                              fontSize: '0.75rem'
                            }}>
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#374151' }}>
                        {product.category.name}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ color: '#1f2937', fontWeight: '500' }}>
                          {formatPrice(product.price)}
                        </div>
                        {product.compareAt && product.compareAt > product.price && (
                          <div style={{ 
                            color: '#6b7280', 
                            fontSize: '0.75rem',
                            textDecoration: 'line-through'
                          }}>
                            {formatPrice(product.compareAt)}
                        </div>
                      )}
                    </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {editingStock === product.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="number"
                              value={stockValue}
                              onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                              style={{
                                width: '80px',
                                padding: '0.25rem 0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '0.875rem'
                              }}
                            />
                            <button
                              onClick={saveStock}
                              style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEditingStock}
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              ✕
                            </button>
                      </div>
                        ) : (
                          <div style={{ 
                            color: product.stock > 0 ? '#10b981' : '#ef4444',
                            fontWeight: '500'
                          }}>
                            {product.stock} шт.
                          </div>
                      )}
                    </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => window.location.href = `/products/${product.id}`}
                            style={{
                              backgroundColor: '#8b5cf6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Просмотр
                          </button>
                        <button
                            onClick={() => startEditingStock(product)}
                            style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Количество
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
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

export default ProductsPage;