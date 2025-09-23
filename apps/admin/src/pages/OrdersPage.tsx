import React, { useState, useEffect } from 'react';

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  title: string;
  product: {
    id: string;
    title: string;
    media: Array<{ url: string; kind: string }>;
  };
}

interface Order {
  id: string;
  number: number;
  totalAmount: number;
  discountTotal: number;
  status: string;
  address: {
    city: string;
    index: string;
    street: string;
    house: string;
    apartment?: string;
    note?: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
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

      // Теперь получаем заказы с правильным токеном
      const response = await fetch('http://localhost:3000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки заказов');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Не удалось загрузить заказы: ' + (err as Error).message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
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

      // Обновляем статус заказа
      const response = await fetch(`http://localhost:3000/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления статуса');
      }

      // Обновляем локальное состояние
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      alert('Не удалось обновить статус заказа: ' + (err as Error).message);
      console.error('Error updating order status:', err);
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
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'CONFIRMED': return '#3b82f6';
      case 'SHIPPED': return '#8b5cf6';
      case 'DELIVERED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Ожидает';
      case 'CONFIRMED': return 'Подтвержден';
      case 'SHIPPED': return 'Отправлен';
      case 'DELIVERED': return 'Доставлен';
      case 'CANCELLED': return 'Отменен';
      default: return status;
    }
  };

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
          <p style={{ color: '#6b7280' }}>Загрузка заказов...</p>
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
            onClick={loadOrders}
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
      {/* Заголовок */}
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 style={{ 
            margin: 0, 
            color: '#1f2937',
            fontSize: '1.5rem'
          }}>
            📦 Заказы ({orders.length})
          </h1>
        </div>
      </div>

      {/* Список заказов */}
      <div style={{ padding: '0 1rem' }}>
        {orders.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem 2rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <svg width="30" height="30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Заказов пока нет</h3>
            <p style={{ color: '#6b7280' }}>Когда появятся заказы, они отобразятся здесь</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb'
                }}
              >
                {/* Заголовок заказа */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      color: '#1f2937',
                      fontSize: '1.125rem',
                      fontWeight: '600'
                    }}>
                      Заказ #{order.number}
                    </h3>
                    <p style={{ 
                      margin: '0.25rem 0 0 0', 
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem'
                    }}>
                      {getStatusText(order.status)}
                    </div>
                    <p style={{ 
                      margin: 0, 
                      color: '#1f2937',
                      fontSize: '1.125rem',
                      fontWeight: '600'
                    }}>
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Товары */}
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Товары:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {order.items.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        padding: '0.5rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px'
                      }}>
                        <img
                          src={item.product.media.find(m => m.kind === 'IMAGE')?.url || '/placeholder.png'}
                          alt={item.product.title}
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ 
                            margin: 0, 
                            color: '#1f2937',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {item.title}
                          </p>
                          <p style={{ 
                            margin: 0, 
                            color: '#6b7280',
                            fontSize: '0.75rem'
                          }}>
                            {item.quantity} шт. × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                        <p style={{ 
                          margin: 0, 
                          color: '#1f2937',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Адрес */}
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Адрес доставки:
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    lineHeight: '1.4'
                  }}>
                    {order.address.city}, {order.address.index}, {order.address.street}, д. {order.address.house}
                    {order.address.apartment && `, кв. ${order.address.apartment}`}
                    {order.address.note && (
                      <>
                        <br />
                        <em>Примечание: {order.address.note}</em>
                      </>
                    )}
                  </p>
                </div>

                {/* Управление статусом */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  flexWrap: 'wrap',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(order.id, status)}
                      disabled={order.status === status}
                      style={{
                        backgroundColor: order.status === status ? getStatusColor(status) : '#f3f4f6',
                        color: order.status === status ? 'white' : '#374151',
                        padding: '0.5rem 0.75rem',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: order.status === status ? 'default' : 'pointer',
                        opacity: order.status === status ? 1 : 0.8
                      }}
                    >
                      {getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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