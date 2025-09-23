// Простой тест API
const testAPI = async () => {
  try {
    console.log('Тестируем логин...');
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

    console.log('Статус логина:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('Ошибка логина:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('Логин успешен, токен получен');

    // Тестируем получение товаров
    console.log('Тестируем получение товаров...');
    const productsResponse = await fetch('http://localhost:3000/api/admin/products', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    console.log('Статус товаров:', productsResponse.status);
    
    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.log('Ошибка товаров:', errorText);
      return;
    }

    const productsData = await productsResponse.json();
    console.log('Товары получены:', productsData.products.length, 'шт.');

    // Тестируем получение категорий
    console.log('Тестируем получение категорий...');
    const categoriesResponse = await fetch('http://localhost:3000/api/admin/categories', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    console.log('Статус категорий:', categoriesResponse.status);
    
    if (!categoriesResponse.ok) {
      const errorText = await categoriesResponse.text();
      console.log('Ошибка категорий:', errorText);
      return;
    }

    const categoriesData = await categoriesResponse.json();
    console.log('Категории получены:', categoriesData.categories.length, 'шт.');

    console.log('Все тесты прошли успешно!');

  } catch (error) {
    console.error('Ошибка тестирования:', error);
  }
};

testAPI();
