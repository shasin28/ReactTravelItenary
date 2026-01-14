# Backend

A simple Express API server for the itinerary builder.

## Stack

- Express 5
- TypeScript
- Node.js
- Vitest + Supertest

## Getting Started

Start the development server:

```bash
npm run dev
```

The server runs at `http://localhost:3000`.

## API Endpoints

The backend exposes REST API endpoints under `/api`. Example:

```ts
app.get("/api/health", (req, res) => {
  res.json({ message: "OK" });
});
```

Data files are stored in the `data/` directory.

## Testing

Run tests:

```bash
npm test
```

Tests are located in the `tests/` directory.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
