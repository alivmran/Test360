# Test360 AI

> **Autonomous Multi-Tier Test Synthesis, Closed-Loop Execution, and Self-Healing Diagnostics Platform**  
> *Final Year Project (FYP-I) — Department of Software Engineering, SZABIST University, Karachi Campus*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000.svg)](https://expressjs.com/)

---

## 👥 Project Team & Supervision

- **Lead Developer**: Syed Ali Imran `(Reg. No. 2380254)`
- **Co-Developer**: Muhammad Khizar `(Reg. No. 2380279)`
- **Project Supervisor**: Sir Asif Khalid Qureshi *(Senior Lecturer, BSSE)*
- **Institution**: Faculty of Computing and Engineering Sciences, SZABIST University, Karachi

---

## 📌 Executive Summary

Modern web teams ship through CI/CD pipelines, yet authoring and maintaining tests across **Unit**, **Integration/API**, **End-to-End UI**, and **Concurrency/Load** tiers is manual, slow, and error-prone. Standalone Large Language Models (LLMs) cannot execute code, do not understand multi-file dependencies, and hallucinate imports or assertions.

**Test360 AI** is an autonomous quality engineering platform built on the **MERN Stack** (MongoDB, Express.js, React, Node.js). On every GitHub Pull Request, it:
1. **Constructs a Multi-File AST Dependency Call Graph** (`@babel/parser`, `@babel/traverse`) across Express.js routes, middlewares, controllers, services, and Mongoose models to calculate the change's exact **Blast Radius**.
2. **Synthesizes Constrained JSON Test Matrices** using Boundary-Value Analysis (BVA), Equivalence Partitioning (EP), and local code intelligence (SLM), validated strictly via **Zod**.
3. **Compiles Concrete Executable Test Suites** deterministically for **Jest** (Unit), **Supertest** (API with in-memory MongoDB), **Playwright** (UI Smoke), and **Autocannon** (Concurrency/Load).
4. **Executes in Ephemeral Docker Sandboxes** with strict cgroup limits (`--memory=1.5g`, `--cpus=1.0`, `--cap-drop=ALL`).
5. **Performs Closed-Loop Self-Healing** by intercepting test failure stderr traces, distinguishing flaky test parameters from genuine application defects (up to 2 iterations).
6. **Delivers Real-Time Scorecards & 1-Click Fixes** through an interactive React operations dashboard and automated GitHub PR scorecard comments.

---

## 🚀 Key Features (Midterm FYP-I Scope)

- **MERN Stack Architecture**: Pure, dynamic data-driven backend using MongoDB Atlas and Express.js REST APIs with zero hardcoded credentials or mock fallbacks.
- **Dynamic User Authentication & RBAC**: Account registration, login, profile management, and role-based permissions (`Developer`, `Reviewer`, `Administrator`).
- **Repository Management (Full CRUD)**: Register target repositories, configure AST directory conventions (`routesDir`, `controllersDir`, `servicesDir`, `modelsDir`), update settings, and disconnect repositories.
- **AST Blast Radius Call Graph**: Interactive React Flow Directed Acyclic Graph (DAG) visualizing architectural layers and highlighting impacted nodes.
- **Hybrid Test Synthesis Matrix**: BVA fuzzer boundary partitions and deterministic template compilation for Jest and Supertest.
- **Simplified Operations Dashboard**: Clean 5-tab interface designed for clarity and fast navigation.

---

## 🏗️ Repository Architecture

Test360 AI is organized as an **npm workspaces monorepo**:

```text
Test360-AI/
├── client/                     # React 18 + Vite Frontend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── layout/         # Header & navigation components
│   │   │   ├── scorecard/      # PR Scorecard & KPI components
│   │   │   ├── ast-graph/      # React Flow AST dependency graph
│   │   │   ├── test-spec/      # Test matrix & template viewers
│   │   │   ├── repositories/   # Dynamic Repository CRUD view
│   │   │   └── profile/        # User authentication & profile view
│   │   ├── shared/             # API client, types, and utilities
│   │   ├── App.jsx             # Main dashboard orchestrator
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express 4 Backend
│   ├── src/
│   │   ├── config/             # Database, Redis, and environment configs
│   │   ├── modules/
│   │   │   ├── auth/           # User model, auth controller & service
│   │   │   ├── repositories/   # Repository model & CRUD services
│   │   │   ├── pull-requests/  # PR execution run tracking & queue
│   │   │   ├── ast-analysis/   # Babel AST parser & graph builder
│   │   │   ├── test-synthesis/ # Zod schema & deterministic compiler
│   │   │   ├── docker-sandbox/ # Container security & runner specs
│   │   │   ├── mutation-testing/# AST mutation operators & Autocannon
│   │   │   └── diagnostics-repair/# Plain-English triage & 1-click diff
│   │   ├── routes.js           # Consolidated API router
│   │   ├── seed.js             # MongoDB telemetry & collection seeder
│   │   └── server.js           # Server entry point
│   ├── .env.example            # Environment template
│   └── package.json
│
├── .gitignore
├── package.json                # Monorepo root workspace configuration
└── README.md
```

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, `@xyflow/react` (React Flow), Monaco Editor, Recharts, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express.js 4, `@babel/parser`, `@babel/traverse`, Zod, BullMQ, ioredis |
| **Database** | MongoDB / MongoDB Atlas, Mongoose ODM |
| **Testing Engines** | Jest (Unit), Supertest (API), Playwright (UI Smoke), Autocannon (Load Benchmark) |
| **Sandbox & CI** | Docker Engine (cgroups v2, loopback isolation), GitHub REST API (Octokit) |

---

## ⚙️ Environment Configuration

Create a `.env` file in the `server/` directory (you can copy from `server/.env.example`):

```bash
# Server Port & Environment
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas or Local)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mlbhtwg.mongodb.net/Test360

# Redis Connection (BullMQ Queue)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# GitHub App Integration
GITHUB_APP_ID=1029384
GITHUB_WEBHOOK_SECRET=test360_super_secret_webhook_key_2026

# Local SLM Inference Service (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
SLM_MODEL_NAME=test360-coder:1.5b-qlora-4bit

# Docker Sandbox Resource Limits
DOCKER_MEMORY_LIMIT=1.5g
DOCKER_CPU_LIMIT=1.0
DOCKER_USER=node
SANDBOX_TIMEOUT_MS=120000
```

> **Note**: Ensure your MongoDB Atlas password is correctly inserted and your IP address is whitelisted under **Network Access** in MongoDB Atlas.

---

## 🚦 Getting Started

### 1. Install Dependencies
From the repository root:

```bash
npm install
```

### 2. Seed the Database
Populate your MongoDB database with telemetry, initial repositories, users, and PR runs:

```bash
npm --workspace=server run seed
```

### 3. Run the Development Servers
In two separate terminals:

```bash
# Terminal 1: Start Express Backend (Port 5000)
npm run dev:server

# Terminal 2: Start Vite Client (Port 3000)
npm run dev:client
```

Open **`http://localhost:3000`** in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account with role permissions |
| `POST` | `/api/auth/login` | Authenticate user via email or GitHub handle |
| `GET` | `/api/auth/profile/:id` | Fetch authenticated user profile |
| `PUT` | `/api/auth/profile/:id` | Update profile information and active role |
| `GET` | `/api/auth/users` | List all registered system users |
| `GET` | `/api/repositories` | List all connected Express.js repositories |
| `POST` | `/api/repositories` | Connect a new repository and directory conventions |
| `PUT` | `/api/repositories/:owner/:repo/config` | Update convention directory paths (`routesDir`, etc.) |
| `DELETE` | `/api/repositories/:owner/:repo` | Disconnect / remove repository |
| `GET` | `/api/pull-requests/:repo/:prNumber` | Retrieve active PR run scorecard & verdicts |
| `GET` | `/api/pull-requests/history` | Get historical regression metrics across runs |
| `GET` | `/api/ast/:repo/:commitSha` | Fetch AST call graph nodes, edges, and blast radius |
| `GET` | `/api/test-specs/:prNumber/:commitSha` | Fetch Zod-validated test matrix and compiled suites |
| `GET` | `/api/health` | System health check and engine telemetry |

---

## 📅 FYP Milestone Roadmap

- [x] **Week 1–3**: Project Proposal Defence & Supervisor Alignment *(Completed)*
- [x] **Week 4–5**: Software Requirements Specification (SRS) & UI Architecture *(Completed)*
- [x] **Week 6–7**: Database Schema, MERN Backend & CRUD Implementation *(Completed)*
- [x] **Week 8–9 (Midterm Evaluation)**: Working UI, MongoDB Connectivity, Authentication, User Management, Initial CRUD *(Completed)*
- [ ] **FYP-II Phase 1**: Live Docker Sandbox execution runner with real container lifecycle
- [ ] **FYP-II Phase 2**: Automated 2-iteration closed-loop self-healing on container exit codes
- [ ] **FYP-II Phase 3**: Live AST mutation testing engine (20-mutant cap) and Autocannon load testing
- [ ] **FYP-II Phase 4**: GitHub App live webhook delivery & 1-Click Repair commit pushing

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
