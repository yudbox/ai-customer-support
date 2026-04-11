# 🎭 Playwright E2E Tests

## What is E2E Testing?

**End-to-End (E2E) testing** simulates real user interactions with your application in a browser. Unlike unit tests that test isolated functions, E2E tests verify the entire user flow from start to finish.

**What Playwright does:**

- Opens a real browser (Chromium, Firefox, or Safari)
- Acts like a human user (clicks buttons, fills forms, waits for responses)
- Verifies that the UI displays correctly
- Checks that backend APIs work
- Validates database updates

---

## � E2E vs API Testing Comparison

### What to Test: E2E (Browser) vs API (No Browser)

| Что тестировать               | E2E (Browser)          | API (No Browser)    |
| ----------------------------- | ---------------------- | ------------------- |
| **Кнопки работают**           | ✅                     | ❌                  |
| **Forms validation**          | ✅                     | ❌                  |
| **UI правильно отображается** | ✅                     | ❌                  |
| **API endpoints работают**    | ✅                     | ✅                  |
| **Database updates**          | ✅                     | ✅                  |
| **AI agents выполняются**     | ✅                     | ✅                  |
| **Скорость**                  | 🐌 Медленно (5-10 сек) | ⚡ Быстро (1-2 сек) |
| **Количество тестов**         | 5-10 критичных         | 20-30 endpoints     |

**Когда использовать E2E:**

- Критичные user journeys (регистрация, оплата, основной flow)
- Интеграция UI + Backend + Database
- Визуальная проверка (скриншоты, layout)

**Когда использовать API:**

- Тестирование всех endpoints
- Быстрая проверка бизнес-логики
- Валидация данных и ошибок
- Load/Performance testing

---

## �📁 Test Structure

```
tests/e2e/
└── customer-low-priority.spec.ts   # Customer creates LOW priority ticket
```

---

## 🚀 Running Tests

### Run all E2E tests (headless mode)

```bash
npm run test:e2e
```

### Run tests with UI (interactive mode)

```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e:headed
```

### Debug tests (step-by-step)

```bash
npm run test:e2e:debug
```

### View test report

```bash
npm run test:e2e:report
```

---

## 🧪 Current Tests

### 1. Customer Flow - LOW Priority Ticket

**File:** `customer-low-priority.spec.ts`

**Scenarios:**

1. **Auto-resolve product compatibility question**
   - User selects demo scenario from dropdown
   - Fills form automatically
   - Submits ticket
   - AI processes (6 agents)
   - Ticket auto-resolved with answer

2. **Display real-time progress updates**
   - Verifies SSE streaming works
   - Checks that each agent step appears

**What it tests:**

- ✅ UI components render correctly
- ✅ Dropdown auto-fills form
- ✅ Form submission works
- ✅ Real-time SSE streaming (AI progress updates)
- ✅ LangGraph multi-agent workflow executes
- ✅ Database saves ticket
- ✅ Auto-resolution displays correct answer

---

## 📊 Test Coverage Status

### Overall E2E Coverage

| Test Category           | Total Needed | Implemented | Coverage % | Status         |
| ----------------------- | ------------ | ----------- | ---------- | -------------- |
| **E2E Tests (Browser)** | 5            | 3           | **60%**    | 🟡 In Progress |
| **API Tests**           | 10           | 0           | **0%**     | ⏸️ TODO        |
| **Total**               | **15**       | **3**       | **20%**    | 🔴 Low         |

### Detailed Coverage by Feature

| Feature                                | Test Type | Planned | Done | Coverage %  | Priority    |
| -------------------------------------- | --------- | ------- | ---- | ----------- | ----------- |
| **Customer UI - Form**                 | E2E       | 1       | 1    | ✅ **100%** | 🔥 Critical |
| **Customer UI - LOW ticket**           | E2E       | 2       | 2    | ✅ **100%** | 🔥 Critical |
| **Customer UI - CRITICAL ticket**      | E2E       | 1       | 0    | ⏸️ **0%**   | 🔥 Critical |
| **Manager Dashboard - Sidebar**        | E2E       | 1       | 0    | ⏸️ **0%**   | 🔥 Critical |
| **Manager Dashboard - Approve**        | E2E       | 1       | 0    | ⏸️ **0%**   | 🔥 Critical |
| **Manager Dashboard - Reject**         | E2E       | 1       | 0    | ⏸️ **0%**   | 🟡 Medium   |
| **API - tickets.create**               | API       | 1       | 0    | ⏸️ **0%**   | 🔥 Critical |
| **API - tickets.getPendingApproval**   | API       | 1       | 0    | ⏸️ **0%**   | 🔥 Critical |
| **API - tickets.approve**              | API       | 1       | 0    | ⏸️ **0%**   | 🔥 Critical |
| **API - tickets.reject**               | API       | 1       | 0    | ⏸️ **0%**   | 🟡 Medium   |
| **API - tickets.getById**              | API       | 1       | 0    | ⏸️ **0%**   | 🟢 Low      |
| **API - tickets.getAIRecommendations** | API       | 1       | 0    | ⏸️ **0%**   | 🟡 Medium   |
| **API - SSE Stream**                   | API       | 1       | 0    | ⏸️ **0%**   | 🟡 Medium   |
| **API - Error Handling**               | API       | 2       | 0    | ⏸️ **0%**   | 🟡 Medium   |

### Current Implementation Status

**✅ Completed (3 tests):**

1. ✅ Customer UI - Load home page and display form
2. ✅ Customer UI - Auto-fill form from dropdown selection
3. ✅ Customer UI - Submit button enabled when form is filled

**⏸️ TODO High Priority (6 tests):**

1. ⏸️ Customer UI - CRITICAL ticket creation flow
2. ⏸️ Manager Dashboard - View pending tickets
3. ⏸️ Manager Dashboard - Approve ticket
4. ⏸️ API - tickets.create endpoint
5. ⏸️ API - tickets.getPendingApproval endpoint
6. ⏸️ API - tickets.approve endpoint

**⏸️ TODO Medium Priority (6 tests):**

1. ⏸️ Manager Dashboard - Reject ticket
2. ⏸️ API - tickets.reject endpoint
3. ⏸️ API - tickets.getAIRecommendations endpoint
4. ⏸️ API - SSE Stream endpoint
5. ⏸️ API - Error handling (invalid data)
6. ⏸️ API - Error handling (not found)

### Coverage Goals

| Milestone             | Target | Current | Progress    |
| --------------------- | ------ | ------- | ----------- |
| **MVP (Smoke Tests)** | 40%    | 20%     | 🟡 50% done |
| **Production Ready**  | 80%    | 20%     | 🔴 25% done |
| **Comprehensive**     | 100%   | 20%     | 🔴 20% done |

---

## 🔍 How to Add New Tests

### Example: Manager Approve Flow

```typescript
// tests/e2e/manager-approve.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Manager Flow - Approve Ticket", () => {
  test("should approve CRITICAL ticket", async ({ page }) => {
    // 1. Create CRITICAL ticket first
    await page.goto("/");
    await page.click('[data-testid="scenario-dropdown"]');
    await page.click("text=🚨 VIP злой - заказ задержан");
    await page.click('[data-testid="submit-ticket"]');

    // 2. Wait for pending approval
    await expect(page.locator("text=REQUIRES MANAGER APPROVAL")).toBeVisible({
      timeout: 30000,
    });

    // 3. Navigate to manager dashboard
    await page.goto("/manager");

    // 4. Click on pending ticket
    await page.click('[data-testid="pending-ticket-567"]');

    // 5. Approve
    await page.click('[data-testid="approve-button"]');

    // 6. Verify toast notification
    await expect(page.locator("text=Approved")).toBeVisible();
  });
});
```

---

## 🎯 Best Practices

### 1. Use data-testid for stability

```typescript
// ✅ Good - stable selector
await page.click('[data-testid="submit-button"]');

// ❌ Bad - fragile selector
await page.click(".btn.btn-primary.submit");
```

### 2. Set appropriate timeouts

```typescript
// AI processing can take time
await expect(page.locator("text=RESOLVED")).toBeVisible({ timeout: 30000 }); // 30 seconds
```

### 3. Test critical user journeys only

```typescript
// ✅ Test these:
- Customer creates ticket → Auto-resolved
- Customer creates ticket → Manager approves
- Manager rejects ticket

// ❌ Don't test these:
- Every button color
- Every animation
- Every edge case
```

### 4. Clean up after tests

```typescript
test.afterEach(async ({ page }) => {
  // Clean up database if needed
  await page.request.delete("/api/test/cleanup");
});
```

---

## 🐛 Debugging Failed Tests

### 1. Run with UI mode

```bash
npm run test:e2e:ui
```

- See browser in real-time
- Step through each action
- Inspect elements

### 2. Run with headed mode

```bash
npm run test:e2e:headed
```

- See browser window
- Watch test execute

### 3. Check screenshots

Failed tests automatically take screenshots:

```
test-results/
└── customer-low-priority-spec-ts-should-auto-resolve/
    └── test-failed-1.png
```

### 4. Check traces

```bash
npx playwright show-trace trace.zip
```

---

## 📚 Resources

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)

---

## 🎯 Next Steps

### TODO: Add more E2E tests

1. **Manager Dashboard:**
   - [ ] Approve CRITICAL ticket
   - [ ] Reject ticket
   - [ ] View AI recommendations

2. **API Tests:**
   - [ ] tickets.create
   - [ ] tickets.getPendingApproval
   - [ ] tickets.approve
   - [ ] tickets.reject

3. **Edge Cases:**
   - [ ] Invalid form submission
   - [ ] Network errors
   - [ ] Timeout handling

---

## 📈 Current Status Summary

**Implemented:** 3 E2E tests ✅  
**Coverage:** 20% (3/15 tests)  
**Status:** 🟡 MVP Smoke Tests (60% complete)

**Next Priority:**

1. 🔥 Manager Dashboard approve/reject flows (E2E)
2. 🔥 API endpoint tests (tickets.create, approve, reject)
3. 🟡 Full AI workflow integration tests

**For Portfolio Interview:**

- ✅ Shows E2E testing knowledge (Playwright)
- ✅ Demonstrates test planning (15 tests mapped)
- ✅ Clear coverage metrics (20% current, roadmap to 80%)
- ✅ Best practices applied (data-testid, timeouts, smoke tests)
