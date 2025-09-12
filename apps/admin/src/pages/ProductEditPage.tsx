import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi, categoriesApi } from '../lib/api';
import ImageUpload from '../components/ImageUpload';
import type { Product, Category, Media } from '../types/api';

const productSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(200),
  slug: z.string().min(1, 'Slug обязателен').regex(/^[a-z0-9-]+$/, 'Только строчные буквы, цифры и дефисы'),
  description: z.string().optional(),
  price: z.string().transform((val) => Math.round(parseFloat(val) * 100)),
  compareAt: z.string().transform((val) => val ? Math.round(parseFloat(val) * 100) : undefined).optional(),
  categoryId: z.string().min(1, 'Категория обязательна'),
  active: z.boolean()
});

type ProductFormData = z.input<typeof productSchema>;

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      active: true
    }
  });

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProduct();
    }
  }, [isEdit]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      const product = data.find(p => p.id === id);
      
      if (!product) {
        navigate('/products');
        return;
      }
      
      setProduct(product);
      setMedia(product.media || []);
      
      setValue('title', product.title);
      setValue('slug', product.slug);
      setValue('description', product.description || '');
      setValue('price', (product.price / 100).toFixed(2));
      setValue('compareAt', product.compareAt ? (product.compareAt / 100).toFixed(2) : '');
      setValue('categoryId', product.categoryId);
      setValue('active', product.active);
    } catch (error) {
      console.error('Failed to load product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const processedData = productSchema.parse(data);
      
      if (isEdit) {
        await productsApi.update(id!, processedData);
      } else {
        await productsApi.create(processedData);
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Ошибка при сохранении товара');
    }
  };

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[а-я]/g, '') // Remove cyrillic for now
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('slug', slug);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Редактировать товар' : 'Новый товар'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Название</label>
              <input
                {...register('title')}
                type="text"
                className="input"
                onBlur={(e) => !id && generateSlug(e.target.value)}
              />
              {errors.title && (
                <p className="error-text">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="label">Slug (URL)</label>
              <input
                {...register('slug')}
                type="text"
                className="input"
              />
              {errors.slug && (
                <p className="error-text">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <label className="label">Категория</label>
              <select {...register('categoryId')} className="input">
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="error-text">{errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <label className="label">Статус</label>
              <label className="flex items-center gap-2">
                <input
                  {...register('active')}
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span>Активен</span>
              </label>
            </div>

            <div>
              <label className="label">Цена (₽)</label>
              <input
                {...register('price')}
                type="number"
                step="0.01"
                min="0"
                className="input"
              />
              {errors.price && (
                <p className="error-text">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="label">Старая цена (₽)</label>
              <input
                {...register('compareAt')}
                type="number"
                step="0.01"
                min="0"
                className="input"
              />
              {errors.compareAt && (
                <p className="error-text">{errors.compareAt.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="label">Описание</label>
              <textarea
                {...register('description')}
                rows={4}
                className="input"
              />
              {errors.description && (
                <p className="error-text">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {isEdit && product && (
          <div className="card">
            <ImageUpload
              productId={product.id}
              media={media}
              onMediaUpdate={setMedia}
            />
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn btn-secondary"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
