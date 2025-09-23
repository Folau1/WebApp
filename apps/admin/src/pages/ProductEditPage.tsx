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

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ProductEditPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    compareAt: '',
    stock: '0',
    categoryId: '',
      active: true
  });

  const [images, setImages] = useState<Array<{id?: string, url: string, order: number}>>([]);

  const productId = window.location.pathname.split('/')[2]; // /products/:id/edit

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

      // Получаем товар
      const response = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Товар не найден');
      }
      const data = await response.json();
      const productData = data.product;
      
      setProduct(productData);
      setFormData({
        title: productData.title,
        slug: productData.slug,
        description: productData.description || '',
        price: (productData.price / 100).toString(), // конвертируем из копеек
        compareAt: productData.compareAt ? (productData.compareAt / 100).toString() : '',
        stock: productData.stock.toString(),
        categoryId: productData.categoryId,
        active: productData.active
      });
      
      // Загружаем изображения
      setImages(productData.media.map((media: any) => ({
        id: media.id,
        url: media.url,
        order: media.order
      })));
      
    } catch (err) {
      setError('Не удалось загрузить товар');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
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

      // Теперь получаем категории с правильным токеном
      const response = await fetch('http://localhost:3000/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки категорий');
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      console.error('Error loading categories:', err);
      // Не показываем ошибку для категорий, так как это не критично
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: generateSlug(value)
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addImageUrl = () => {
    const url = prompt('Введите URL изображения:');
    if (url && url.trim()) {
      const newOrder = Math.max(...images.map(img => img.order), -1) + 1;
      setImages(prev => [...prev, { url: url.trim(), order: newOrder }]);
    }
  };

  const removeImage = async (index: number) => {
    const image = images[index];
    
    // Если у изображения есть ID, удаляем его с сервера
    if (image.id) {
      try {
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

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          const token = loginData.token;

          await fetch(`http://localhost:3000/api/admin/media/${image.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
    
    // Удаляем из локального состояния
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    // Обновляем порядок
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      order: index
    }));
    
    setImages(updatedImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.price || !formData.categoryId) {
      alert('Заполните все обязательные поля');
      return;
    }

    // Валидация цен
    const price = parseFloat(formData.price);
    const compareAt = formData.compareAt ? parseFloat(formData.compareAt) : null;
    
    if (compareAt && compareAt <= price) {
      alert('Старая цена должна быть больше текущей цены');
      return;
    }

    // Валидация количества
    const stock = parseInt(formData.stock);
    if (stock < 0) {
      alert('Количество не может быть отрицательным');
      return;
    }

    setSaving(true);
    setError(null);

    try {
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

      // Обновляем товар
      const productData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || undefined,
        price: parseInt(formData.price) * 100, // конвертируем в копейки
        compareAt: formData.compareAt ? parseInt(formData.compareAt) * 100 : undefined,
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId,
        active: formData.active
      };

      const response = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления товара');
      }

      // Обновляем изображения
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        if (!image.id) {
          // Новое изображение - создаем
          await fetch('http://localhost:3000/api/admin/media', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              productId,
              url: image.url,
              kind: 'IMAGE',
              order: i
            })
          });
        } else {
          // Существующее изображение - обновляем порядок
          await fetch(`http://localhost:3000/api/admin/media/${image.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              order: i
            })
          });
        }
      }

      alert('Товар успешно обновлен!');
      window.location.href = `/products/${productId}`;
    } catch (err) {
      setError('Не удалось обновить товар: ' + (err as Error).message);
      console.error('Error updating product:', err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadCategories();
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
              onClick={() => window.location.href = `/products/${productId}`}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              ← Назад к товару
            </button>
            <h1 style={{ 
              margin: 0, 
              color: '#1f2937',
              fontSize: '1.5rem',
              display: 'inline'
            }}>
              Редактирование: {product.title}
      </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 1rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Основная информация */}
              <div>
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#1f2937',
                  fontSize: '1.125rem'
                }}>
                  Основная информация
                </h3>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Название товара *
                    </label>
              <input
                type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                      required
                    />
            </div>

            <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      URL-адрес (slug) *
                    </label>
              <input
                type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Описание
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
            </div>

            <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Категория *
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '1rem'
                        }}
                        required
                      >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
                      <button
                        type="button"
                        onClick={() => window.open('/categories', '_blank')}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap'
                        }}
                        title="Управление категориями"
                      >
                        Управление
                      </button>
                    </div>
                    {categories.length === 0 && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        color: '#92400e'
                      }}>
                        Категории не найдены. 
                        <button
                          type="button"
                          onClick={() => window.open('/categories', '_blank')}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            marginLeft: '0.25rem'
                          }}
                        >
                          Создать категорию
                        </button>
                      </div>
              )}
            </div>
                </div>
            </div>

              {/* Цены и количество */}
              <div>
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#1f2937',
                  fontSize: '1.125rem'
                }}>
                  Цены и количество
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Цена (руб.) *
                    </label>
                <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                      required
                    />
            </div>

            <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Старая цена (руб.)
                    </label>
              <input
                type="number"
                      name="compareAt"
                      value={formData.compareAt}
                      onChange={handleInputChange}
                      min="0"
                step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
            </div>

            <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Количество
                    </label>
              <input
                type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                min="0"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
            </div>
          </div>
        </div>

              {/* Изображения */}
              <div>
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#1f2937',
                  fontSize: '1.125rem'
                }}>
                  Изображения
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={addImageUrl}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.75rem 1.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    + Добавить изображение
                  </button>
          </div>

                {images.length > 0 && (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {images.map((image, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
                            type="button"
                            onClick={() => index > 0 && reorderImages(index, index - 1)}
                            disabled={index === 0}
                            style={{
                              backgroundColor: index === 0 ? '#e5e7eb' : '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.25rem',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            ↑
          </button>
          <button
            type="button"
                            onClick={() => index < images.length - 1 && reorderImages(index, index + 1)}
                            disabled={index === images.length - 1}
                            style={{
                              backgroundColor: index === images.length - 1 ? '#e5e7eb' : '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.25rem',
                              cursor: index === images.length - 1 ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            ↓
                          </button>
                        </div>
                        
                        <img
                          src={image.url}
                          alt={`Изображение ${index + 1}`}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            wordBreak: 'break-all'
                          }}>
                            {image.url}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            marginTop: '0.25rem'
                          }}>
                            Порядок: {index + 1}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Статус */}
              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#374151',
                  fontWeight: '500'
                }}>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  Товар активен
                </label>
              </div>
            </div>

            {/* Кнопки */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '2rem',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => window.location.href = `/products/${productId}`}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
          >
            Отмена
          </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  backgroundColor: saving ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.75rem 1.5rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
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

export default ProductEditPage;