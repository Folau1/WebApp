# Contributing to Telegram WebApp Shop

Спасибо за интерес к проекту! Мы рады любому вкладу в развитие магазина.

## 🤝 Как внести свой вклад

### Сообщить о баге

1. Проверьте [Issues](https://github.com/yourusername/telegram-webapp-shop/issues) - возможно, баг уже зарепорчен
2. Создайте новый Issue с описанием:
   - Шаги для воспроизведения
   - Ожидаемое поведение
   - Фактическое поведение
   - Скриншоты (если применимо)
   - Окружение (ОС, браузер, версия Node.js)

### Предложить улучшение

1. Создайте Issue с тегом `enhancement`
2. Опишите предлагаемую функциональность
3. Объясните, почему это будет полезно

### Отправить Pull Request

1. Fork репозитория
2. Создайте feature branch от `develop`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Внесите изменения
4. Добавьте тесты (если применимо)
5. Убедитесь, что все тесты проходят:
   ```bash
   npm test
   ```
6. Commit с понятным сообщением:
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
7. Push в ваш fork:
   ```bash
   git push origin feature/amazing-feature
   ```
8. Создайте Pull Request

## 📝 Стиль кода

### Общие правила

- Используйте TypeScript везде, где возможно
- Следуйте существующему стилю кода
- Добавляйте JSDoc комментарии для публичных функций
- Избегайте `any` типов

### Commit сообщения

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - новая функциональность
- `fix:` - исправление бага
- `docs:` - изменения документации
- `style:` - форматирование, без изменения логики
- `refactor:` - рефакторинг кода
- `test:` - добавление тестов
- `chore:` - обновление зависимостей, конфигурации

Примеры:
```
feat: add product search functionality
fix: correct price calculation in cart
docs: update deployment instructions
```

### TypeScript

```typescript
// ✅ Хорошо
interface Product {
  id: string;
  title: string;
  price: number;
}

function calculateDiscount(price: number, percentage: number): number {
  return Math.floor(price * (1 - percentage / 100));
}

// ❌ Плохо
function calc(p: any, d: any) {
  return p * (1 - d / 100);
}
```

### React компоненты

```tsx
// ✅ Хорошо
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

// ❌ Плохо
export const Button = (props: any) => {
  return <button onClick={props.onClick}>{props.children}</button>;
};
```

## 🧪 Тестирование

### Backend тесты

```bash
cd server
npm test
```

Пишите тесты для:
- API endpoints
- Бизнес-логики
- Утилит

### Frontend тесты

```bash
cd apps/web
npm test
```

Тестируйте:
- Компоненты
- Hooks
- Утилиты

## 📚 Документация

При добавлении новой функциональности:

1. Обновите README.md
2. Добавьте JSDoc комментарии
3. Обновите API документацию
4. Добавьте примеры использования

## 🔄 Процесс разработки

1. Всегда создавайте feature branch от `develop`
2. Регулярно синхронизируйтесь с upstream:
   ```bash
   git remote add upstream https://github.com/yourusername/telegram-webapp-shop.git
   git fetch upstream
   git checkout develop
   git merge upstream/develop
   ```
3. Разрешайте конфликты локально
4. Держите PR небольшими и focused

## 🏗️ Настройка окружения разработки

1. Клонируйте ваш fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/telegram-webapp-shop.git
   cd telegram-webapp-shop
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Настройте локальное окружение:
   ```bash
   ./scripts/setup.sh
   ```

4. Запустите в dev режиме:
   ```bash
   npm run dev
   ```

## ❓ Вопросы?

- Создайте Issue с тегом `question`
- Присоединитесь к нашему [Telegram чату](https://t.me/tgshop_dev)

## 📄 Лицензия

Отправляя Pull Request, вы соглашаетесь, что ваш вклад будет лицензирован под MIT лицензией.






