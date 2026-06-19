# 🚀 Deployment & Local Setup Guide

This guide covers the necessary steps to set up the IELTS Preparation App for both local development and production deployment.

## 🛠️ Prerequisites

- **Clerk Account:** For authentication.
- **PostgreSQL Database:** (e.g., Supabase, Neon, or local).
- **Deepgram API Key:** (Optional, for audio transcription).
- **Gemini AI API Key:** For generating feedback.
- **Svix CLI:** (Recommended for local webhook testing).

---

## 1. Clerk Configuration (Critical)

To use the **Optimized JWT Bridge** (Identity Bridge), follow these steps:

### A. JWT Template
1. Go to your Clerk Dashboard -> **JWT Templates**.
2. Create a new template (or edit the default one).
3. Name it (e.g., `default`).
4. Add the following to the **Claims**:
   ```json
   {
     "metadata": "{{user.public_metadata}}"
   }
   ```
5. This ensures `dbUserId`, `role`, and `plan` are available in the session claims.

### B. Webhooks (Production)
1. Go to Clerk Dashboard -> **Webhooks**.
2. Add an endpoint: `https://your-domain.com/api/webhooks/clerk`.
3. Select events: `user.created`, `user.updated`, `user.deleted`.
4. Copy the **Signing Secret** to your environment variables as `CLERK_WEBHOOK_SECRET`.

### C. Webhooks (Local Development)
1. Install Svix CLI: `brew install svix/svix/svix-cli`.
2. Run Svix relay: `svix listen http://localhost:3000/api/webhooks/clerk`.
3. Copy the provided local secret to your `.env` as `CLERK_WEBHOOK_SECRET`.

---

## 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ielts_db"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# AI & Media
GEMINI_API_KEY=your_gemini_key
DEEPGRAM_API_KEY=your_deepgram_key
```

---

## 3. Database Setup

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```
2. **Push Schema to DB:**
   ```bash
   npx prisma db push
   ```
   *Note: Use `npx prisma migrate dev` for local development if you want to track migrations.*

---

## 4. Resilience & JIT Provisioning

The app includes **Just-In-Time (JIT) Provisioning** in `lib/actions/auth.ts`. This means:
- If a user signs in and the webhook hasn't run yet (or isn't set up), the app will automatically create the user in the database on their first request.
- It will also sync the `dbUserId` back to Clerk's public metadata.
- This ensures a smooth experience even if webhooks are delayed or during local development without webhooks.

---

## 5. Performance Optimization

The dashboard is optimized using **Denormalization**:
- User statistics (averages and counts) are stored directly on the `User` model.
- These fields are updated incrementally upon every exercise submission.
- This avoids heavy O(N) aggregation queries, keeping the dashboard O(1) fast.
