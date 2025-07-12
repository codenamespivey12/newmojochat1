#!/bin/bash

# Setup script for sixtyoneeighty chat database
# This script applies the database schema to Supabase

set -e

echo "🚀 Setting up sixtyoneeighty chat database..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials."
    exit 1
fi

# Source environment variables
source .env.local

# Check required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
    exit 1
fi

echo "📊 Applying database schema..."

# Apply the schema using psql
PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DATABASE" \
    -f supabase/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema applied successfully!"
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "Your database now includes:"
    echo "  - Users table with profile information"
    echo "  - Chats table for conversation management"
    echo "  - Messages table for chat history"
    echo "  - User preferences table for settings"
    echo "  - Row Level Security (RLS) policies"
    echo "  - Automatic triggers for timestamps"
    echo ""
    echo "You can now start the development server with: npm run dev"
else
    echo "❌ Error: Failed to apply database schema!"
    exit 1
fi
