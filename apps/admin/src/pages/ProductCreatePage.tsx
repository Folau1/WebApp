import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ProductCreatePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
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

  const [images, setImages] = useState<Array<{url: string, file?: File}>>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

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

  const handleFileUpload = async (files: File[]) => {
    setUploadingImages(true);
    
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

      // Загружаем каждый файл
      const uploadPromises = files.map(async (file) => {
        // Получаем presigned URL
        const presignResponse = await fetch('http://localhost:3000/api/media/presign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            kind: 'IMAGE'
          })
        });

        if (!presignResponse.ok) {
          throw new Error('Ошибка получения URL для загрузки');
        }

        const { uploadUrl, publicUrl } = await presignResponse.json();

        // Загружаем файл
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });

        if (!uploadResponse.ok) {
          throw new Error('Ошибка загрузки файла');
        }

        return { url: publicUrl, file };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedImages]);
    } catch (err) {
      alert('Ошибка загрузки изображений: ' + (err as Error).message);
      console.error('Error uploading images:', err);
    } finally {
      setUploadingImages(false);
    }
  };

  const addImageUrl = () => {
    const url = prompt('Введите URL изображения:');
    if (url && url.trim()) {
      setImages(prev => [...prev, { url: url.trim() }]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

    setLoading(true);
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

      // Создаем товар
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

      const response = await fetch('http://localhost:3000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка создания товара');
      }

      const result = await response.json();
      const productId = result.product.id;

      // Добавляем изображения
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await fetch('http://localhost:3000/api/admin/media', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              productId,
              url: images[i],
              kind: 'IMAGE',
              order: i
            })
          });
        }
      }

      alert('Товар успешно создан!');
      window.location.href = '/products';
    } catch (err) {
      setError('Не удалось создать товар: ' + (err as Error).message);
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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
              Создание товара
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
                
                {/* Загрузка файлов */}
                <FileUpload
                  onUpload={handleFileUpload}
                  accept="image/*"
                  multiple={true}
                  maxFiles={10}
                />

                {/* Альтернативный способ - URL */}
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={addImageUrl}
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
                    + Добавить по URL
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
                            {image.file ? image.file.name : image.url}
                          </div>
                          {image.file && (
                            <div style={{ 
                              fontSize: '0.75rem',
                              color: '#10b981',
                              marginTop: '0.25rem'
                            }}>
                              ✓ Загружено с компьютера
                            </div>
                          )}
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
                onClick={() => window.location.href = '/products'}
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
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.75rem 1.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {loading ? 'Создание...' : 'Создать товар'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductCreatePage;