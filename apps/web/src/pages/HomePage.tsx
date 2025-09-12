import { useState, useEffect } from 'react';
import { catalogApi } from '../lib/api';
import ProductCard from '../components/ProductCard';
import type { Product, Category } from '../types/api';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getProducts()
        ]);
        
        setCategories(categoriesData);
        setProducts(productsData.products);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await catalogApi.getProducts({
          category: selectedCategory || undefined,
          search: searchQuery || undefined
        });
        setProducts(data.products);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="px-4 py-4">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Categories */}
      <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`tab whitespace-nowrap ${
              !selectedCategory ? 'tab-active' : 'tab-inactive'
            }`}
          >
            Все товары
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`tab whitespace-nowrap ${
                selectedCategory === category.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-telegram-button border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-telegram-hint">Товары не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// Hide scrollbar for categories
const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(style);
