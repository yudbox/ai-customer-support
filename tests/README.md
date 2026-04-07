# Integration Tests

Интеграционные тесты для AI Customer Support приложения.

## Структура

```
tests/
├── setup/
│   └── integration-setup.ts  # Глобальная настройка для интеграционных тестов
└── integration/
    └── tickets.test.ts        # Пример интеграционного теста
```

## Конфигурация

Интеграционные тесты используют отдельную конфигурацию Jest:

- **Config:** `jest.integration.config.js`
- **Coverage:** `coverage/integration/`
- **Timeout:** 30 секунд (для медленных интеграционных операций)

## Запуск тестов

### Все тесты (unit + integration)

```bash
npm test
```

### Только интеграционные тесты

```bash
npm run test:integration
```

### С покрытием

```bash
npm run test:integration:coverage
```

## Что тестируем

### 1. **tRPC Endpoints Integration**

- Полный стек от tRPC router до service layer
- Валидация входных данных
- Обработка ошибок
- Интеграция между слоями

### 2. **Database Operations** (Mocked)

- CRUD операции через repository layer
- Transaction handling
- Error handling для DB операций
- Connection pooling

### 3. **External API Integration** (Mocked)

- OpenAI API calls
- Pinecone vector search
- Hugging Face sentiment analysis
- Error handling для внешних API

### 4. **Workflow Integration**

- LangGraph workflow execution
- State management
- Agent coordination
- Error recovery

## Mocking Strategy

### Автоматические моки (в `integration-setup.ts`):

1. **Database Connection**

   ```typescript
   jest.mock("@/lib/database/connection");
   ```

2. **OpenAI API**

   ```typescript
   jest.mock("openai");
   ```

3. **Pinecone API**

   ```typescript
   jest.mock("@pinecone-database/pinecone");
   ```

4. **Hugging Face API**
   ```typescript
   jest.mock("@huggingface/inference");
   ```

## Best Practices

### 1. **Изоляция тестов**

Каждый тест должен быть независимым:

```typescript
beforeEach(() => {
  // Сброс состояния перед каждым тестом
  jest.clearAllMocks();
});
```

### 2. **Реалистичные сценарии**

Тестируйте реальные use cases:

```typescript
it("should create ticket and assign to correct team", async () => {
  // Arrange - подготовка данных как от реального пользователя
  const customerInput = {
    email: "customer@example.com",
    subject: "Product not working",
    body: "Detailed description...",
  };

  // Act - выполнение полного flow
  const result = await caller.tickets.create(customerInput);

  // Assert - проверка результата и side effects
  expect(result.ticket_number).toMatch(/^TKT-/);
});
```

### 3. **Error Scenarios**

Всегда тестируйте error cases:

```typescript
it("should handle database connection errors", async () => {
  mockGetDataSource.mockRejectedValue(new Error("Connection failed"));
  await expect(operation()).rejects.toThrow("Connection failed");
});
```

### 4. **Cleanup**

Очищайте ресурсы после тестов:

```typescript
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});
```

## Добавление новых тестов

### 1. Создайте файл теста

```bash
tests/integration/your-feature.test.ts
```

### 2. Используйте template

```typescript
import { appRouter } from "@/lib/trpc/routers/_app";

describe("Your Feature Integration", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    caller = appRouter.createCaller({});
  });

  it("should test your feature", async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### 3. Запустите тест

```bash
npm run test:integration -- your-feature.test.ts
```

## Migration to Real Database

Для использования реальной test database:

### 1. **Setup Test Database**

```yaml
# docker-compose.test.yml
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_pass
    ports:
      - "5433:5432"
```

### 2. **Update integration-setup.ts**

```typescript
// Удалить mock для database connection
// jest.mock('@/lib/database/connection')

// Добавить настройку реального подключения
import { DataSource } from "typeorm";

let testDataSource: DataSource;

beforeAll(async () => {
  testDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    // ... test DB config
  });
  await testDataSource.initialize();
});

afterAll(async () => {
  await testDataSource.destroy();
});
```

### 3. **Database Cleanup**

```typescript
afterEach(async () => {
  // Очистка данных после каждого теста
  await testDataSource.query("TRUNCATE TABLE tickets CASCADE");
});
```

## Troubleshooting

### Тесты падают с timeout

Увеличьте timeout в `jest.integration.config.js`:

```javascript
testTimeout: 60000; // 60 секунд
```

### Mock не работает

Проверьте порядок импортов:

```typescript
// ✅ Правильно - mock перед import
jest.mock("@/lib/database/connection");
import { getDataSource } from "@/lib/database/connection";

// ❌ Неправильно
import { getDataSource } from "@/lib/database/connection";
jest.mock("@/lib/database/connection");
```

### Ошибки с TypeScript

Добавьте типы в `tsconfig.json`:

```json
{
  "include": ["tests/**/*"]
}
```

## Coverage Goals

Минимальные требования к покрытию:

- **Statements:** 70%
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%

Настройки в `jest.integration.config.js`:

```javascript
coverageThreshold: {
  global: {
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70,
  },
}
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [tRPC Testing Guide](https://trpc.io/docs/testing)
- [Testing Library](https://testing-library.com/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
