# NIVREN Fullstack Healthcare Project

A modular, production-ready fullstack healthcare platform featuring a **Next.js 15 Frontend** and an **Express.js TypeScript Backend**.

> 📌 **For AI Agents & Developers**: Please read [AGENTS.md](./AGENTS.md) for full project architecture, folder conventions, data separation rules, and design guidelines.

## Project Architecture

```text
NIVREN/
├── AGENTS.md             # Master Architecture & Agent Development Guide
├── frontend/             # Next.js 15 App Router + Tailwind CSS + TypeScript
│   └── src/
│       ├── components/   # ui/, healthcare/, layout/, sections/, animations/
│       ├── content/      # Centralized string/content system (EN, HI, AR)
│       ├── data/         # Structured domain data (doctors, departments, services)
│       ├── config/       # Site, locale, and healthcare settings
│       ├── styles/       # Healthcare design tokens & theme variables
│       └── types/        # TypeScript interfaces & models
│
├── backend/              # Express.js API Server + TypeScript
│   └── src/              # REST API controllers & services
│
├── package.json          # Root Orchestration (Concurrently runner)
└── README.md
```

## Quick Start Guide

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run both Frontend & Backend
```bash
npm run dev
```
- **Web Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## Service Commands
- `npm run dev` - Run both Frontend and Backend concurrently
- `npm run dev:frontend` - Run Next.js Frontend only
- `npm run dev:backend` - Run Express Backend only
- `npm run build:frontend` - Build Next.js for production
- `npm run build:backend` - Build Express TypeScript API

## Environment Variables

The backend reads config from `backend/.env` (see [`backend/.env.example`](./backend/.env.example) for the required keys):

```bash
cp backend/.env.example backend/.env
```

## Tech Stack
- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, TypeScript
- **Backend**: Express.js, TypeScript, tsx
- **Tooling**: concurrently (run both dev servers together)
