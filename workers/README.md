# D1 Storage Worker

This directory contains the Cloudflare Worker that handles storage operations for the D1 database. The worker provides a simple API for getting, setting, and removing items from the D1 database.

## Setup

To set up the D1 database and deploy the worker, follow these steps:

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with your Cloudflare account:
   ```bash
   wrangler login
   ```

3. Create a new D1 database (if you haven't already):
   ```bash
   wrangler d1 create red-offers-store
   ```

4. Update the `database_id` in `wrangler.toml` with the ID from the previous step.

5. Run the setup script:
   ```bash
   ./setup-d1.sh
   ```

   This script will:
   - Apply the database schema to the D1 database
   - Deploy the worker
   - Print the worker URL

6. Update the `NEXT_PUBLIC_D1_WORKER_URL` environment variable in `.env.local` with the worker URL.

## Troubleshooting

If you encounter issues with the D1 storage, try the following:

1. Check if the worker is deployed correctly:
   ```bash
   wrangler whoami
   ```

2. Verify that the D1 database exists:
   ```bash
   wrangler d1 list
   ```

3. Check if the schema is applied correctly:
   ```bash
   wrangler d1 execute red-offers-store --command="SELECT name FROM sqlite_master WHERE type='table'"
   ```

4. Test the worker directly:
   ```bash
   curl "https://d1-storage.your-account.workers.dev?method=getItem&key=test"
   ```

5. If you're still having issues, try redeploying the worker:
   ```bash
   wrangler deploy
   ```

## API

The worker provides the following API endpoints:

### Get Item

```
GET /?method=getItem&key=<key>
```

Returns the value associated with the given key.

### Set Item

```
POST /?method=setItem&key=<key>
Content-Type: application/json

{
  "value": <value>
}
```

Sets the value associated with the given key.

### Remove Item

```
POST /?method=removeItem&key=<key>
```

Removes the value associated with the given key.

## Schema

The D1 database uses the following schema:

```sql
CREATE TABLE IF NOT EXISTS store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_store_key ON store(key);
```

This schema defines a simple key-value store with an additional timestamp column to track when each item was last updated.
