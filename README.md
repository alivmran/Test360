# Test360 AI

> **Autonomous Pull Request Verification, Multi-Tier Test Synthesis, and Isolated Sandbox Diagnostics**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000.svg)](https://expressjs.com/)

---

## Overview

**Test360 AI** is an automated pull request testing and diagnostics platform built on the **MERN stack** (MongoDB, Express.js, React, Node.js). When code changes are introduced to a Node.js/Express repository, Test360 AI analyzes affected modules, generates targeted test matrices, executes checks in isolated environments, and surfaces clear failure diagnostics directly in an interactive dashboard.

### Core Capabilities

- **AST Dependency & Impact Mapping**: Parses Express routes, middlewares, controllers, services, and Mongoose models using `@babel/parser` and `@babel/traverse` to trace affected files and visualize the call graph in React Flow.
- **Multi-Tier Test Synthesis**: Produces structured JSON test matrices validated with **Zod** and compiles executable test suites across **Unit** (Jest), **API Integration** (Supertest), **UI Smoke** (Playwright), and **Load** (Autocannon) tiers.
- **Interactive PR Scorecard**: Switch between repositories and pull requests, filter passing/failing checks, paginate individual test cases, inspect historical quality and latency trends, and copy formatted PR comment summaries.
- **Repository Management (CRUD)**: Attach GitHub repositories, verify repository metadata, map project directory conventions (`routesDir`, `controllersDir`, `servicesDir`, `modelsDir`), scan project architecture, and simulate PR webhook runs.
- **Token-Based Authentication & Roles**: Salted `scrypt` password hashing, HMAC-signed Bearer session tokens, role support (`developer`, `reviewer`, `admin`), and profile management backed by MongoDB.
- **Hardened Sandbox Execution Profile**: Designed around rootless, read-only Docker containers (`--user=node`, `--cap-drop=ALL`, `--memory=1.5g`, `--cpus=1.0`, `--network=none`).

---

## Architecture

Organized as an **npm workspaces** monorepo:

```text
Test360-AI/
├── client/                              # React 18 + Vite + TailwindCSS Frontend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── landing/                 # Public product landing page
│   │   │   ├── auth/                    # Login & registration flows
│   │   │   ├── layout/                  # Top navigation & workspace controls
│   │   │   ├── scorecard/               # Overview KPIs, paginated check inspector & PR history
│   │   │   ├── ast-graph/               # Interactive React Flow code dependency map
│   │   │   ├── test-spec/               # Test matrix & generated suite viewers
│   │   │   ├── repositories/            # Repository onboarding & CRUD management
│   │   │   └── profile/                 # Authenticated profile & account settings
│   │   ├── shared/                      # API client & shared data schemas
│   │   ├── App.jsx                      # Auth routing & workspace state orchestrator
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                              # Node.js (ESM) + Express Backend
│   ├── src/
│   │   ├── config/                      # Env validation (Zod), MongoDB & Redis setup
│   │   ├── modules/
│   │   │   ├── auth/                    # User schema, scrypt hashing, HMAC token auth
│   │   │   ├── repositories/            # Repository CRUD, GitHub verification & PR simulation
│   │   │   ├── pull-requests/           # PR run tracking, history, BullMQ queue & worker
│   │   │   ├── ast-analysis/            # Babel AST parser & call graph builder
│   │   │   ├── test-synthesis/          # Zod matrix validation & suite compiler
│   │   │   ├── docker-sandbox/          # Container telemetry & runner configuration
│   │   │   ├── mutation-testing/        # Mutant scoring & Autocannon metrics
│   │   │   ├── diagnostics-repair/      # Defect triage & repair patch endpoints
│   │   │   └── ingestion/               # GitHub webhook handler
│   │   ├── routes.js                    # API router & /api/health endpoint
│   │   ├── seed.js                      # Sample repository & telemetry seeder
│   │   └── server.js                    # Application entry point
│   ├── test-crud-suite.js               # End-to-end DB, Auth, and CRUD verification suite
│   ├── .env.example
│   └── package.json
│
├── package.json                         # Monorepo root workspace scripts
└── README.md
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, `@xyflow/react`, Recharts, Monaco Editor, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express 4, `@babel/parser`, `@babel/traverse`, Zod, BullMQ, ioredis |
| **Database** | MongoDB / MongoDB Atlas, Mongoose ODM |
| **Testing & Analysis** | Jest, Supertest, Playwright, Autocannon |
| **Integrations** | GitHub REST API (`@octokit/rest`), Docker Engine |

---

## Getting Started

### Prerequisites

- **Node.js** `v20+`
- **MongoDB** (local instance or MongoDB Atlas connection string)
- **Redis** *(optional — BullMQ gracefully falls back to in-process execution when Redis is unavailable)*

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `server/.env.example` to `server/.env` and update the values for your environment:

```bash
cp server/.env.example server/.env
```

Key variables in `server/.env` (validated at startup via `server/src/config/env.js`):

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/test360_ai

# Redis Connection (BullMQ)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# GitHub Integration & Token Signing
GITHUB_APP_ID=1029384
GITHUB_WEBHOOK_SECRET=your_webhook_and_session_secret

# Local SLM Service (Ollama)
OLLAMA_BASE_URL=http://127.0.0.1:11434
SLM_MODEL_NAME=test360-coder:1.5b-qlora-4bit

# Docker Sandbox Limits
DOCKER_MEMORY_LIMIT=1.5g
DOCKER_CPU_LIMIT=1.0
DOCKER_USER=node
SANDBOX_TIMEOUT_MS=120000
```

### 3. Seed Sample Telemetry *(Optional)*

Populate MongoDB with sample repositories, PR runs, AST call graphs, and test matrices:

```bash
npm --workspace=server run seed
```

### 4. Run the Development Servers

Start the backend and frontend in separate terminals:

```bash
# Terminal 1: Start Express API server (http://localhost:5000)
npm run dev:server

# Terminal 2: Start Vite React client (http://localhost:3000)
npm run dev:client
```

Open **`http://localhost:3000`** in your browser. Create an account via **Get Started** or sign in with an existing account from your database.

---

## Testing & Verification

Run the backend integration test suite to verify MongoDB connectivity, authentication, user CRUD, repository CRUD (including cascade cleanup), and test matrix validation:

```bash
npm --workspace=server test
```

Build the frontend production bundle:

```bash
npm run build:client
```

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health and live MongoDB connection status |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate credentials and issue a Bearer token |
| `GET` | `/api/auth/me` | Resolve authenticated user from Bearer token |
| `GET` | `/api/auth/profile/:id` | Fetch user profile by ID |
| `PUT` | `/api/auth/profile/:id` | Update user profile details and role |
| `DELETE` | `/api/auth/profile/:id` | Delete user account |
| `GET` | `/api/repositories` | List connected repositories |
| `GET` | `/api/repositories/verify` | Verify GitHub repository metadata |
| `POST` | `/api/repositories` | Attach a repository and generate initial baseline telemetry |
| `GET` | `/api/repositories/:owner/:repo` | Fetch single repository details |
| `POST` | `/api/repositories/:owner/:repo/scan` | Scan repository conventions and update AST graph |
| `PUT` | `/api/repositories/:owner/:repo/config` | Update repository branch and directory conventions |
| `POST` | `/api/repositories/simulate-pr` | Simulate a GitHub pull request webhook event |
| `DELETE` | `/api/repositories/:owner/:repo` | Remove repository and cascade-delete associated telemetry |
| `GET` | `/api/pull-requests/latest` | Retrieve scorecard for the latest or specified PR number |
| `GET` | `/api/pull-requests/history` | Retrieve historical PR metrics for a repository |
| `POST` | `/api/pull-requests/rerun` | Trigger a pipeline rerun |
| `GET` | `/api/ast/graph` | Fetch AST dependency nodes and edges |
| `GET` | `/api/test-specs` | Retrieve synthesized test matrix and compiled suites |
| `POST` | `/api/test-specs/validate` | Validate a JSON test matrix against Zod schemas |

---

## Roadmap

- Live Docker container runner orchestration with ephemeral volume mounting and stream capture
- Automated multi-iteration self-healing loop on container test failures
- Live AST mutation testing runner and automated Autocannon load profiling
- Direct GitHub App webhook delivery and automated PR repair commits

---

## License

Licensed under the MIT License.
