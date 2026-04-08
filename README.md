# AI Customer Support

> **🚀 Production-Ready MVP** | Multi-Agent AI System with Human-in-the-Loop Workflow

AI-powered customer support system with intelligent ticket routing, sentiment analysis, and automated responses using LangGraph multi-agent workflow.

## 🎯 Project Status

**MVP Complete (95%+)** - Deployed to Vercel Production

### ✅ Implemented Features

#### Core AI Workflow

- ✅ **6 AI Agents** (Intake, Classification, Sentiment, Customer Lookup, RAG, Priority)
- ✅ **LangGraph Multi-Agent Orchestration** with PostgreSQL Checkpointer
- ✅ **Pinecone RAG** - 85 resolved tickets for similarity search
- ✅ **Real-time SSE Streaming** - Live workflow progress updates

#### Human-in-the-Loop (HITL) System

- ✅ **Manager Dashboard** - Real-time pending tickets sidebar
- ✅ **Approve/Reject Flow** - With resolution editing and team assignment
- ✅ **AI Recommendations** - Pinecone similar tickets in detail panel
- ✅ **Workflow Pause/Resume** - LangGraph checkpoint-based state persistence
- ✅ **Toast Notifications** - User feedback for approval/rejection actions
- ✅ **Query Param State** - URL-based navigation for approved/rejected tickets

#### Customer Interface

- ✅ **Ticket Submission Form** - 6 demo scenarios
- ✅ **Real-time Progress Stream** - Live agent updates via SSE
- ✅ **Toast Notifications** - Deployment status and ticket updates
- ✅ **Responsive UI** - Mobile-first design with TailwindCSS

#### Infrastructure & Quality

- ✅ **tRPC API Layer** - Type-safe client-server communication
- ✅ **PostgreSQL Database** - 9 tables (6 active, 3 reserved for Phase 5)
- ✅ **Lazy DataSource Init** - Production-ready build configuration
- ✅ **Pre-commit Hooks** - Type check + lint (Husky)
- ✅ **Pre-push Hooks** - Coverage enforcement (70% minimum for unit & integration tests) + Accessibility tests
- ✅ **GitHub Actions CI** - Automated quality checks + coverage validation + accessibility compliance on PRs
- ✅ **Vercel Deployment** - Production-ready with zero-downtime updates
- ✅ **Comprehensive Testing** - 2,215+ tests with 70%+ coverage
  - Unit: 1,150+ tests (97% coverage)
  - Integration: 750+ tests (91% coverage)
  - Accessibility: 315 tests (WCAG 2.1 AA / EU Directive 2019/882 compliance)

### 🔄 In Progress (Phase 5)

- ⏸️ **Analytics Dashboard** - KPIs, metrics, performance tracking
- ⏸️ **Slack Integration** - Real-time notifications
- ⏸️ **Admin Panel** - Configuration management
- ⏸️ **Product Q&A Agent** - Activate products table
- ⏸️ **Refund Automation** - Activate refunds table
- ⏸️ **Shipment Tracking** - Activate shipments table

**📋 Full Roadmap:** See `docs/PHASE_5_POST_MVP_STRATEGY.md`

---

## Tech Stack

### Frontend

- **Next.js 16** (App Router, Turbopack)
- **React 19** (Server Components, Suspense)
- **TailwindCSS 4** (Utility-first CSS)
- **tRPC** (Type-safe API client)
- **React Hook Form + Zod** (Form validation)

### Backend

- **tRPC** (Type-safe API layer)
- **Server-Sent Events (SSE)** (Real-time streaming)
- **TypeORM** (PostgreSQL ORM with lazy initialization)

### AI/ML

- **LangGraph** (Multi-agent orchestration)
- **OpenAI GPT-4o-mini** (Classification, embeddings)
- **HuggingFace** (Sentiment analysis)
- **Pinecone** (Vector database for RAG - 85 tickets)

### Infrastructure

- **PostgreSQL 16** (Primary database)
- **Docker** (Local development)
- **Vercel** (Production deployment)

### DevOps & Quality

- **Husky** (Git hooks: pre-commit, pre-push)
- **GitHub Actions** (CI/CD pipeline)
- **Jest + React Testing Library** (Unit/Integration tests)
- **jest-axe** (Accessibility testing - WCAG 2.1 AA)
- **ESLint + TypeScript** (Code quality)

---

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
- **Human-in-the-Loop:** HIGH/CRITICAL tickets require manager approval
- **Status:** ✅ Implemented

### 🔄 Human-in-the-Loop (HITL) Workflow

**LangGraph Interrupt System:**

```typescript
// Workflow pauses after Priority Agent if score ≥ 70 (HIGH/CRITICAL)
const workflow = new StateGraph<WorkflowState>()
  .addNode("priorityAgent", priorityNode)
  .addEdge("priorityAgent", "finalizeTicket")
  .compile({
    checkpointer: postgresSaver, // Persists state
    interruptAfter: ["priorityAgent"], // Pause here
  });

// Manager approves/rejects via tRPC API
await workflow.updateState(threadId, {
  status: "APPROVED",
  manager_notes: "Approved - assign to VIP team",
});

// Workflow resumes from checkpoint
await workflow.invoke(null, { configurable: { thread_id: threadId } });
```

**Manager Dashboard Features:**

- ✅ Real-time pending tickets sidebar with live updates
- ✅ Full ticket detail panel with AI analysis
  - Customer info (tier, lifetime value, sentiment history)
  - AI priority score breakdown and reasoning
  - Top 3 similar resolved tickets from Pinecone (clickable)
  - Suggested resolution with confidence score
- ✅ Approve/Reject workflow
  - Edit resolution text before approval
  - Select support team for assignment
  - Auto-assign team member
  - Reject with reason (creates manager notes)
- ✅ URL state management with query params
- ✅ Toast notifications for user actions
- ✅ Responsive UI with mobile support
- ✅ PostgreSQL Checkpointer for workflow state persistence
- ✅ Automatic workflow resume after approval/rejection

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
[Agent 6: Priority] → Calculate urgency (0-100)
  ↓
[INTERRUPT if score ≥ 70] → Manager Dashboard (HITL) 🛑
  ↓
[Continue after approval] → Finalize Ticket ✅
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
npm run type         # TypeScript type checking
```

### Testing

```bash
# Run all tests
npm test                      # Run both unit + integration tests

# Run specific test suites
npm run test:unit             # Unit tests only (1,150+ tests)
npm run test:int              # Integration tests only (750+ tests)
npm run test:a11y             # Accessibility tests with coverage (315 tests)
npm run test:a11y:check       # Accessibility tests only (no coverage)
npm run test:a11y:report      # Generate coverage report + open in browser

# Coverage reports (70% minimum enforced)
npm run test:coverage:unit    # Unit tests with coverage
npm run test:coverage:integration # Integration tests with coverage
npm run test:coverage         # Full coverage report (both suites)

# Development
npm run test:watch            # Run tests in watch mode
npm run test:a11y:watch       # Run accessibility tests in watch mode
```

**Test Infrastructure:**

- **Unit Tests:** `jest.config.js` - 1,150+ tests (97% coverage)
  - Agent nodes, tRPC routers, repositories, services
  - Uses `@testing-library/react` + `@testing-library/jest-dom`
  - In-memory mocks (no database)

- **Integration Tests:** `jest.integration.config.js` - 750+ tests (91% coverage)
  - Full workflow, API routes, components
  - Uses `pg-mem` (in-memory PostgreSQL)
  - MSW for external API mocking (OpenAI, Pinecone, HuggingFace)

- **Accessibility Tests:** `jest.accessibility.config.mjs` - 315 tests (**WCAG 2.1 AA Compliance**)
  - **EU Directive 2019/882** compliance testing
  - Uses `jest-axe` for automated accessibility validation
  - Tests TIER 1 critical components (Header, TicketForm, Modals)
  - **100% coverage** for UI component library (`components/ui/`)
  - **85%+ coverage** for business components
  - **Components tested:**
    - ✅ Button (40 tests) - ARIA states, keyboard nav, loading states
    - ✅ Input (35 tests) - Labels, error states, ARIA attributes
    - ✅ Textarea (31 tests) - Character limits, error handling
    - ✅ Select (33 tests) - Dropdown accessibility, keyboard support
    - ✅ Modal (45 tests) - Focus trap, ESC key, backdrop clicks
    - ✅ Sidebar (21 tests) - Mobile menu, keyboard nav
    - ✅ Toast (19 tests) - Screen reader announcements
    - ✅ Header Navigation (29 tests) - ARIA current, mobile menu
    - ✅ TicketForm (36 tests) - Form validation, character counters
    - ✅ Approve/Reject Modals (35 tests) - Dialog roles, focus management
  - **WCAG 2.1 Success Criteria:**
    - ✅ 1.3.1 - Info and Relationships (semantic HTML)
    - ✅ 2.1.1 - Keyboard navigation (no mouse required)
    - ✅ 2.4.3 - Focus Order (logical tab sequence)
    - ✅ 3.2.4 - Consistent Identification (predictable UI)
    - ✅ 4.1.2 - Name, Role, Value (ARIA attributes)
    - ✅ 1.4.3 - Contrast (color accessibility)

- **Coverage Enforcement:** 70% minimum (statements, branches, functions, lines)
  - Pre-push hook blocks push if coverage < 70%
  - GitHub Actions CI blocks PR merge if coverage < 70%

**Total:** 2,215+ tests | Unit: 97% | Integration: 91% | Accessibility: 315 tests (WCAG 2.1 AA)

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
```

---

## ♿ Accessibility (WCAG 2.1 AA Compliance)

The application is fully compliant with **WCAG 2.1 Level AA** and **EU Directive 2019/882** for digital accessibility.

### Automated Testing with jest-axe

**315 accessibility tests** covering all UI components and critical user flows:

```bash
npm run test:a11y          # Run all accessibility tests with coverage
npm run test:a11y:check    # Quick check (no coverage report)
npm run test:a11y:report   # Generate coverage report + open in browser
```

### Components Coverage

**TIER 1 - Critical User Flows (100% tested):**

- ✅ **Header Navigation** (29 tests)
  - Screen reader navigation
  - Keyboard-only navigation (Tab, Enter, Escape)
  - ARIA current page indication
  - Mobile menu accessibility with focus management
  - Visual focus indicators

- ✅ **Ticket Submission Form** (36 tests)
  - Form validation with ARIA error messages
  - Required field indicators
  - Character counter accessibility
  - Live region announcements for errors
  - Keyboard navigation and logical tab order

- ✅ **Approve/Reject Modals** (35 tests)
  - Dialog role and ARIA modal attributes
  - Focus trap within modal
  - Escape key support
  - Focus return to trigger element
  - Backdrop click handling

**UI Component Library (100% coverage):**

- ✅ **Button** (40 tests) - Loading states, disabled states, ARIA labels
- ✅ **Input** (35 tests) - Label association, error states, ARIA invalid
- ✅ **Textarea** (31 tests) - Character limits, maxLength, error handling
- ✅ **Select** (33 tests) - Dropdown keyboard navigation, option selection
- ✅ **Modal** (45 tests) - Focus management, keyboard support, backdrop
- ✅ **Sidebar** (21 tests) - Mobile drawer, focus trap, body scroll lock
- ✅ **Toast** (19 tests) - Screen reader announcements via ARIA live regions

### WCAG 2.1 Success Criteria

All components meet the following Level AA success criteria:

**Perceivable:**

- ✅ **1.3.1 Info and Relationships** - Semantic HTML (form, nav, aside, role="dialog")
- ✅ **1.4.3 Contrast (Minimum)** - 4.5:1 for normal text, 3:1 for large text

**Operable:**

- ✅ **2.1.1 Keyboard** - All functionality available via keyboard
- ✅ **2.4.3 Focus Order** - Logical tab sequence
- ✅ **2.4.7 Focus Visible** - Clear focus indicators on all interactive elements

**Understandable:**

- ✅ **3.2.1 On Focus** - No context change on focus
- ✅ **3.2.2 On Input** - Predictable behavior for form inputs
- ✅ **3.3.1 Error Identification** - Clear error messages with ARIA invalid
- ✅ **3.3.2 Labels or Instructions** - All inputs have associated labels

**Robust:**

- ✅ **4.1.2 Name, Role, Value** - Proper ARIA attributes on all components
- ✅ **4.1.3 Status Messages** - ARIA live regions for dynamic content

### Keyboard Navigation

All critical flows support keyboard-only navigation:

- **Tab / Shift+Tab** - Navigate between interactive elements
- **Enter / Space** - Activate buttons and links
- **Escape** - Close modals and mobile menu
- **Arrow Keys** - Navigate dropdown options

### Testing Tools

- **jest-axe** - Automated accessibility auditing (axe-core engine)
- **@testing-library/react** - Semantic queries (getByRole, getByLabelText)
- **Color contrast tests** - Validates WCAG AA ratio (4.5:1 minimum)

### CI/CD Integration

Accessibility tests run on:

- ✅ **Pre-push hook** - Blocks push if any test fails
- ✅ **GitHub Actions** - Blocks PR merge if compliance breaks
- ✅ **Every commit** - Ensures continuous accessibility compliance

---

## 🔄 CI/CD Pipeline

### Pre-commit Hooks (Husky)

Runs automatically before each commit:

```bash
🔍 Type checking (tsc --noEmit)
🧹 Linting (eslint)
```

**Fast commits** - No tests in pre-commit to keep commits quick.

### Pre-push Hooks

Runs before pushing to remote:

```bash
🧪 Unit tests with coverage (npm run test:coverage:unit)
♿ Accessibility tests (npm run test:a11y:check)
🚫 BLOCKS PUSH if coverage < 70%, accessibility tests fail, or unit tests fail
```

**Coverage enforcement:**

- Unit test coverage must be ≥ 70%
- Accessibility: All 315 WCAG 2.1 AA tests must pass
- Clear error messages show which threshold failed
- Current coverage: Unit 97% | Integration 91% (run separately in CI)

### GitHub Actions CI

Runs on pull requests and main branch pushes:

```yaml
Jobs: 1. Quality Checks
  - Lint code
  - Type checking
  - Unit tests with coverage (70% minimum)
  - Integration tests with coverage (70% minimum)
  - ♿ Accessibility tests (WCAG 2.1 AA - 315 tests)
  - 🚫 BLOCKS PR MERGE if any check fails

  2. Build Check
  - Production build
  - Validates lazy DataSource init
  - Mock env vars for build

  3. Summary
  - Overall status report
  - Coverage statistics
  - Mark PR as ready/blocked
```

**Configuration:** `.github/workflows/ci.yml`

**Test Database:** Uses `pg-mem` (in-memory PostgreSQL) - no Docker/services needed in CI

**Setup:**

1. Enable GitHub Actions in repository settings
2. (Optional) Add API keys to GitHub Secrets for E2E tests
3. CI runs automatically on PRs with full coverage validation

**Status:** ✅ Active - All checks passing (2,215+ tests, 70%+ coverage enforced, WCAG 2.1 AA compliance)

---

## 🗄️ Database Schema

### 9 Tables with UUID Primary Keys:\*\*

### Core Tables (6 - Active in MVP)

- ✅ **customers** - Customer profiles (VIP/Regular/New tiers)
- ✅ **tickets** - Support tickets with priority/sentiment/routing
- ✅ **orders** - Purchase orders with JSONB items
- ✅ **categories** - Ticket categories for AI routing
- ✅ **teams** - Support teams with members
- ✅ **ticket_workflow_state** - LangGraph checkpointer (HITL state persistence)

### Reserved Tables (3 - Phase 5 Features)

- ⏸️ **products** - Product catalog with specs (Phase 5.2: Product Q&A Agent)
- ⏸️ **refunds** - Refund requests linked to tickets (Phase 5.4: Refund Automation)
- ⏸️ **shipments** - Order tracking with event history (Phase 5.5: Shipment Tracking)

**Key Features:**

- Foreign Keys with CASCADE/SET NULL
- Composite Index: `(status, priority_score)` on tickets
- PostgreSQL ENUM types for status fields
- JSONB fields for flexible data (items, events, specs, compatibility)
- **LangGraph Checkpointer** - ticket_workflow_state table for HITL persistence

```yaml
Jobs: 1. Quality Checks
  - Lint code
  - Type checking
  - Unit tests

  2. Build Check
  - Production build
  - Validates lazy DataSource init
  - Mock env vars for build

  3. Summary
  - Overall status report
  - Mark PR as ready/blocked
```

**Configuration:** `.github/workflows/ci.yml`

**Setup:**

1. Enable GitHub Actions in repository settings
2. (Optional) Add API keys to GitHub Secrets for E2E tests
3. CI runs automatically on PRs

**Status:** ✅ Active - All checks passing

---

## 🗄️ Database Schema

### 9 Tables with UUID Primary Keys:\*\*

### Core Tables (6 - Active in MVP)

- ✅ **customers** - Customer profiles (VIP/Regular/New tiers)
- ✅ **tickets** - Support tickets with priority/sentiment/routing
- ✅ **orders** - Purchase orders with JSONB items
- ✅ **categories** - Ticket categories for AI routing
- ✅ **teams** - Support teams with members
- ✅ **ticket_workflow_state** - LangGraph checkpointer (HITL state persistence)

### Reserved Tables (3 - Phase 5 Features)

- ⏸️ **products** - Product catalog with specs (Phase 5.2: Product Q&A Agent)
- ⏸️ **refunds** - Refund requests linked to tickets (Phase 5.4: Refund Automation)
- ⏸️ **shipments** - Order tracking with event history (Phase 5.5: Shipment Tracking)

**Key Features:**

- Foreign Keys with CASCADE/SET NULL
- Composite Index: `(status, priority_score)` on tickets
- PostgreSQL ENUM types for status fields
- JSONB fields for flexible data (items, events, specs, compatibility)
- **LangGraph Checkpointer** - ticket_workflow_state table for HITL persistence
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
│   ├── manager/              # Manager dashboard (HITL approval)
│   └── api/
│       ├── tickets/          # Ticket CRUD + SSE streaming
│       └── trpc/             # tRPC API routes
├── lib/
│   ├── database/
│   │   ├── data-source.ts        # TypeORM configuration
│   │   ├── entities/             # TypeORM entities (9 tables)
│   │   └── migrations/           # Database migrations
│   ├── langgraph/
│   │   ├── workflow.ts           # 6-agent LangGraph workflow
│   │   ├── checkpointer/         # PostgreSQL checkpointer (HITL)
│   │   └── agentNodes/           # Individual agent implementations
│   │       ├── intakeNode.ts
│   │       ├── classificationNode.ts
│   │       ├── sentimentNode.ts
│   │       ├── customerNode.ts
│   │       ├── resolutionSearchNode.ts  # Pinecone RAG
│   │       └── priorityNode.ts          # Priority calculation + HITL trigger
│   ├── trpc/
│   │   ├── routers/              # tRPC API routers
│   │   │   ├── tickets.ts        # Ticket CRUD operations
│   │   │   └── workflow.ts       # Workflow state management
│   │   └── context.ts            # tRPC context
│   ├── services/
│   │   └── embeddings.ts         # OpenAI embedding service
│   ├── clients/
│   │   └── pinecone.ts           # Pinecone client singleton
│   └── types/
│       └── agents.ts             # TypeScript interfaces for agents
├── components/
│   ├── ui/                       # Reusable UI components
│   └── manager/                  # Manager dashboard components
├── scripts/
│   ├── generate-*.ts             # Seed data generators (9 tables)
│   ├── seed-database.ts          # PostgreSQL seeder
│   └── seed-pinecone-tickets.ts  # Pinecone migration (85 tickets)
├── data/                         # Generated JSON seed files
├── docs/                         # Project documentation
│   ├── PHASE_5_POST_MVP_STRATEGY.md  # Post-MVP roadmap
│   └── *.md                      # Other documentation
├── jest.config.js                # Unit test configuration
├── jest.integration.config.js    # Integration test configuration
├── jest.setup.js                 # Jest global setup
├── docker-compose.yml            # PostgreSQL container
└── .env.local                    # Environment variables
```

**Note:** Test infrastructure is configured (Jest configs ready), but test files to be implemented in Phase 5.1.

---

│ │ ├── customerNode.ts
│ │ ├── resolutionSearchNode.ts # Pinecone RAG
│ │ └── priorityNode.ts # Priority calculation
│ ├── services/
│ │ └── embeddings.ts # OpenAI embedding service
│ ├── clients/
│ │ └── pinecone.ts # Pinecone client singleton
│ └── types/
│ └── agents.ts # TypeScript interfaces for agents
├── scripts/
│ ├── generate-\*.ts # Seed data generators (8 tables)
│ ├── seed-database.ts # PostgreSQL seeder
│ └── seed-pinecone-tickets.ts # Pinecone migration (85 tickets)
├── data/ # Generated JSON seed files
├── docker-compose.yml # PostgreSQL container
└── .env.local # Environment variables

````

---

## 🧪 Testing Guide (Phase 5.1)

### Setup Testing Environment

**1. Install dependencies:**

```bash
npm install
````

**New dependencies added:**

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@types/jest": "^29.5.14"
  }
}
```

**2. Test configurations created:**

- **`jest.config.js`** - Unit tests configuration
  - Tests: `lib/**/__tests__`, `components/**/__tests__`, `app/**/__tests__`
  - Coverage: Agent nodes, utils, components
  - Target: 70%+ coverage
- **`jest.integration.config.js`** - Integration tests configuration
  - Tests: `tests/integration/**`
  - Coverage: API routes, workflow, tRPC routers
  - Timeout: 30s (for workflow tests)

- **`jest.setup.js`** - Global test setup
  - Mocks environment variables
  - Configures testing-library

### Running Tests

```bash
# Run all tests (unit + integration)
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:int

# Watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure (Ready for Implementation)

**Test Infrastructure Configured:**

- ✅ Jest config files created (`jest.config.js`, `jest.integration.config.js`)
- ✅ Test setup configured (`jest.setup.js`)
- ✅ NPM scripts ready
- ⏸️ Test files to be implemented (Phase 5.1)

**Planned Test Coverage:**

**Unit Tests (Target Directory: `lib/langgraph/agentNodes/__tests__/`):**

- Priority scoring algorithm tests
- HuggingFace sentiment mapping tests
- OpenAI classification tests
- Customer tier detection tests

**Integration Tests (Target Directory: `tests/integration/`):**

- Full 6-agent workflow tests
- Human-in-the-loop interrupt tests
- tRPC API endpoint tests
- Pinecone RAG similarity search tests

### Coverage Goals

| Category   | Target | Priority |
| ---------- | ------ | -------- |
| Statements | 70%+   | 🔴 HIGH  |
| Branches   | 70%+   | 🔴 HIGH  |
| Functions  | 70%+   | 🔴 HIGH  |
| Lines      | 70%+   | 🔴 HIGH  |

**Coverage Reports (when implemented):**

- Unit: `coverage/unit/`
- Integration: `coverage/integration/`
- Combined: View in terminal after `npm run test:coverage`

**Next Steps for Testing:**

1. Create test files in appropriate directories
2. Implement unit tests for agent nodes
3. Implement integration tests for workflows
4. Achieve 70%+ coverage target

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
