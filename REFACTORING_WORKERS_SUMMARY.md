# Project Refactoring Summary - February 2026

This document summarizes the major architectural and technical improvements implemented in the IELTS Preparation App.

## 1. Worker Pattern for Heavy AI Compute

To improve user experience and system responsiveness, we offloaded heavy AI feedback generation (Gemini API calls) to a background process.

- **Non-blocking Submissions**: `submitWritingTask` and `submitSpeakingExercise` now return an `attemptId` immediately without waiting for the AI response.
- **Next.js `after()`**: Uses the `after()` hook to trigger background processing after the response has been sent to the client.
- **Centralized Workers**: Created `lib/workers.ts` to manage all background AI logic, including transcriptions (mocked), feedback generation, analytics updates, and streak management.
- **Pending UI**: Added a `PendingFeedback` client component that provides a visual loading state while polling the server for the completed attempt.

## 2. Global Type System Centralization

Removed hundreds of redundant imports and improved developer productivity by moving to a global declaration system.

- **`types/global.d.ts`**: All core interfaces (`ModuleType`, `AnyAttempt`, module-specific feedback types) are now defined in a `declare global` block.
- **Clerk Augmentation**: Properly augmented `CustomJwtSessionClaims` to ensure `auth().sessionClaims.metadata` is correctly typed (fixing `unknown` type errors).
- **Indisposable Payload Types**: Integrated Prisma payload extensions (e.g., `ReadingAttemptWithExercise`) into the global scope.

## 3. Database Transaction & Safety Optimizations

Improved data integrity and performance for high-concurrency scenarios.

- **Row Locking**: Implemented `SELECT ... FOR UPDATE` via `tx.$queryRaw` for user streak updates. This prevents race conditions where simultaneous submissions might result in incorrect streak counts.
- **Standardized Error Handling**: Unified the return format for server actions to `{ success: boolean, data: { ... } | { error: string } }`, avoiding unhandled exceptions on the client.
- **Ownership Validation**: Consistently used `findFirst` with `userId` filters across all modules to ensure users can only access their own data.

## 4. Migration Integrity

- **Bookmark Table Migration**: Fixed a critical migration step that was dropping the bookmarks table. It now correctly renames and updates the existing table, preserving all user data.



