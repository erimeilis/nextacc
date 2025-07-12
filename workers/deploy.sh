#!/bin/bash

# Script to deploy the D1 storage worker to Cloudflare

echo "Deploying D1 storage worker to Cloudflare..."

# Navigate to the workers directory
cd "$(dirname "$0")"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler is not installed. Please install it with 'npm install -g wrangler'."
    exit 1
fi

# Check if the user is logged in to Cloudflare
echo "Checking Cloudflare login status..."
if ! wrangler whoami &> /dev/null; then
    echo "You are not logged in to Cloudflare. Please login with 'wrangler login'."
    wrangler login
fi

# Deploy the worker
echo "Deploying worker..."
wrangler deploy

# Check if the deployment was successful
if [ $? -eq 0 ]; then
    echo "Worker deployed successfully!"
    echo "Testing the worker..."
    
    # Get the worker URL from wrangler.toml
    WORKER_URL="https://d1-storage.eri-42e.workers.dev"
    
    # Test the worker with a simple GET request
    echo "Testing GET endpoint..."
    curl -X GET "$WORKER_URL/get?key=test-key"
    echo ""
    
    echo "Deployment and testing complete!"
else
    echo "Error: Worker deployment failed."
    exit 1
fi
