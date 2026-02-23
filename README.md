# API-CIWEI

API security scanner — upload your project and get a report on vulnerabilities, design issues, and bad practices.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

Successor to [API-DOT](https://github.com/sheepxux/API-Dot-Web), rewritten with a monorepo structure and expanded rule engine.

## Features

- **Security** — SQL injection, XSS, hardcoded secrets, CORS misconfigurations, missing auth, rate limiting
- **API Design** — REST conventions, HTTP methods, status codes, versioning, naming patterns
- **Error Handling** — Missing try-catch, unhandled promises, inconsistent error responses
- **Performance** — N+1 queries, missing pagination, no caching strategy
- **Documentation** — Missing OpenAPI/Swagger annotations
- **Best Practices** — Input validation, sensitive data exposure
- 7 languages: JavaScript, TypeScript, Python, Go, Java, PHP, Ruby
- 19+ rules across 6 categories

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- MySQL 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/sheepxux/API-CIWEI.git
cd API-CIWEI

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your database URL, GitHub OAuth credentials, etc.

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create `apps/web/.env.local`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/api_ciwei"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"          # openssl rand -base64 32
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Set **Homepage URL**: `http://localhost:3000`
3. Set **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

## Project Structure

```
api-ciwei/
├── apps/
│   └── web/                    # Next.js 15 web application
│       ├── app/                # App Router pages & API routes
│       ├── components/         # React components
│       ├── lib/                # Utilities, auth, db
│       └── prisma/             # Database schema
├── packages/
│   ├── scanner/                # Core scanning engine
│   │   └── src/
│   │       ├── rules/          # 19+ scanning rules
│   │       │   ├── security/
│   │       │   ├── design/
│   │       │   ├── error-handling/
│   │       │   ├── performance/
│   │       │   ├── documentation/
│   │       │   └── best-practices/
│   │       ├── engine.ts       # Main scan engine
│   │       └── types.ts        # TypeScript types
│   └── tsconfig/               # Shared TypeScript configs
└── turbo.json                  # Turborepo config
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS + shadcn/ui |
| Database | MySQL + Prisma ORM |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| Monorepo | Turborepo + pnpm |
| Scanner | Custom rule engine (AST-based) |
| Deployment | Vercel |

## Scanning Rules

| ID | Name | Category | Severity |
|----|------|----------|----------|
| SEC001 | Hardcoded Secrets | Security | Critical |
| SEC002 | SQL Injection Risk | Security | Critical |
| SEC003 | Missing Authentication | Security | High |
| SEC004 | CORS Misconfiguration | Security | High |
| SEC005 | Missing Rate Limiting | Security | Medium |
| SEC006 | XSS Vulnerability | Security | High |
| DES001 | Incorrect HTTP Methods | Design | Medium |
| DES002 | Incorrect Status Codes | Design | Medium |
| DES003 | Missing API Versioning | Design | Low |
| DES004 | Naming Convention Violations | Design | Low |
| ERR001 | Missing Error Handling | Error Handling | High |
| ERR002 | Unhandled Promise Rejection | Error Handling | High |
| ERR003 | Inconsistent Error Response | Error Handling | Medium |
| PERF001 | Missing Pagination | Performance | Medium |
| PERF002 | N+1 Query Problem | Performance | High |
| PERF003 | Missing Cache Headers | Performance | Low |
| DOC001 | Missing API Documentation | Documentation | Low |
| BP001 | Missing Input Validation | Best Practices | High |
| BP002 | Sensitive Data Exposure | Best Practices | High |

## Contributing

PRs are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

## License

MIT © 2026 [sheepxux](https://github.com/sheepxux)

---

Made by [@sheepxux](https://github.com/sheepxux) · Successor to [API-DOT](https://github.com/sheepxux/API-Dot-Web)
