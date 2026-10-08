# AgriGenius

A marketplace for farmers and buyers in Nyanza, Kenya (Kisii, Nyamira, Kisumu, Siaya, Homa Bay, Migori).

- **Farmers** post produce (price, quantity, location, contact details).
- **Buyers** post what they want to buy and the price they can pay.
- **Everyone** can compare commodity prices across Nyanza markets on the dashboard.

Frontend: React 19 + Vite + React Router. Backend: Django + Django REST Framework (token auth, SQLite).

## Run it locally

You need Node 20+ and Python 3.11+. Use two terminals.

**1. Backend (Django)**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_market_prices      # SAMPLE prices so the dashboard has data
python manage.py createsuperuser         # to manage real prices in /admin
python manage.py runserver               # http://127.0.0.1:8000
```

**2. Frontend (React)**

```bash
npm install
npm run dev                              # http://localhost:5173
```

In development Vite forwards every `/api` request to Django (see `vite.config.js`), so no extra setup is needed.
If Django runs elsewhere, start Vite with `VITE_BACKEND_URL=http://host:port npm run dev`.

## Market prices

The prices created by `seed_market_prices` are **sample data** (the dashboard says so). Replace them with real
prices in the Django admin at `/admin/` > **Market prices**. Prices can be edited directly in the list view.
Rows whose `source` is not "Sample data" are shown as real data.

## API

All endpoints are under `/api/`. Authenticated calls send `Authorization: Token <token>`.


## Tests and checks

```bash
cd backend && python manage.py test      # API tests
npm run lint && npm run build            # frontend
```

## Deploying

- Backend: set `DJANGO_DEBUG=0`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
  (see `backend/.env.example`), use PostgreSQL/MySQL instead of SQLite, and serve over HTTPS.
- Frontend: build with `VITE_API_URL=https://your-api-host/api npm run build` and serve `dist/`.
