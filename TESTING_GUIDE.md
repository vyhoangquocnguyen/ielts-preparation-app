# Unit Testing Setup Guide for IELTS Preparation App

## Current Status
- ✗ No testing framework installed
- ✗ No test files exist
- ✓ Example test provided: `lib/utils.test.ts`

## Setup Instructions

### Step 1: Install Testing Dependencies

```bash
npm install -D vitest @vitest/ui vi3 @testing-library/react @testing-library/jest-dom jsdom
```

**What each package does:**
- **vitest** - Fast unit testing framework
- **@vitest/ui** - Visual dashboard for test results
- **vi3** - Testing utilities for Next.js
- **@testing-library/react** - For testing React components
- **@testing-library/jest-dom** - DOM matchers
- **jsdom** - Virtual DOM for testing

### Step 2: Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Step 3: Create vitest.config.ts

Create a `vitest.config.ts` file in the root:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### Step 4: Create vitest.setup.ts

```typescript
import '@testing-library/jest-dom'
```

### Step 5: Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm test -- --watch

# View test results in UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## Testing Strategy for Your Project

### 1. **Utility Functions** (Already has example)
- Location: `lib/utils.ts`, `lib/validation.ts`
- Test Type: Pure function testing
- Coverage: ~80-90% (easiest to test)
- Example: `lib/utils.test.ts`

### 2. **Server Actions** (Next step)
- Location: `lib/actions/*.ts`
- Test Type: Mocked database/API calls
- Example: Testing `lib/actions/reading.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitReadingExercise } from './actions/reading'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    readingSubmission: {
      create: vi.fn(),
    },
  },
}))

describe('Reading Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should submit reading exercise with correct answers', async () => {
    // Test implementation
  })
})
```

### 3. **React Components** (Medium difficulty)
- Location: `components/`
- Test Type: Component rendering and interaction
- Use: React Testing Library
- Example: Testing a form component

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProfileForm } from '@/components/dashboard/profileForm'

describe('ProfileForm', () => {
  it('should render form fields', () => {
    render(<ProfileForm />)
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    render(<ProfileForm />)
    // Test implementation
  })
})
```

### 4. **Validation Schemas** (Easy)
- Location: `lib/validation.ts`
- Test Type: Schema validation
- Example:

```typescript
import { describe, it, expect } from 'vitest'
import { updateUserProfileSchema } from '@/lib/validation'

describe('Validation Schemas', () => {
  it('should validate correct profile data', () => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      targetScore: 7.5,
    }
    expect(() => updateUserProfileSchema.parse(data)).not.toThrow()
  })

  it('should reject invalid target score', () => {
    const data = { targetScore: 10 } // Max is 9
    expect(() => updateUserProfileSchema.parse(data)).toThrow()
  })
})
```

---

## Testing Best Practices

### ✓ Do's
- **Test behavior, not implementation** - Focus on "what does this do?" not "how does it do it?"
- **Use descriptive test names** - Should read like documentation
- **Keep tests focused** - One assertion per test when possible
- **Mock external dependencies** - Database, APIs, file system
- **Use beforeEach/afterEach** - For setup and cleanup
- **Test edge cases** - Null values, empty arrays, boundary values

### ✗ Don'ts
- Don't test implementation details (private methods, internal state)
- Don't create interdependent tests (each test should be independent)
- Don't skip error cases
- Don't test third-party libraries (trust they work)
- Don't make tests too complex

---

## Coverage Goals

| Type | Target |
|------|--------|
| Utilities & Helpers | 80%+ |
| Business Logic | 70%+ |
| Components | 60%+ |
| Pages | 20%+ |

---

## Example Test Files Provided

1. **lib/utils.test.ts** - Comprehensive utility function tests
   - Tests for: `cn`, `formatRelativeTime`, `getScoreColor`, `calculateNewStreak`, `calculateBandScore`, `getDifficultyColor`, `formatTime`
   - Run with: `npm test lib/utils.test.ts`

---

## Common Testing Patterns

### Testing Async Functions
```typescript
it('should fetch data', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})
```

### Testing with Mocks
```typescript
import { vi } from 'vitest'

const mockFn = vi.fn()
mockFn.mockResolvedValue({ success: true })
// or
mockFn.mockRejectedValue(new Error('Failed'))
```

### Testing Errors
```typescript
it('should throw on invalid input', () => {
  expect(() => riskyFunction(null)).toThrow('Invalid input')
})
```

---

## Next Steps

1. ✓ Install testing dependencies
2. ✓ Create vitest config files
3. ✓ Run the example test: `npm test lib/utils.test.ts`
4. Create tests for `lib/validation.ts`
5. Create tests for `lib/actions/*.ts` (with mocks)
6. Create tests for React components
7. Aim for 60%+ overall coverage

