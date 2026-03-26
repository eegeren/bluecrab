# circlex

## Backend (Aiven + Render)

### Local

`.env`:

```env
PORT=8080
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/defaultdb?sslmode=require
JWT_SECRET=change_me
AUTO_MIGRATE=true
MIGRATIONS_DIR=migrations
```

Run:

```bash
go run ./cmd/api
```

### Render deploy

Repo already includes `render.yaml`.

1. Projeyi GitHub'a push et.
2. Render -> New -> Blueprint sec.
3. Repo'yu bagla, `render.yaml` otomatik okunur.
4. Render dashboard'da env gir:

```env
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/defaultdb?sslmode=require
JWT_SECRET=<strong-secret>
```

5. Deploy et.

Notlar:
- `AUTO_MIGRATE=true` ile migration'lar baslangicta otomatik calisir.
- Local DB URL'leri (`localhost`, `127.0.0.1`) uygulama tarafinda bilincli olarak engellenir.
