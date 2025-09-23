import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useTelegram } from '../hooks/useTelegram';
import api from '../lib/api';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface UserProfile {
  id: string;
  tgId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
  role: string;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useStore();
  const { user: tgUser, initData } = useTelegram();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({
    city: '',
    index: '',
    street: '',
    house: '',
    apartment: '',
    note: ''
  });

  // Загружаем профиль пользователя
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (initData) {
          const response = await api.get('/user/profile');
          setUserProfile(response.data.user);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [initData]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Сохраняем адрес в localStorage
    localStorage.setItem('userAddress', JSON.stringify(addressData));
    setShowAddressForm(false);
    // Можно показать уведомление об успешном сохранении
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-sm mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 text-center">
            👤 Профиль
          </h1>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-sm mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка профиля...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {userProfile?.photoUrl ? (
                <img 
                  src={userProfile.photoUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : tgUser?.photo_url ? (
                <img 
                  src={tgUser.photo_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {userProfile?.firstName || tgUser?.first_name || 'Гость'}
              {userProfile?.lastName && ` ${userProfile.lastName}`}
              {!userProfile?.lastName && tgUser?.last_name && ` ${tgUser.last_name}`}
            </h2>
            
            <p className="text-gray-500 mb-2">
              {userProfile?.username || tgUser?.username ? `@${userProfile?.username || tgUser?.username}` : 'Добро пожаловать!'}
            </p>
            
            {userProfile && (
              <p className="text-sm text-gray-400 mb-8">
                Заказов: {userProfile._count.orders}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
            <div 
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/my-orders')}
            >
              <h3 className="font-semibold text-gray-900 mb-2">📋 Мои заказы</h3>
              <p className="text-gray-500 text-sm">Просмотр истории заказов</p>
            </div>

            <div 
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                // Загружаем сохраненный адрес
                const savedAddress = localStorage.getItem('userAddress');
                if (savedAddress) {
                  try {
                    const parsedAddress = JSON.parse(savedAddress);
                    setAddressData(parsedAddress);
                  } catch (e) {
                    console.error('Error parsing saved address:', e);
                  }
                }
                setShowAddressForm(true);
              }}
            >
              <h3 className="font-semibold text-gray-900 mb-2">🏠 Мой адрес</h3>
              <p className="text-gray-500 text-sm">Управление адресом доставки</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">📞 Поддержка</h3>
              <p className="text-gray-500 text-sm">Связаться с нами</p>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно с формой адреса */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">🏠 Мой адрес</h2>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Город *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={addressData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    placeholder="Введите город"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Индекс *
                  </label>
                  <input
                    type="text"
                    name="index"
                    value={addressData.index}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    placeholder="Введите индекс"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Улица *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={addressData.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      placeholder="Улица"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дом *
                    </label>
                    <input
                      type="text"
                      name="house"
                      value={addressData.house}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      placeholder="Дом"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Квартира
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={addressData.apartment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    placeholder="Квартира (необязательно)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Примечание
                  </label>
                  <textarea
                    name="note"
                    value={addressData.note}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                    placeholder="Дополнительная информация для курьера"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
