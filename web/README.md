# Web App

## Local

1. Install deps:

```bash
npm install
```

2. Create `web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

3. Run:

```bash
npm run dev
```

## Vercel Deploy

1. Push repo to GitHub.
2. In Vercel, `Add New Project` and import the repo.
3. Set **Root Directory** to `web`.
4. Add Environment Variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://<YOUR-BACKEND-DOMAIN>/api
```

5. Deploy.

Notes:
- Frontend Vercel'de calisir, Go API'yi ayri deploy etmelisin (Railway/Render/Fly.io gibi).
- Backend CORS su an `*`, yani Vercel domaininden istek kabul eder.
