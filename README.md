# Junto

> You're not building alone.

Junto is an AI co-founder for solo founders. It thinks with you, challenges your assumptions, and remembers every decision you've ever made.

**Live:** [junto.ink](https://junto.ink)

---

## What it does

- Remembers every decision across sessions
- Challenges your thinking — never just validates
- Builds strategic context over months
- Gets smarter the longer you use it

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend | FastAPI + Python |
| AI | Groq API (llama-3.3-70b-versatile) |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel (frontend) + Railway (backend) |

---

## Project Structure
junto-web/
frontend/          Next.js app
app/
page.tsx       Landing page
onboard/       Onboarding flow
chat/          Chat interface
public/
screenshot.png Product screenshot
backend/           FastAPI server
main.py          Entry point
routers/         API routes
db/              Supabase client
memory/          Memory system
loader.py      Loads founder context
summarizer.py  Summarizes sessions
compressor.py  Compresses old sessions

---

## Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- Supabase account
- Groq API key

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Fill in your keys in .env
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in your API URL
npm run dev
```

Open [localhost:3000](http://localhost:3000)

---

## Environment Variables

### Backend (`backend/.env`)
GROQ_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=

### Frontend (`frontend/.env.local`)
NEXT_PUBLIC_API_URL=http://localhost:8000

---

## Database Schema

```sql
founders    id, email, name, startup, stage, idea, icp,
            biggest_fear, current_focus, constraints

sessions    id, founder_id, summary, key_decisions,
            assumptions, action_items

memory      id, founder_id, digest

decisions   id, founder_id, decision, reasoning, outcome
```

---

## Memory Architecture

Every chat session is summarized and stored. On each new session, Junto loads:

1. **Founder profile** — who they are, what they're building
2. **Memory digest** — compressed history of all past sessions
3. **Recent sessions** — last 5 session summaries

This means Junto never starts from scratch.

---

## Deployment

**Backend → Railway**
```bash
cd backend
railway init
railway up
```

**Frontend → Vercel**
```bash
cd frontend
vercel --prod
```

---

Built by [Khyathi](https://junto.ink) — a solo founder, for solo founders.
