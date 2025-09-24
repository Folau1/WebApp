#!/bin/bash

echo "🏥 Checking services health..."
echo ""

# Check API
echo -n "API Server: "
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

# Check WebApp
echo -n "WebApp: "
if curl -s http://localhost:5173 > /dev/null || curl -s http://localhost:8080 > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

# Check Admin
echo -n "Admin Panel: "
if curl -s http://localhost:5174 > /dev/null || curl -s http://localhost:8081 > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

# Check PostgreSQL
echo -n "PostgreSQL: "
if docker ps | grep -q postgres; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

# Check MinIO
echo -n "MinIO: "
if curl -s http://localhost:9001 > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

echo ""
echo "Done!"







