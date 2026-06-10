<p align="center">
  <img src="./public/github-banner.jpg" alt="BrightSide Banner" width="100%" />
</p>

<h1 align="center">
  <span style="font-family: Georgia, serif;">BrightSide</span>
</h1>

<p align="center">
  <em>An AI-powered good news aggregation platform that ranks stories by real-world impact — not clicks.</em>
</p>

<p align="center">
  <a href="#-features">Features</a> &nbsp;&bull;&nbsp;
  <a href="#-tech-stack">Tech Stack</a> &nbsp;&bull;&nbsp;
  <a href="#-architecture">Architecture</a> &nbsp;&bull;&nbsp;
  <a href="#-getting-started">Getting Started</a> &nbsp;&bull;&nbsp;
  <a href="#-hope-score">Hope Score</a> &nbsp;&bull;&nbsp;
  <a href="#-api">API</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc&logoColor=white" />
  <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white" />
</p>

---

## ✨ Features

### For Readers

| Feature | Description |
|---------|-------------|
| **Hope Score** | Every article is ranked by a 5-dimension AI classifier: Verified Facts, Systemic Impact, Actionability, Novelty, Representation |
| **Mood Filtering** | Select your mood (Motivated, Calm, Informed, Inspired) and stories are re-ranked to match |
| **Social Share Cards** | Generate beautiful, branded photo cards in 3 themes × 6 platform sizes for Instagram, Twitter, LinkedIn, Facebook |
| **Interactive Dashboard** | World impact map, trend charts, category breakdowns, animated progress counters |
| **Full-Text Search** | Search across all article titles, summaries, and content |
| **Reading History** | Track articles read, time spent, and actions taken |
| **Hope Budget** | Set daily reading limits for mindful news consumption |

### For Admins

| Feature | Description |
|---------|-------------|
| **Admin Panel** | Article moderation, source management, analytics dashboard |
| **RSS Pipeline** | Auto-fetch from 5+ good news sources, classify, and store |
| **Source CRUD** | Add, edit, activate/deactivate news sources with trust scores |
| **Analytics** | Category/tier breakdowns, daily activity charts, engagement metrics |

---

## 🛠 Tech Stack

### Frontend

```
React 19 + TypeScript + Vite
Tailwind CSS + shadcn/ui (40+ components)
Framer Motion (animations)
Lucide React (icons)
p5.js (particle effects)
Three.js (3D Hope Orb)
```

### Backend

```
Hono (HTTP framework)
tRPC 11.x (end-to-end type safety)
Drizzle ORM (type-safe MySQL queries)
MySQL (via mysql2)
fast-xml-parser (RSS scraping)
```

### Authentication

```
OAuth 2.0 (Kimi)
JWT sessions (secure cookies)
Role-based access (user / admin)
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Home    │ │  Feed    │ │ Article  │           │
│  │ (Hero)   │ │(Filters) │ │ (Detail) │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Dashboard│ │Bangladesh│ │  Admin   │           │
│  │ (Charts) │ │ (Focus)  │ │ (Panel)  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
└──────────────────────┬──────────────────────────────┘
                       │ tRPC (type-safe RPC)
┌──────────────────────┴──────────────────────────────┐
│                    Backend                           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │article │ │dashboard│ │ scraper│ │  auth  │      │
│  │ router │ │ router │ │ router │ │ router │      │
│  └────────┘ └────────┘ └────────┘ └────────┘      │
│  ┌────────┐ ┌────────┐ ┌────────┐                  │
│  │  seed  │ │  admin │ │  Hope  │                  │
│  │ router │ │ router │ │Score AI│                  │
│  └────────┘ └────────┘ └────────┘                  │
└──────────────────────┬──────────────────────────────┘
                       │ Drizzle ORM
┌──────────────────────┴──────────────────────────────┐
│                    Database                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ articles │ │ sources  │ │  users   │           │
│  │(HopeScore)│ │(Trust)  │ │(OAuth)   │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────────────────┐             │
│  │categories│ │ user_reading_history │             │
│  └──────────┘ └──────────────────────┘             │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MySQL database (local or cloud)

### Installation

```bash
# Clone the repository
git clone https://github.com/mahidulislamnakib/BrightSide.git
cd BrightSide

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and OAuth credentials

# Push database schema
npm run db:push

# Seed the database
npx tsx db/seed.ts

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | ✅ |
| `VITE_APP_ID` | OAuth app ID | ✅ |
| `VITE_KIMI_AUTH_URL` | OAuth provider URL | ✅ |
| `APP_SECRET` | JWT signing secret | ✅ |
| `OWNER_UNION_ID` | Admin user union ID | |

---

## 🧠 Hope Score

The proprietary **Hope Score** is BrightSide's core innovation. Every article is analyzed across 5 dimensions:

| Dimension | Weight | How it's measured |
|-----------|--------|-------------------|
| **Verified Facts** | 25% | Source trust score + keyword analysis ("study", "data shows", "peer-reviewed") |
| **Systemic Impact** | 25% | Impact keywords ("vaccine", "eradicated", "renewable", "peace treaty") |
| **Actionability** | 20% | Action keywords ("donate", "volunteer", "how to", "get involved") |
| **Novelty** | 15% | Recency + uniqueness score |
| **Representation** | 15% | Region tier (underreported: 0.9, developing: 0.7, western: 0.4) |

### Score Tiers

| Tier | Range | Color |
|------|-------|-------|
| 🥇 Gold Standard | 0.80 - 1.00 | `#F4A261` |
| 🔵 Verified | 0.65 - 0.79 | `#E8644B` |
| 🟢 Constructive | 0.50 - 0.64 | `#F4D0C4` |

---

## 📡 API

### tRPC Routers

| Router | Endpoints | Auth |
|--------|-----------|------|
| `article` | `list`, `byId`, `featured`, `related`, `search`, `morningBrief`, `classify`, `whyItMatters` | Public |
| `dashboard` | `stats`, `regions`, `metrics`, `impactMap` | Public |
| `scraper` | `scrape`, `scrapeSource`, `sources` | Public |
| `auth` | `url`, `me`, `logout`, `updatePrefs` | OAuth |
| `admin` | `stats`, `articles`, `updateArticle`, `deleteArticle`, `sources`, `createSource`, `analytics` | Admin only |
| `seed` | `run` | Public |

### Example Query

```typescript
import { trpc } from "@/providers/trpc";

function ArticleList() {
  const { data: articles } = trpc.article.list.useQuery({
    category: "Health",
    mood: "motivated",
  });

  return (
    <div>
      {articles?.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </div>
  );
}
```

---

## 🎨 Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Cream | `#FFFBF5` | Page background |
| Charcoal | `#1A1814` | Dark sections, text |
| Coral | `#E8644B` | Primary accent, buttons |
| Amber | `#F4A261` | Gold tier, highlights |
| Peach | `#F4D0C4` | Cards, soft accents |

### Typography

- **Display**: Oranienbaum (serif) — headlines, titles, numbers
- **Body**: Inter (sans-serif) — UI labels, metadata, body text

---

## 📁 Project Structure

```
├── api/                    # Backend
│   ├── routers/            # tRPC routers (article, auth, admin, scraper, dashboard)
│   ├── services/           # Business logic (RSS scraper, classifier)
│   ├── lib/                # Utilities (env, http, classifier engine)
│   ├── queries/            # Database query functions
│   ├── boot.ts             # Hono server entry
│   ├── router.ts           # tRPC app router
│   └── middleware.ts       # Auth middleware (public, authed, admin)
├── db/                     # Database
│   ├── schema.ts           # Drizzle ORM schema
│   ├── relations.ts        # Table relations
│   └── seed.ts             # Seed script
├── src/
│   ├── pages/              # Route pages (Home, Feed, Article, Dashboard, Admin)
│   ├── components/         # UI components + effects (Particles, Orb, ShareCard)
│   ├── hooks/              # Custom hooks (useAuth)
│   ├── data/               # Static data (categories, demo articles)
│   ├── lib/                # Frontend utilities (classifier)
│   └── providers/          # tRPC client provider
├── contracts/              # Shared types (frontend ↔ backend)
└── public/assets/          # Generated images
```

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](.github/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <em>Built with hope. Ranked by impact. Shared with the world.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F%20%2B%20%E2%98%80%EF%B8%8F-coral" />
</p>
