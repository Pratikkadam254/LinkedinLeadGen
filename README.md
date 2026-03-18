# QuickConnect

Simple LinkedIn connection automation. Upload a CSV, click start, watch your network grow.

## What it does

1. **Upload CSV** — Drop in a LinkedIn Sales Navigator export (only LinkedIn URL column required)
2. **Click Start** — Choose your sending speed and hit go
3. **Track Results** — Real-time dashboard shows sent, accepted, replies, and errors

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Convex (serverless, real-time)
- **Auth**: Clerk
- **LinkedIn API**: Unipile

## Getting Started

### Prerequisites

- Node.js 18+
- Convex account ([convex.dev](https://convex.dev))
- Clerk account ([clerk.com](https://clerk.com))
- Unipile account ([unipile.com](https://unipile.com))

### Setup

1. Clone and install:
   ```bash
   git clone <repo-url>
   cd quickconnect
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Fill in your credentials in `.env.local`

4. Start Convex:
   ```bash
   npx convex dev
   ```

5. Start the app:
   ```bash
   npm run dev
   ```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `CONVEX_DEPLOYMENT` | Convex deployment name |
| `VITE_CONVEX_URL` | Convex client URL |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `UNIPILE_BASE_URL` | Unipile API base URL |
| `UNIPILE_API_KEY` | Unipile API key |

## CSV Format

Minimum required column: `LinkedIn URL`

Optional columns: `First Name`, `Last Name`, `Company`, `Title`, `Message`

Example:
```csv
LinkedIn URL,First Name,Company,Message
https://linkedin.com/in/john-doe,John,Acme Inc,Hey John let's connect!
```

## Rate Limits

| Tier | Speed | Daily Limit |
|------|-------|-------------|
| Conservative | 45-90 min between sends | ~16/day |
| Normal | 20-40 min between sends | ~36/day |
| Aggressive | 10-20 min between sends | ~72/day |

LinkedIn weekly limit: ~200 invitations/week (enforced automatically).

## License

Private
