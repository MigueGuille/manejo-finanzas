# App de Finanzas Personales

Aplicacion full-stack para registrar ingresos, gastos, presupuestos, ahorro e historico financiero por periodos diario, quincenal y mensual.

## Stack

- Frontend: React + Vite, React Router, TailwindCSS, TanStack Query, React Hook Form, Zod y Recharts.
- Backend: Node.js + Express con capas `routes -> controllers -> services -> repositories`.
- DB: PostgreSQL + Prisma Migrate.
- Auth: JWT access token + refresh token preparado.
- Local: Docker Compose para Postgres, backend y frontend.

## Estructura

```txt
backend/
  prisma/
    schema.prisma
    migrations/
    seed.js
  src/
    controllers/
    middlewares/
    repositories/
    routes/
    services/
    utils/
    validators/
frontend/
  src/
    components/
    pages/
    services/
    store/
docker-compose.yml
```

## Levantar con Docker

```bash
docker compose up --build
```

Luego abre `http://localhost:5173`.

Si el backend queda reiniciando con un error de Prisma/OpenSSL, reconstruye la imagen sin cache:

```bash
docker compose build --no-cache backend
docker compose up
```

Para cargar datos de ejemplo dentro del contenedor:

```bash
docker compose exec backend npm run seed
```

Usuario demo:

```txt
demo@finanzas.local
Demo12345
```

## Levantar en local sin Docker

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Endpoints principales

```txt
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/categories
POST   /api/categories
GET    /api/transactions?from=&to=&category=&type=&page=
POST   /api/transactions
DELETE /api/transactions/:id
GET    /api/budgets
POST   /api/budgets
GET    /api/savings-goals
POST   /api/savings-goals
POST   /api/savings-goals/:id/contributions
GET    /api/dashboard/summary?period_type=&period_start=&period_end=
GET    /api/dashboard/history?period_type=&limit=
GET    /api/reports/export?format=csv|pdf&from=&to=
GET    /api/user/settings
PUT    /api/user/settings
```

Ejemplo de login:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@finanzas.local","password":"Demo12345"}'
```

## Decisiones tecnicas

- Prisma vive en `backend/prisma`, que es la convencion esperada por Prisma CLI; la arquitectura de app queda bajo `backend/src`.
- Las transacciones usan soft-delete con `deleted_at`; reportes y dashboard filtran `deletedAt: null`.
- Los snapshots se generan al primer request autenticado del nuevo periodo para evitar depender solo de un cron externo.
- Las recurrentes se procesan con un job cada 15 minutos y actualizan `next_run_date` segun frecuencia.
- El frontend es mobile-first y prioriza captura rapida de transacciones desde el celular.

## Validacion

```bash
cd backend
npm test
npm run lint

cd ../frontend
npm run build
npm run lint
```
