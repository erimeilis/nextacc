#!/bin/bash

# Script to set up the D1 database for the d1-storage worker
# This script should be run from the repository root

echo "Setting up D1 database for d1-storage worker..."

# Change to the workers directory
cd workers || { echo "Error: workers directory not found"; exit 1; }

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler is not installed. Please install it with 'npm install -g wrangler'"
    exit 1
fi

# Get the database ID from wrangler.toml
DB_ID=$(grep -o 'database_id = "[^"]*"' wrangler.toml | cut -d'"' -f2)
DB_NAME=$(grep -o 'database_name = "[^"]*"' wrangler.toml | cut -d'"' -f2)

if [ -z "$DB_ID" ] || [ -z "$DB_NAME" ]; then
    echo "Error: Could not find database_id or database_name in wrangler.toml"
    exit 1
fi

echo "Found database: $DB_NAME ($DB_ID)"

# Apply the schema to the D1 database
echo "Applying schema to D1 database..."
wrangler d1 execute "$DB_NAME" --file=schema.sql

if [ $? -ne 0 ]; then
    echo "Error: Failed to apply schema to D1 database"
    exit 1
fi

echo "Schema applied successfully"

# Deploy the worker
echo "Deploying d1-storage worker..."
wrangler deploy

if [ $? -ne 0 ]; then
    echo "Error: Failed to deploy d1-storage worker"
    exit 1
fi

echo "Worker deployed successfully"

# Print the worker URL
WORKER_URL=$(grep -o 'name = "[^"]*"' wrangler.toml | cut -d'"' -f2)
echo "Worker URL: https://$WORKER_URL.workers.dev"
echo "Make sure to update NEXT_PUBLIC_D1_WORKER_URL in .env.local with this URL"

echo "D1 setup complete!"
