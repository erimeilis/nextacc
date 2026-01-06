<p align="center">
  <img src="public/icon.png" alt="NextAcc Logo" width="120" height="120">
</p>

# NextAcc

Telecom account management dashboard built with Next.js 16 and React 19.

## Documentation

- [API Specification](docs/API_SPECIFICATION.md) - Backend API requirements

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 16.1.1 |
| UI Library | React | 19.2.3 |
| Authentication | BetterAuth | 1.4.10 |
| State Management | Zustand | 5.0.9 |
| Styling | Tailwind CSS | 4.1.18 |
| Internationalization | next-intl | 4.7.0 |
| Mock Data | @faker-js/faker | 10.1.0 |
| Runtime (Docker) | Bun | 1.3 |

## Features

- Multi-language support: English, Polish, Ukrainian
- Google OAuth authentication
- Anonymous user sessions
- Demo mode with faker-generated data
- Live mode with backend API integration

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard home |
| `/profile` | User profile |
| `/transactions` | Money transactions |
| `/numbers` | Phone numbers management |
| `/statistics` | Usage statistics |
| `/uploads` | File uploads |
| `/ivr` | IVR orders |
| `/waiting-numbers` | Pending numbers |

---

## Development

### Prerequisites

- Node.js 22+ or Bun 1.3+
- npm or bun

### Setup

```bash
git clone <repository-url>
cd nextacc

npm install
# or: bun install

cp .env.example .env

npm run dev
# or: bun run dev
```

### Environment Variables

```bash
# Data mode
NEXT_PUBLIC_DATA_MODE=demo    # demo | live
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth (required for Google OAuth)
BETTER_AUTH_SECRET=           # openssl rand -hex 32
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

### Data Modes

**Demo** (`NEXT_PUBLIC_DATA_MODE=demo`): Uses @faker-js/faker for mock data. No backend required.

**Live** (`NEXT_PUBLIC_DATA_MODE=live`): Connects to real backend API.

---

## Deployment

### Docker

```bash
# Build and run
docker compose up --build

# Background
docker compose up -d

# Logs
docker compose logs -f

# Stop
docker compose down
```

### Manual Build

```bash
docker build -t nextacc .
docker run -p 3000:3000 -e NEXT_PUBLIC_DATA_MODE=demo nextacc
```

---

## Why Bun?

Three JavaScript runtimes were evaluated for production:

### HTTP Throughput (Express-style server)

| Runtime | Requests/sec | Source |
|---------|--------------|--------|
| Bun | **52,479** | [Better Stack](https://betterstack.com/community/guides/scaling-nodejs/nodejs-vs-deno-vs-bun/) |
| Deno | 22,287 | [Better Stack](https://betterstack.com/community/guides/scaling-nodejs/nodejs-vs-deno-vs-bun/) |
| Node.js | 13,255 | [Better Stack](https://betterstack.com/community/guides/scaling-nodejs/nodejs-vs-deno-vs-bun/) |

### Package Installation (M1 Pro, ~1,100 packages)

| Tool | Time | Source |
|------|------|--------|
| bun install | **8.6s** | [Benjamin Crozat](https://benjamincrozat.com/bun-package-manager) |
| pnpm | 31.9s | [Benjamin Crozat](https://benjamincrozat.com/bun-package-manager) |
| npm | 57.4s | [Benjamin Crozat](https://benjamincrozat.com/bun-package-manager) |
| yarn | 138s | [Benjamin Crozat](https://benjamincrozat.com/bun-package-manager) |

### Comparison

| Aspect | Bun | Node.js | Deno |
|--------|-----|---------|------|
| HTTP throughput | ~4x faster | Baseline | ~1.7x faster |
| Package install | ~7x faster | Baseline | N/A |
| Startup | 4-10x faster | Slowest | Faster than Node |
| Ecosystem | npm compatible | Largest | npm compatible |
| TypeScript | Native | Transpile needed | Native |
| Engine | JavaScriptCore | V8 | V8 |

Sources: [Strapi](https://strapi.io/blog/bun-vs-nodejs-performance-comparison-guide), [Snyk](https://snyk.io/blog/javascript-runtime-compare-node-deno-bun/)

### Why Bun Was Chosen

1. ~4x faster HTTP throughput (52k vs 13k req/s)
2. ~7x faster package installation
3. 4-10x faster cold starts
4. Native TypeScript support
5. Full npm compatibility

### Trade-offs

- Node.js has larger ecosystem and longer track record
- Memory usage varies by workload (some benchmarks show Bun higher, some lower)
- Deno offers permission-based security model

### Alternative: Node.js

To use Node.js instead, change Dockerfile:

```dockerfile
# FROM oven/bun:1.3-alpine AS deps
FROM node:24-alpine AS deps

# CMD ["bun", "server.js"]
CMD ["node", "server.js"]
```

---

## Project Structure

```
nextacc/
├── app/
│   ├── [locale]/
│   │   ├── @dashboard/        # Dashboard pages
│   │   │   ├── ivr/
│   │   │   ├── numbers/
│   │   │   ├── profile/
│   │   │   ├── statistics/
│   │   │   ├── transactions/
│   │   │   ├── uploads/
│   │   │   └── waiting-numbers/
│   │   └── @offers/
│   └── api/
│       ├── auth/              # BetterAuth routes
│       ├── backend/           # Backend API proxy
│       └── other/
├── components/
│   ├── ui/                    # UI components
│   │   ├── primitives/        # Radix wrappers (Button, Input, Dialog...)
│   │   ├── display/           # Visual formatting (Avatar, Boolean, FormattedDate)
│   │   ├── data/              # Data components (DataTable, DatePicker)
│   │   ├── layout/            # Layout components (Card, ListGroup, Table)
│   │   └── loading/           # Loading states (Loader, SkeletonLoader)
│   ├── forms/                 # Form components (CommonInput, Toggle, DropdownSelect)
│   ├── nav/                   # Navigation
│   ├── pages/                 # Page components
│   └── drawers/               # Drawer components
├── lib/
│   ├── data-source/           # Data abstraction
│   │   ├── index.ts           # Mode switching
│   │   ├── live.ts            # Real API calls
│   │   ├── stub.ts            # Faker data
│   │   └── types.ts
│   ├── auth.ts                # BetterAuth config
│   └── auth-client.ts         # Auth client
├── stores/                    # Zustand stores
├── hooks/                     # Custom hooks
├── types/                     # TypeScript types
├── messages/                  # i18n (en, pl, uk)
├── Dockerfile
└── docker-compose.yml
```

---

## License

Private project.
