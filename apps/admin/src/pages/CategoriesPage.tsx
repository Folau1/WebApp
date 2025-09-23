import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    name: string;
  };
  _count?: {
    products: number;
    children: number;
  };
}

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
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
      setError('Не удалось загрузить категории: ' + (err as Error).message);
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setNewCategoryName(name);
    setNewCategorySlug(generateSlug(name));
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Введите название категории');
      return;
    }

    setSaving(true);
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

      // Создаем категорию
      const response = await fetch('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          slug: newCategorySlug.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка создания категории');
      }

      // Очищаем форму и обновляем список
      setNewCategoryName('');
      setNewCategorySlug('');
      setShowAddForm(false);
      await loadCategories();
    } catch (err) {
      alert('Не удалось создать категорию: ' + (err as Error).message);
      console.error('Error creating category:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить категорию "${categoryName}"?`)) {
      return;
    }

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

      // Удаляем категорию
      const response = await fetch(`http://localhost:3000/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления категории');
      }

      // Обновляем список
      await loadCategories();
    } catch (err) {
      alert('Не удалось удалить категорию: ' + (err as Error).message);
      console.error('Error deleting category:', err);
    }
  };

  useEffect(() => {
    loadCategories();
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
          <p style={{ color: '#6b7280' }}>Загрузка категорий...</p>
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
            onClick={loadCategories}
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
              Управление категориями
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
              Список категорий ({categories.length})
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
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
              + Добавить категорию
            </button>
          </div>

          {/* Форма добавления категории */}
          {showAddForm && (
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ 
                margin: '0 0 1rem 0', 
                color: '#1f2937',
                fontSize: '1.125rem'
              }}>
                Добавить новую категорию
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr auto' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    Название категории *
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Введите название"
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
                    URL-адрес (slug) *
                  </label>
                  <input
                    type="text"
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                    placeholder="url-adres"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem' }}>
                  <button
                    onClick={addCategory}
                    disabled={saving || !newCategoryName.trim()}
                    style={{
                      backgroundColor: saving || !newCategoryName.trim() ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.75rem 1.5rem',
                      cursor: saving || !newCategoryName.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {saving ? 'Создание...' : 'Создать'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategoryName('');
                      setNewCategorySlug('');
                    }}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Список категорий */}
          {categories.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#6b7280' }}>Категории не найдены</p>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Создать первую категорию
              </button>
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
                      Название
                    </th>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      URL-адрес
                    </th>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Товаров
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
                  {categories.map((category) => (
                    <tr key={category.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div>
                          <div style={{ 
                            fontWeight: '500', 
                            color: '#1f2937',
                            marginBottom: '0.25rem'
                          }}>
                            {category.name}
                          </div>
                          {category.parent && (
                            <div style={{ 
                              color: '#6b7280', 
                              fontSize: '0.75rem'
                            }}>
                              Родительская: {category.parent.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#374151' }}>
                        {category.slug}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{ 
                          color: '#1f2937',
                          fontWeight: '500'
                        }}>
                          {category._count?.products || 0}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => deleteCategory(category.id, category.name)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                          title="Удалить категорию"
                        >
                          🗑️
                        </button>
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

export default CategoriesPage;