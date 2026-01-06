# NextAcc

<p align="center">
  <img src="public/icon.png" alt="NextAcc Logo" width="120" height="120">
</p>

<p align="center">
  Telecom account management dashboard built with Next.js 16 and React 19.
</p>

## Overview

NextAcc is a modern telecom account management system featuring phone number management, IVR configuration, usage statistics, and billing. Built for performance with Bun runtime and designed for both demo and production environments.

### Features

- **Multi-language**: English, Polish, Ukrainian
- **Authentication**: Google OAuth + anonymous sessions via BetterAuth
- **Demo Mode**: Faker-generated data for testing without backend
- **Live Mode**: Real API integration for production

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env

# Run (demo mode by default)
npm run dev
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16.1 |
| UI | React 19.2 |
| Auth | BetterAuth |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| i18n | next-intl |
| Runtime | Bun 1.3 |

## Environment

```bash
# Data mode: demo (faker) or live (real API)
NEXT_PUBLIC_DATA_MODE=demo
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth (for Google OAuth)
BETTER_AUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint check |

## Docker

```bash
docker compose up --build    # Build and run
docker compose up -d         # Background
docker compose logs -f       # Logs
docker compose down          # Stop
```

## Project Structure

```
app/
├── [locale]/
│   ├── @dashboard/          # Dashboard routes
│   │   ├── numbers/         # Phone numbers
│   │   ├── statistics/      # Usage stats
│   │   ├── transactions/    # Billing
│   │   ├── ivr/             # IVR config
│   │   └── ...
│   └── @offers/             # Number offers
└── api/
    └── auth/                # BetterAuth

components/
├── ui/primitives/           # Radix wrappers
├── ui/data/                 # DataTable, DatePicker
├── forms/                   # Form components
├── pages/                   # Page components
└── nav/                     # Navigation

lib/
├── data-source/             # Demo/Live switching
├── auth.ts                  # BetterAuth config
└── auth-client.ts           # Client auth

stores/                      # Zustand stores
hooks/                       # Custom hooks
messages/                    # i18n (en, pl, uk)
```

## Documentation

- [API Specification](docs/API_SPECIFICATION.md)

## License

This project is licensed under the [Polyform Noncommercial License 1.0.0](LICENSE.md).

You may use, copy, and modify this software for **non-commercial purposes only**. Commercial use requires a separate license agreement.

For commercial licensing inquiries, contact the author.
