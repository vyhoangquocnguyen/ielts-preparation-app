# Testing Guide for IELTS Preparation App

This project uses a dual-testing strategy to ensure application reliability:

1.  **Vitest**: For **Unit Testing** (testing individual functions and utilities).
2.  **Playwright**: For **End-to-End (E2E) Automation Testing** (testing the full application flow).

---

## 🚀 Quick Start

### Run Unit Tests

Test individual functions in `lib/` and utilities.

```bash
npm run test:unit
```

### Run Automation Tests (E2E)

Test the running application in a real browser environment.

```bash
# 1. Ensure your dev server is running (optional, Playwright starts it if needed)
npm run dev

# 2. Run the tests
npm run test:e2e
```

### View E2E Test Report

If tests fail, view the detailed HTML report.

```bash
npx playwright show-report
```

---

## 🧪 Unit Testing (Vitest)

Unit tests focus on logic in isolation, such as calculation helpers, validation schemas, and data formatting.

- **Location**: `lib/*.test.ts` (Co-located with the code they test)
- **Framework**: [Vitest](https://vitest.dev/)

### How to write a Unit Test

Create a file named `yourFile.test.ts` next to the file you want to test.

```typescript
// lib/example.test.ts
import { describe, it, expect } from "vitest";
import { sum } from "./example";

describe("sum function", () => {
  it("adds two numbers correctly", () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

### What to test

- Utility functions in `lib/utils.ts`
- Zod validation schemas in `lib/validation.ts`
- Helper logic that doesn't depend on the database or browser.

---

## 🤖 Automation Testing (Playwright)

E2E tests simulate a real user interaction. They visit pages, click buttons, and check if the UI updates correctly.

- **Location**: `tests/*.spec.ts`
- **Framework**: [Playwright](https://playwright.dev/)

### How to write an E2E Test

Create a new file in the `tests/` folder, e.g., `tests/speaking.spec.ts`.

```typescript
// tests/speaking.spec.ts
import { test, expect } from "@playwright/test";

test("User can visit speaking page", async ({ page }) => {
  // 1. Visit the page
  await page.goto("/speaking");

  // 2. Interact (e.g., click a button)
  await page.getByRole("button", { name: "Start Practice" }).click();

  // 3. Assert (Check if expected text is visible)
  await expect(page.getByText("Get Ready")).toBeVisible();
});
```

### Useful Commands

- `npx playwright test --ui`: Opens an interactive UI mode to watch tests run.
- `npx playwright codegen`: Opens a browser that records your clicks and generates test code for you!

---

## 🔍 Debugging Tests

### Vitest

Run with verbose output to see which specific test failed:

```bash
npx vitest run lib --reporter=verbose
```

### Playwright

Turn on trace viewer to see screenshots and network calls for failed tests:

```bash
npx playwright test --trace on
```
