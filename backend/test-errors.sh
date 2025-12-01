#!/bin/bash

echo "🧪 Testejant sistema d'errors..."
echo ""

echo "1️⃣ Test 404 - Ruta no trobada:"
curl -s http://localhost:5000/api/v1/no-existent | jq -C
echo ""

echo "2️⃣ Test NotFoundError:"
curl -s http://localhost:5000/api/v1/test-errors/not-found | jq -C
echo ""

echo "3️⃣ Test ValidationError:"
curl -s http://localhost:5000/api/v1/test-errors/validation | jq -C
echo ""

echo "4️⃣ Test BadRequestError:"
curl -s http://localhost:5000/api/v1/test-errors/bad-request | jq -C
echo ""

echo "5️⃣ Test Server Error (no controlat):"
curl -s http://localhost:5000/api/v1/test-errors/server-error | jq -C
echo ""

echo "✅ Tests completats!"
