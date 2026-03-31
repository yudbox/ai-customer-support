# AI Customer Support

AI-powered customer support system with intelligent ticket routing, sentiment analysis, and automated responses using LangGraph multi-agent workflow.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TailwindCSS 4
- **Database:** PostgreSQL 16 (TypeORM)
- **AI/ML:** LangGraph, OpenAI GPT-3.5, HuggingFace Sentiment Analysis
- **Vector Database:** Pinecone (text-embedding-3-small, 1536 dimensions)
- **Infrastructure:** Docker, Vercel

## 🤖 Multi-Agent AI Workflow

The system uses a **6-agent LangGraph workflow** for intelligent ticket processing:

### Agent 1: Intake Agent 📥

- Extracts customer email, subject, body
- Identifies order numbers and tracking numbers
- Detects keywords (refund, urgent, angry, etc.)
- **Status:** ✅ Implemented

### Agent 2: Classification Agent 🏷️

- Uses OpenAI GPT-3.5 to categorize tickets
- Categories: Shipping, Payment, Product Quality, Technical, Refund/Return, Account Management
- Provides subcategory and confidence score
- **Status:** ✅ Implemented

### Agent 3: Sentiment Agent 😊😐😡

- Uses HuggingFace `cardiffnlp/twitter-roberta-base-sentiment-latest`
- Detects: POSITIVE, NEUTRAL, ANGRY
- Returns sentiment score (0-1) and emoji
- **Status:** ✅ Implemented

### Agent 4: Customer Lookup Agent 👤

- Fetches customer data from PostgreSQL
- Returns: tier (VIP/Regular/New), total orders, lifetime value, avg sentiment
- **Status:** ✅ Implemented

### Agent 5: Resolution Search Agent 🔍

- **Vector Search with Pinecone** - searches 85 resolved tickets
- Uses OpenAI `text-embedding-3-small` (1536 dimensions)
- Returns top-3 similar tickets with similarity scores
- Suggests solution if similarity > 80%
- **Status:** ✅ Implemented (85 tickets migrated to Pinecone)

### Agent 6: Priority Agent 🚨

- Calculates priority score (0-100)
- Formula: base + tier_boost + sentiment_penalty + category_urgency + rag_modifier
- Override rules: ANGRY sentiment, Technical+ANGRY, VIP+ANGRY, Revenue-blocking
- Levels: CRITICAL (15 min), HIGH (1 hr), MEDIUM (4 hrs), LOW (24 hrs)
- Human-in-the-loop: HIGH/CRITICAL tickets require manager approval
- **Status:** ✅ Implemented

### Workflow Architecture

```
START
  ↓
[Agent 1: Intake] → Extract metadata
  ↓
[Agent 2: Classification] → Categorize (OpenAI)
  ↓
[Agent 3: Sentiment] → Analyze emotion (HuggingFace)
  ↓
[Agent 4: Customer Lookup] → Fetch customer data (PostgreSQL)
  ↓
[Agent 5: Resolution Search] → Find similar tickets (Pinecone)
  ↓
[Agent 6: Priority] → Calculate urgency ✅
  ↓
END → Assign to team
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **npm** or **yarn** (comes with Node.js)

## 🚀 Quick Start (First Time Setup)

### 1. Start Docker Desktop

Open Docker Desktop application on your machine. Wait until it's fully running (green icon in system tray/menu bar).

### 2. Clone and Install Dependencies

```bash
cd ai-customer-support
npm install
```

### 3. Setup Environment Variables

Create `.env.local` file in the project root:

```bash
# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_EMBEDDING_MODEL=
OPENAI_EMBEDDING_DIMENSIONS=

# HuggingFace (for Sentiment Analysis)
HUGGINGFACE_API_KEY=
HUGGINGFACE_MODEL=

# Pinecone (for Vector Search)
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
PINECONE_NAMESPACE=

# Database - Local
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# App Config
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

**Get API Keys:**

- OpenAI: https://platform.openai.com/api-keys
- HuggingFace: https://huggingface.co/settings/tokens
- Pinecone: https://app.pinecone.io/

### 4. Start PostgreSQL Database

```bash
docker-compose up -d
```

**Verify it's running:**

```bash
docker ps
# Should show: ai-customer-support-db (Up)
```

### 5. Run Database Migrations

Create all database tables (customers, orders, tickets, etc.):

```bash
npm run migration:run
```

**Output:**

```
Migration: CreateTables1774302369993 has been executed successfully.
✅ 8 tables created (customers, orders, tickets, shipments, products, categories, teams, refunds)
```

### 6. Seed Database with Test Data

**Option A: Use existing seed data (fastest)**

```bash
npm run seed:clear
```

**Option B: Generate fresh seed data**

```bash
# Generate JSON files
npx tsx scripts/generate-customers.ts --vip=30 --regular=70 --new=150
npx tsx scripts/generate-teams.ts
npx tsx scripts/generate-categories.ts
npx tsx scripts/generate-products.ts --count=50
npx tsx scripts/generate-orders.ts --count=500
npx tsx scripts/generate-shipments.ts
npx tsx scripts/generate-tickets.ts --count=200
npx tsx scripts/generate-refunds.ts --count=50

# Load into database
npm run seed:clear
```

**Seed Output:**

```
🎉 Seed completed successfully!
📊 Total records inserted: 1,433
   Customers: 250
   Orders: 500
   Tickets: 200
   Shipments: 359
   Refunds: 50
   (+ Products, Categories, Teams)
```

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 📋 Daily Startup (After First Setup)

```bash
# 1. Make sure Docker Desktop is running
docker ps

# 2. Start PostgreSQL (if not running)
docker-compose up -d

# 3. Start Next.js
npm run dev
```

---

## 🛠️ Available Scripts

### Development

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database

```bash
npm run db:test                # Test database connection
npm run migration:generate     # Generate new migration from entities
npm run migration:run          # Apply pending migrations
npm run migration:revert       # Rollback last migration
npm run seed                   # Add seed data (keeps existing)
npm run seed:clear             # Clear all data + reseed
```

### Vector Database (Pinecone)

```bash
# Migrate resolved tickets to Pinecone
npx tsx scripts/seed-pinecone-tickets.ts

# Output:
# ✅ 85 tickets migrated to Pinecone
# Namespace: support-tickets
# Embeddings: text-embedding-3-small (1536 dims)
# Cost: ~$0.0017
```

### Data Generation

```bash
npm run generate:customers     # Generate customers.json
# For other tables, use: npx tsx scripts/generate-<table>.ts
```

---

## 🗄️ Database Schema

**8 Tables with UUID Primary Keys:**

- **customers** - Customer profiles (VIP/Regular/New tiers)
- **orders** - Purchase orders with JSONB items
- **tickets** - Support tickets with priority/sentiment/routing
- **shipments** - Order tracking with event history (JSONB)
- **refunds** - Refund requests linked to tickets
- **products** - Product catalog with specs (JSONB)
- **categories** - Ticket categories for AI routing
- **teams** - Support teams with members

**Key Features:**

- Foreign Keys with CASCADE/SET NULL
- Composite Index: `(status, priority_score)` on tickets
- PostgreSQL ENUM types for status fields
- JSONB fields for flexible data (items, events, specs)

**View in DBeaver:**

```sql
-- Check all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Verify data counts
SELECT 'customers' as table_name, COUNT(*) FROM customers
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'tickets', COUNT(*) FROM tickets;

-- Test relationships
SELECT
  t.ticket_number,
  c.name as customer,
  o.id as order_id
FROM tickets t
JOIN customers c ON t.customer_id = c.id
LEFT JOIN orders o ON t.order_id = o.id
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose down
docker-compose up -d

# Test connection
npm run db:test
```

### Port 5432 Already in Use

```bash
# Stop conflicting PostgreSQL
# macOS:
brew services stop postgresql

# Or change port in docker-compose.yml:
ports:
  - "5433:5432"  # Use 5433 instead
```

### Migrations Already Applied

```bash
# Revert and reapply
npm run migration:revert
npm run migration:run
```

### Seed Data Issues

```bash
# Clear and reseed
npm run seed:clear

# Or manually:
docker-compose down -v  # Remove volumes
docker-compose up -d
npm run migration:run
npm run seed:clear
```

### TypeORM Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 🏗️ Project Structure

```
ai-customer-support/
├── app/                       # Next.js App Router
│   ├── page.tsx              # Customer support form
│   ├── manager/              # Manager dashboard
│   └── api/
│       ├── tickets/          # Ticket CRUD + streaming
│       └── trpc/             # tRPC API routes
├── lib/
│   ├── database/
│   │   ├── data-source.ts        # TypeORM configuration
│   │   ├── entities/             # TypeORM entities (8 tables)
│   │   └── migrations/           # Database migrations
│   ├── langgraph/
│   │   ├── workflow.ts           # 6-agent LangGraph workflow
│   │   └── agentNodes/           # Individual agent implementations
│   │       ├── intakeNode.ts
│   │       ├── classificationNode.ts
│   │       ├── sentimentNode.ts
│   │       ├── customerNode.ts
│   │       ├── resolutionSearchNode.ts  # Pinecone RAG
│   │       └── priorityNode.ts          # Priority calculation
│   ├── services/
│   │   └── embeddings.ts         # OpenAI embedding service
│   ├── clients/
│   │   └── pinecone.ts           # Pinecone client singleton
│   └── types/
│       └── agents.ts             # TypeScript interfaces for agents
├── scripts/
│   ├── generate-*.ts             # Seed data generators (8 tables)
│   ├── seed-database.ts          # PostgreSQL seeder
│   └── seed-pinecone-tickets.ts  # Pinecone migration (85 tickets)
├── data/                         # Generated JSON seed files
├── docker-compose.yml            # PostgreSQL container
└── .env.local                    # Environment variables
```

---

## 🧪 Testing the AI Workflow

### Test Agent 5 (Resolution Search)

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Create a test ticket with technical issue:

```
Subject: Website checkout not working
Body: I'm trying to complete my purchase but the checkout page keeps crashing...
```

**Expected Results:**

```
✅ Agent 1: Intake Agent - keywords: ["payment", "asap"]
✅ Agent 2: Classification - Technical Issues / Checkout Issue (95%)
✅ Agent 3: Sentiment - ANGRY 😡 (0.83)
✅ Agent 4: Customer Lookup - New tier, 0 orders, $0 LTV
✅ Agent 5: Resolution Search - Found 3 similar tickets (54-58% similarity)
   1. [58.0%] "Help needed - crash"
   2. [54.5%] "Problem: technical"
   3. [54.3%] "Issue with technical"
```

### Vector Search Quality

- **High similarity (>80%):** Exact match categories - suggests solution
- **Medium similarity (50-80%):** Related issues - shows similar tickets
- **Low similarity (<50%):** Different categories - needs human review

**Example Similarity Scores:**

| Test Ticket          | Similar Ticket Category | Score |
| -------------------- | ----------------------- | ----- |
| Checkout crash       | Technical Issues        | 58%   |
| iPhone compatibility | Product Quality         | 33%   |
| Refund request       | Refund/Return           | 92%   |

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add Vercel Postgres database
4. Set environment variables:
   - `POSTGRES_URL` - from Vercel Postgres
   - `OPENAI_API_KEY`
   - `LANGCHAIN_API_KEY` (optional)
5. Deploy!

**Seed Production Database:**

```bash
# Option 1: Local with production URL
POSTGRES_URL="postgresql://...vercel.com/..." npm run seed:clear

# Option 2: Create API endpoint /api/seed (see docs)
```

### Docker Production

```bash
docker build -t ai-customer-support .
docker run -p 3000:3000 ai-customer-support
```

---

## 📄 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

**Built with ❤️ using Next.js, TypeORM, and LangGraph**
