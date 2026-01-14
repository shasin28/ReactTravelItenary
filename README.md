# Day Itinerary Builder

A travel day planner application built with React and Express.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express 5, TypeScript
- **Testing**: Vitest, Testing Library, Supertest

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

You need two terminal windows:

**Terminal 1 - Backend** (runs on http://localhost:3000):
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend** (runs on http://localhost:5173):
```bash
cd frontend
npm run dev
```

The frontend proxies API requests to the backend automatically.

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   └── server.ts      # Express server
│   ├── data/
│   │   ├── cities.json    # City catalogue
│   │   ├── activities.json # Activity catalogue
│   │   └── dayplan.json   # Day plan storage
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   └── App.tsx        # Main React component
│   └── tests/
│
└── TASK.md                # Task requirements
```

## Data

### Cities

Cities are stored in `backend/data/cities.json`:

```json
{ "id": "goa", "name": "Goa", "country": "India" }
```

### Activities

Activities are stored in `backend/data/activities.json`. Each activity has:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| cityId | string | References a city |
| title | string | Display name |
| type | string | Category: `water_sport`, `sightseeing`, `adventure`, `leisure`, `wellness`, `transfer` |
| duration | number | Duration in minutes |
| pricePerPax | number | Price per person |

### Day Plan

The day plan is stored in `backend/data/dayplan.json`. The file starts empty (`{}`) - define your own structure.

## Task

See `TASK.md` for the full requirements.
