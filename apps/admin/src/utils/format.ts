export function formatPrice(kopecks: number): string {
  const rubles = kopecks / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rubles);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Ожидает оплаты',
    PAID: 'Оплачен',
    CANCELED: 'Отменен',
    FULFILLED: 'Выполнен'
  };
  
  return statusMap[status] || status;
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'PAID':
      return 'badge-success';
    case 'PENDING':
      return 'badge-warning';
    case 'CANCELED':
      return 'badge-danger';
    case 'FULFILLED':
      return 'badge-info';
    default:
      return '';
  }
}






