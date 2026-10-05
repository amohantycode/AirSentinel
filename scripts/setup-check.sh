#!/bin/bash
# Quick Setup Helper for Supabase
# Run this after you've added your Supabase credentials to .env.local

echo "🚀 AirSentinel - Optional Supabase Setup"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create it by copying .env.example"
    exit 1
fi

# Check for Supabase URL
if grep -q "NEXT_PUBLIC_SUPABASE_URL=$" .env.local || grep -q "NEXT_PUBLIC_SUPABASE_URL=\"\"" .env.local; then
    echo "⚠️  Warning: NEXT_PUBLIC_SUPABASE_URL is empty in .env.local"
    echo "Please add your Supabase Project URL"
    echo ""
fi

# Check for Supabase key
if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=$" .env.local || grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=\"\"" .env.local; then
    echo "⚠️  Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is empty in .env.local"
    echo "Please add your Supabase anon key"
    echo ""
fi

echo "📋 Setup Checklist:"
echo "==================="
echo ""
echo "1. Create Supabase account at https://supabase.com"
echo "2. Create a new project"
echo "3. Get your credentials from Settings > API"
echo "4. Add them to .env.local file"
echo "5. Run SQL scripts in Supabase SQL Editor:"
echo "   - scripts/01-create-tables.sql"
echo "   - scripts/02-enable-rls.sql"
echo "   - scripts/03-seed-sample-data.sql"
echo "6. Restart your dev server"
echo ""
echo "📚 Documentation:"
echo "=================="
echo "- Setup and database guidance: docs/development.md"
echo "- Architecture and data sources: docs/architecture.md"
echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "After completing setup, run:"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000/map"
echo ""
echo "✨ Good luck!"
