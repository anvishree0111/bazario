# Bazario API (Express + MySQL)

## Prerequisites

- MySQL server with database `bazario` and user (e.g. `bazario_user`).
- Root `.env` at project root (`bazario/.env`) **or** `backend/.env` with:

```env
DB_HOST=localhost
DB_USER=bazario_user
DB_PASSWORD=password123
DB_NAME=bazario
JWT_SECRET=bazario_01
PORT=5000
```

## Setup

From `backend/`:

```bash
npm install
npm run migrate
npm start
```

- **migrate**: applies `sql/schema.sql` to the database. It is safe and
  additive — it only creates tables/columns that don't already exist and
  never drops, truncates, or resets existing data. Safe to run repeatedly,
  including against a database that already has real users and orders in it.

There is no seed step. The database is expected to already contain
whatever data your MySQL instance has (including, on this project's
existing database, the original test seller and test buyer accounts and
their products/orders/reviews). New accounts are created only through the
real registration endpoints below.

## Existing test accounts

These pre-existing accounts (and all of their products, orders, reviews,
followers, cart/wishlist data, etc.) are preserved as-is in the database
and are not touched by anything in this project.

| Role   | Email              | Password    |
|--------|--------------------|------------|
| Buyer  | buyer@bazario.com  | password123 |
| Seller | seller@bazario.com | password123 |

## API

- `GET /health` — health check
- `GET /api/buyer/test` — buyer route smoke test (JSON)
- `GET /api/seller/test` — seller route smoke test (JSON)
- `POST /api/auth/buyer/register` — `{ "name", "email", "password", "confirmPassword" }`. Creates a brand-new buyer row (unique auto-increment id, bcrypt-hashed password, no copied data) and returns a JWT.
- `POST /api/auth/seller/register` — `{ "shopName", "ownerName", "email", "password", "confirmPassword" }`. Creates a brand-new seller row (unique auto-increment id, bcrypt-hashed password, no copied products/orders/reviews) and returns a JWT.
- `POST /api/auth/buyer/login` — `{ "email", "password" }`
- `POST /api/auth/seller/login` — `{ "email", "password" }`
- `GET /api/products` / `GET /api/products/:id` — public catalogue (supports `?category=`, `?categories=`, `?search=`, `?sellerId=`)
- `GET /api/seller/:sellerId/shop` — **public**, no auth. Buyer-facing shop info: shop name, owner name, description, follower count.
- `GET /api/seller/:sellerId/profile` / `PUT .../profile` — seller's own profile (auth: seller, self only). `PUT` body accepts `shopName`, `ownerName`, `shopDescription`. Response includes read-only `followerCount`.
- `POST /api/seller/:sellerId/products` — create a product (auth: seller, self only). The product's `seller_id` is always taken from the authenticated JWT identity, never from the request body — a seller can never create a product under another seller's id.
- `GET /api/buyer/:buyerId/follows/:sellerId` — current buyer's follow state for a shop (auth: buyer, self only)
- `POST /api/buyer/:buyerId/follows` — `{ "sellerId" }`, follow a shop (auth: buyer, self only)
- `DELETE /api/buyer/:buyerId/follows/:sellerId` — unfollow a shop (auth: buyer, self only)

Authenticated routes use header: `Authorization: Bearer <token>`.
JWTs only ever encode `{ id, role }` — never an email, password, hash, or
database credential.

Frontend: set `VITE_API_URL=http://localhost:5000` in the root `.env` for the Vite app.

## Phase 2 database change

`sellers.shop_description` (nullable `TEXT`) and a new `follows` table
(`buyer_id`, `seller_id`, `UNIQUE(buyer_id, seller_id)`) were added. Run
`npm run migrate` again on an existing database — it's safe and additive:
it only creates the `follows` table if missing and adds the
`shop_description` column if missing, without touching any existing rows.

## Phase 3 change

- Real registration endpoints were added for buyers and sellers (see API
  section above). Registration always inserts a fresh row and never
  copies any existing user's data.
- `seed.js` and the `npm run seed` script have been removed. No seed
  command is required or exists. Existing MySQL data (including the
  original test seller/buyer) is untouched by this change.
