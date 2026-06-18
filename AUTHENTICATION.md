# 🔐 IDENTITY & AUTHENTICATION ARCHITECTURE
## Project: IELTS Preparation App (Next.js 16)

This document explains the "Identity Bridge" between Clerk and Prisma.

---

## 1. The Core Concept: The Identity Bridge
We avoid querying the database just to find a user's ID. Instead, we use **JWT Metadata Injection**.

* **Prisma `id`**: The primary key (CUID/UUID) in our database.
* **Clerk `dbUserId`**: A custom claim in the Clerk JWT that stores the Prisma `id`.



---

## 2. Technical Workflow

### A. The Handshake (Registration)
When a user signs up via Clerk:
1. **Webhook Trigger:** Clerk sends a `user.created` event to `/api/webhooks/clerk`.
2. **Database Write:** We create the user in Prisma. Prisma generates a unique `id` (e.g., `cmj4...`).
3. **Metadata Sync:** We tell Clerk: *"Store this Prisma ID (`cmj4...`) in this user's public metadata as `dbUserId`."*

### B. The Session (Authenticated Requests)
When the user visits the Dashboard:
1. **JWT Extraction:** Clerk provides the `sessionClaims`.
2. **Direct Access:** We extract `sessionClaims.metadata.dbUserId`.
3. **Optimized Query:** We query Prisma using that `id` directly. **No clerkId lookup needed.**

---

## 3. Security Layers (Next.js 16 Proxy)

We use the **Proxy Layer** (`proxy.ts`) to block unauthorized traffic at the edge.

| Role | Access Level | Logic |
| :--- | :--- | :--- |
| **STUDENT** | `/dashboard`, `/practice` | Default role. |
| **TEACHER** | Above + `/teacher` | Validated via `metadata.role`. |
| **ADMIN** | Everything + `/admin` | Validated via `metadata.role`. |



---

## 4. Maintenance & Scalability
* **Scaling:** Because we skip the "Identity Lookup" query, database load is reduced by ~50% per request.
* **Role Updates:** If you change a user's role in the DB, you **must** update the Clerk Metadata and the user must **re-log** to refresh their JWT.

## 5. ARCHITECTURE COMPARISON: NEXT.JS + CLERK + PRISMA


### APPROACH: THE ORIGINAL (DIRECT ID)
Logic: The frontend sends the UserID directly as an argument to the Server Action.

- CODE EXAMPLE: 
  export async function getRecentActivity(userId: string) { ... }

- PROS: No extra database lookups; very fast.
- CONS: 🚨 CRITICAL SECURITY RISK. Any user can manipulate the frontend code to send a DIFFERENT user's ID to the server. This allows anyone to steal any data just by guessing an ID.
- VERDICT: Dangerous. Never use for private user data.

---

### APPROACH: THE STANDARD (CLERK-ID LOOKUP)
Logic: Use Clerk's auth() to get the clerkId, then search the DB for the Prisma User.

- CODE EXAMPLE:
  const { userId } = await auth(); // Clerk ID
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const data = await prisma.data.findMany({ where: { userId: user.id } });

- PROS: Secure (the server verifies the identity). Easy to set up without webhooks.
- CONS: DOUBLE-QUERY PENALTY. Every single request hits the database twice (once to find the user, once to get the data). This slows down your app and increases hosting costs as you scale.
- VERDICT: Good for hobby projects or early MVPs.

---

### APPROACH: THE OPTIMIZED (JWT BRIDGE)
Logic: Store the Prisma ID (Primary Key) inside the Clerk Metadata (dbUserId).

- CODE EXAMPLE:
  const { sessionClaims } = await auth();
  const dbUserId = sessionClaims?.metadata.dbUserId; // Prisma ID
  const data = await prisma.data.findMany({ where: { userId: dbUserId } });

- PROS: 🚀 MAXIMUM PERFORMANCE. Only 1 database trip is required. The server verifies identity AND gets the correct ID in one shot from the JWT token.
- CONS: Requires a Webhook to "bridge" the ID from Prisma to Clerk when a user signs up.
- VERDICT: The Professional Choice. Best for performance, security, and scaling.

---

## 📊 SUMMARY TABLE

| Metric           | Direct ID (Original) | Clerk-ID Search (Standard) | JWT Bridge (Optimized) |
| :--------------- | :------------------- | :------------------------- | :--------------------- |
| **Security** | 🔴 Vulnerable        | 🟢 Secure                  | 🟢 Secure               |
| **DB Trips** | 1 Trip               | 2 Trips                    | 1 Trip                 |
| **Latency** | Low                  | High                       | **Lowest** |
| **Scalability** | High                 | Low                        | **High** |
| **Setup Effort** | Very Low             | Low                        | Medium                 |