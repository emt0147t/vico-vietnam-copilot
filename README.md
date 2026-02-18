

# VICO - Vietnam Strategic Copilot

VICO is an AI-powered market intelligence platform tailored for the Vietnam market. It uses RAG (Retrieval-Augmented Generation) and Gemini 2.5/3.0 models to analyze competitors and generate strategic reports.

## 🎯 DATA QUALITY INITIATIVE (Jan 2024)

**Major Update:** We're transforming VICO from 60-70% synthetic data to **90%+ real, verified data** from authoritative sources with trust scoring and source attribution.

📋 **[START HERE → IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)** ← All documentation, code, and guides
- **🚀 Quick Start:** Get running in 2 hours
- **📚 Strategic Guide:** Understand the full approach
- **💻 Code Examples:** Copy-paste ready implementations
- **🔧 Troubleshooting:** Solutions for common issues
- **📊 Monitoring:** Real-time metrics dashboard

**What's Included:**
- ✅ Configuration updated to disable generated data
- ✅ Trust scoring engine (0-1.0 scale)
- ✅ Real-data-first data fetcher
- ✅ React components with trust badges & citations
- ✅ Server endpoints for metrics & verification
- ✅ Integration guides for backend & frontend
- ✅ Setup automation scripts
- ✅ Comprehensive troubleshooting guide

**Status:** Phase 3 complete. Ready for implementation. [See full project status](IMPLEMENTATION_COMPLETE.md#implementation-status-phase-3-complete)

---

## 🚀 Deployment Options

### Option 1: Quick Demo (Frontend Only)
*Best for: Exploring the UI and testing features quickly without setup.*

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set `GEMINI_API_KEY` in `.env`.
3. Run the app:
   ```bash
   npm run dev
   ```
   *Note: Data is saved in your browser's IndexedDB and will be lost if cache is cleared.*

---

### Option 2: Enterprise Deployment (Full-stack)
*Best for: Production, persistent data storage, and team usage.*

**Prerequisites:**
*   PostgreSQL Database (e.g., Supabase, Neon, or local Docker).
*   **Important:** The database MUST support the `vector` extension.

**Setup Steps:**

1. **Configure Database Connection:**
   Create a `.env` file and add your connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/vico_db"
   GEMINI_API_KEY="your_api_key_here"
   ```

2. **Enable Vector Extension:**
   Run this SQL command in your database query tool:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Push Schema to DB:**
   Sync the Prisma schema with your database:
   ```bash
   npx prisma db push
   ```

4. **Run the System:**
   Open two terminals:
   
   *Terminal 1 (Frontend):*
   ```bash
   npm run dev
   ```
   
   *Terminal 2 (Backend API):*
   ```bash
   npm run server
   ```

## Key Features

*   **RAG Engine:** Ingests CSV data about Vietnam companies and news.
*   **Live Copilot:** Real-time audio conversation using `gemini-2.5-flash-native-audio`.
*   **Strategic Reports:** Generates comprehensive PDF-style reports using `gemini-3-pro`.
*   **Market Radar:** Visualizes competitive landscape using vector similarity.
