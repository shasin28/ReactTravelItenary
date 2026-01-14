# Frontend

A simple React boilerplate with backend connectivity.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Vitest + Testing Library

## Getting Started

Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Backend Connection

API requests are proxied to the backend via Vite config. See `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': 'http://localhost:3000',
  },
}
```

A demo fetch call in `App.tsx` shows the backend connection in action.

## Testing

Run tests:

```bash
npm test
```

Tests are located in the `tests/` directory.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint
