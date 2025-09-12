import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi, mediaApi } from '../lib/api';
import { formatPrice } from '../utils/format';
import type { Product } from '../types/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить товар "${title}"?`)) return;

    try {
      setDeleteLoading(id);
      await productsApi.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Ошибка при удалении товара');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
        <Link to="/products/new" className="btn btn-primary">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Добавить товар
          </span>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Нет товаров</p>
          <Link to="/products/new" className="btn btn-primary">
            Добавить первый товар
          </Link>
        </div>
      ) : (
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Фото</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Старая цена</th>
                  <th>Статус</th>
                  <th>Заказов</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.media.length > 0 ? (
                        <img
                          src={product.media[0].url}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{product.title}</p>
                        <p className="text-sm text-gray-500">{product.slug}</p>
                      </div>
                    </td>
                    <td>{product.category.name}</td>
                    <td className="font-medium">{formatPrice(product.price)}</td>
                    <td>
                      {product.compareAt ? (
                        <span className="text-gray-500 line-through">
                          {formatPrice(product.compareAt)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span className={`badge ${product.active ? 'badge-success' : 'badge-danger'}`}>
                        {product.active ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td>{product._count?.orderItems || 0}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          disabled={deleteLoading === product.id}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
