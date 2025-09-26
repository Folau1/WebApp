#!/bin/bash

echo "🚀 Setting up Telegram WebApp Shop..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration!"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start development databases
echo "🐳 Starting development databases..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run migrations
echo "🗄️  Running database migrations..."
npm run prisma:generate
npm run prisma:migrate

# Seed database
echo "🌱 Seeding database with sample data..."
npm run prisma:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development servers, run:"
echo "  npm run dev"
echo ""
echo "Services will be available at:"
echo "  - WebApp: http://localhost:5173"
echo "  - Admin: http://localhost:5174"
echo "  - API: http://localhost:3000"
echo "  - MinIO: http://localhost:9001"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@example.com"
echo "  Password: admin123"








