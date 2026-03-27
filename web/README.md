# BlueCrab Web Frontend

A modern Next.js 16 frontend for BlueCrab social platform with Tailwind CSS and TypeScript.

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Running Go API backend (see root README)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```
   
   **Edit `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

4. Point `NEXT_PUBLIC_API_URL` at your Railway backend.

## Troubleshooting

### "Load failed" on Login

**Problem:** Getting "Load failed" error when trying to sign in.

**Solution:**
1. Check if backend API is running:
   ```bash
   curl https://your-backend-url.up.railway.app/auth/me
   ```

2. Verify `.env.local` has correct API URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
   ```

3. Check browser console (F12) for detailed error messages

4. Make sure backend allows CORS:
   - Backend should have CORS enabled for `http://localhost:3000`
   - Check Go API logs for request errors

### API Connection Issues

- If backend is on a different domain, update `NEXT_PUBLIC_API_URL`
- If using local backend, use `http://localhost:4000`
- For production, use your deployed backend domain

## Deployment

### Vercel

1. Push repo to GitHub
2. In Vercel, import the project
3. Set **Root Directory** to `web`
4. Add environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://<YOUR-BACKEND-API-DOMAIN>
   ```
5. Deploy

### Docker

1. Build image:
   ```bash
   docker build -t bluecrab-web .
   ```

2. Run container:
   ```bash
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api:8080 bluecrab-web
   ```

### Docker Compose

```bash
docker-compose up web
```

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **next-themes** - Dark mode support

## Features

- Mobile-responsive UI
- Dark mode support
- Real-time notifications
- User authentication
- Friend system
- Group management
- Forum discussions
- Direct messaging
- Post bookmarks

## Project Structure

```
web/
├── app/              # Next.js app directory
│  ├── (auth)/        # Login/Register routes
│  └── (main)/        # Protected routes
├── components/       # React components
├── lib/             # Utilities (api, auth, etc.)
├── types/           # TypeScript type definitions
├── hooks/           # Custom React hooks
├── context/         # React context providers
└── public/          # Static assets
```

## Notes

- Frontend communicates with backend API at `NEXT_PUBLIC_API_URL`
- All auth, users, and posts traffic goes to the Railway backend
- Images can be loaded from any remote URL
- Mobile UI is fully responsive with hamburger menu
