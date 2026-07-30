# Hoply 🚖🤝

> **Find your travel companion. Share the ride. Save money. Meet people.**

Hoply connects travellers heading in the same direction so they can share a taxi.
Users publish a **travel plan** (source, destination, time window, luggage),
discover compatible travellers ranked by a compatibility score, and exchange
**match** requests. Contact details are revealed only after both parties accept.

Unlike Uber Share or Rapido, Hoply does **not** book taxis — it helps people find
the right travel companion *before* booking a ride.

---

## Table of contents

- [Project layout](#project-layout)
- [Tech stack](#tech-stack)
- [Data model](#data-model)
- [API overview](#api-overview)
- [Backend (FastAPI)](#backend-fastapi)
  - [Prerequisites](#prerequisites)
  - [Database setup](#database-setup)
  - [Configuration](#configuration)
  - [Install & run](#install--run)
  - [Implemented endpoints](#implemented-endpoints)
  - [Example requests](#example-requests)
- [Error format](#error-format)
- [Roadmap](#roadmap)

---

## Project layout

```
11-Hoply/
├── Idea.MD                 # Product definition, personas, user stories, scope
├── schema.sql              # MySQL schema (source of truth for the data model)
├── openapi.yaml            # OpenAPI 3.1 REST contract
├── README.md               # You are here
└── backend/                # FastAPI backend
    ├── .env.example        # All configuration (app port, DB, JWT, ...)
    ├── requirements.txt
    └── app/
        ├── main.py         # FastAPI app; mounts routers; /health
        ├── api/
        │   ├── __init__.py # Router aggregation — each URI → its own router
        │   ├── deps.py     # Shared dependencies (get_db)
        │   └── routes/
        │       └── auth.py # POST /auth/register, POST /auth/token
        ├── core/
        │   ├── config.py   # pydantic-settings Settings (from .env)
        │   ├── database.py # Engine, SessionLocal, Base, get_db
        │   ├── security.py # bcrypt hashing + JWT issuance
        │   └── problem.py  # RFC 9457 problem+json error handlers
        ├── crud/user.py    # Data-access layer
        ├── models/user.py  # SQLAlchemy model → users table
        └── schemas/        # Pydantic (camelCase) request/response models
```

---

## Tech stack

| Layer      | Choice                                        |
| ---------- | --------------------------------------------- |
| API        | FastAPI (OpenAPI 3.1)                          |
| Server     | Uvicorn                                        |
| ORM        | SQLAlchemy 2.0                                 |
| Database   | MySQL 8.0+ (InnoDB, `utf8mb4`)                 |
| Validation | Pydantic v2 + pydantic-settings               |
| Auth       | JWT (PyJWT) + bcrypt password hashing (passlib)|

---

## Data model

Defined in [`schema.sql`](schema.sql). Core tables:

| Table            | Purpose                                                          |
| ---------------- | --------------------------------------------------------------- |
| `users`          | Accounts + traveller profile (name, email, phone, age, gender). Passwords stored as a bcrypt hash. |
| `locations`      | Catalog of places: `name`, `region`, `city`, `country`, `place_type`, optional coordinates. |
| `travel_plans`   | A user's request: source/destination, time window, landmark, destination coordinates, luggage. |
| `matches`        | Links two plans (requester → receiver) with a compatibility score and accept/reject lifecycle. |
| `notifications`  | In-app notification feed.                                       |

Design highlights: InnoDB + `utf8mb4`, foreign keys with sensible cascade rules,
coordinates as `DECIMAL(9,6)`, and `CHECK` constraints for valid ages, lat/long
ranges, time-window ordering, and score bounds. The script is re-runnable
(drops in dependency order first).

Load the schema:

```powershell
mysql -u root -p < schema.sql
```

---

## API overview

The full contract lives in [`openapi.yaml`](openapi.yaml) (OpenAPI 3.1). It
follows REST conventions: resource-oriented plural nouns, correct verb
semantics, `201 Created` + `Location` headers, `ETag`/`If-Match` optimistic
concurrency, consistent pagination, and RFC 9457 Problem Details for errors.

Resource groups: `Auth`, `Users`, `Locations`, `Travel Plans`, `Discovery`,
`Matches`, `Notifications`.

> Currently only the **Auth** endpoints are implemented in the backend. The
> remaining routers are stubbed as commented placeholders in
> [`backend/app/api/__init__.py`](backend/app/api/__init__.py) and plug in the
> same way.

---

## Backend (FastAPI)

### Prerequisites

- Python 3.11+
- MySQL 8.0+ running locally (or reachable via the configured host/port)

### Database setup

```powershell
mysql -u root -p < schema.sql
```

### Configuration

All settings live in [`backend/app/core/config.py`](backend/app/core/config.py)
and are overridable via a `.env` file. Copy the example and edit values:

```powershell
cd backend
Copy-Item .env.example .env
```

| Variable                      | Default              | Description                          |
| ----------------------------- | -------------------- | ------------------------------------ |
| `APP_NAME`                    | `Hoply API`          | Application name                     |
| `APP_VERSION`                 | `1.0.0`              | Version string                       |
| `API_V1_PREFIX`               | `/v1`               | Prefix for all API routes            |
| `APP_HOST`                    | `0.0.0.0`            | Bind host                            |
| `APP_PORT`                    | `8080`               | Bind port                            |
| `DEBUG`                       | `false`              | Enable reload + SQL echo             |
| `DB_HOST`                     | `localhost`          | MySQL host                           |
| `DB_PORT`                     | `3306`               | MySQL port                           |
| `DB_USER`                     | `root`               | MySQL user                           |
| `DB_PASSWORD`                 | *(empty)*            | MySQL password                       |
| `DB_NAME`                     | `hoply`              | Database name                        |
| `JWT_SECRET_KEY`              | `change-me-...`      | JWT signing secret (**change this**) |
| `JWT_ALGORITHM`               | `HS256`              | JWT algorithm                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60`                 | Access-token lifetime (minutes)      |

Generate a strong secret:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### Install & run

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.main
```

The API serves on `http://localhost:8080`:

- Interactive docs (Swagger UI): `http://localhost:8080/docs`
- OpenAPI JSON: `http://localhost:8080/openapi.json`
- Liveness probe: `http://localhost:8080/health`

### Implemented endpoints

| Method | Path                | Operation      | Description                          |
| ------ | ------------------- | -------------- | ------------------------------------ |
| `POST` | `/v1/auth/register` | `registerUser` | Create a new user (bcrypt-hashed password). Returns `201` + `Location`. |
| `POST` | `/v1/auth/token`    | `issueToken`   | Exchange email/password for a JWT.   |

### Example requests

Register a user:

```powershell
curl -X POST http://localhost:8080/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{
        "name": "Rahul",
        "email": "rahul@example.com",
        "password": "supersecret123",
        "phoneNumber": "+919876543210",
        "age": 27,
        "gender": "male"
      }'
```

Obtain a token:

```powershell
curl -X POST http://localhost:8080/v1/auth/token `
  -H "Content-Type: application/json" `
  -d '{ "email": "rahul@example.com", "password": "supersecret123" }'
```

Response:

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### Call a protected endpoint

Use the returned JWT in the `Authorization` header for authenticated routes:

```powershell
curl -X GET http://localhost:8080/v1/users/me \
  -H "accept: application/json" \
  -H "Authorization: Bearer <jwt>"
```

---

## Error format

All errors follow [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457)
and are returned as `application/problem+json`:

```json
{
  "type": "about:blank",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "One or more fields failed validation.",
  "instance": "/v1/auth/register",
  "errors": [
    { "field": "email", "detail": "value is not a valid email address" }
  ]
}
```

---

## Roadmap

- [ ] `/users` — profiles and current-user endpoints
- [ ] `/locations` — location search & catalog
- [ ] `/travel-plans` — create/list/update/cancel plans
- [ ] `/travel-plans/{id}/matches` — compatibility-ranked discovery
- [ ] `/travel-plans/{id}/fare-estimate` — fare split estimate
- [ ] `/matches` — send / accept / reject / cancel
- [ ] `/notifications` — in-app feed
- [ ] JWT-protected route dependency (`get_current_user`)
- [ ] Automated tests (pytest)
