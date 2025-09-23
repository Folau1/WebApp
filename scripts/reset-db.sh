#!/bin/bash

echo "⚠️  This will reset the database and remove all data!"
read -p "Are you sure? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🗑️  Dropping database..."
    cd server
    npx prisma migrate reset --force
    
    echo "🌱 Seeding database..."
    npx prisma db seed
    
    echo "✅ Database reset complete!"
else
    echo "❌ Cancelled"
fi






