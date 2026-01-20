# IELTS Preparation App

A comprehensive, AI-powered platform designed to help students master the IELTS exam. This application provides realistic practice modules for Speaking, Reading, Listening, and Writing, providing instant, AI-generated feedback and scoring.

![IELTS App Screenshot](https://via.placeholder.com/800x400?text=IELTS+Preparation+App+Dashboard)

---

## 🏗️ Architecture & Data Flow

### Application Data Flow

The application follows a modern Next.js server-side data flow. User interactions trigger Server Actions, which interact with the Postgres database and external AI services (Gemini).

```mermaid
flowchart TD
    User([User]) <--> Client[Client UI (React/Next.js)]

    subgraph Server [Server Side]
        Action[Server Actions]
        Auth[Clerk Auth]
        Validation[Zod Validation]
    end

    subgraph Infrastructure
        DB[(Postgres DB)]
        Storage[Vercel Blob]
        AI[Gemini AI]
    end

    Client -->|1. Submit Request| Action
    Action -->|2. Authenticate| Auth
    Action -->|3. Validate Data| Validation

    Validation -->|Valid| DB
    Validation -->|Valid| Storage
    Validation -->|Valid| AI

    AI -->|Generated Feedback| Action
    DB -->|Persist Result| Action

    Action -->|4. Return Response| Client
```

### Key Technologies

- **Framework**: [Next.js 16.0.10](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **AI Engine**: Google Gemini Pro (Generative AI)
- **Styling**: Tailwind CSS
- **Testing**: Playwright (E2E) & Vitest (Unit)

---

## ✨ Key Features

- **🗣️ Speaking Module**: Record audio responses to realistic cues. Audio is uploaded, transcribed, and analyzed by AI for fluency, pronunciation, and lexical resource.
- **📝 Writing Module**: Write essays for Task 1 and Task 2. Get instant band score estimation and rewritten samples for improvement.
- **📖 Reading Module**: Practice with real-world reading passages and interactive question types (Multiple choice, gap fill).
- **🎧 Listening Module**: Audio-synced listening tests with automated scoring.
- **📊 Analytics Dashboard**: Track your progress over time with streaks, daily goals, and performance charts.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database URL

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/vyhoangquocnguyen/ielts-preparation-app.git
cd ielts-preparation-app
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and add the following keys:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ielts_db"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI (Google Gemini)
GEMINI_API_KEY=AIzaSy...

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### 3. Database Setup

Push the schema to your database:

```bash
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧪 Testing

We ensure code quality through a rigorous testing suite.

- **Unit Tests**: Validate core logic and utilities.
  ```bash
  npm run test:unit
  ```
- **E2E Tests**: Validate full user journeys.
  ```bash
  npm run test:e2e
  ```

For a detailed guide on adding and debugging tests, please refer to [TESTING_GUIDE.md](./TESTING_GUIDE.md).
