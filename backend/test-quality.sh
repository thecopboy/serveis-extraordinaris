#!/bin/bash

echo "🧪 Tests de Qualitat - FASE 1"
echo "=============================="
echo ""

# Assegurar que el servidor està actiu
if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
  echo "❌ Servidor no està actiu a http://localhost:5000"
  exit 1
fi

echo "✅ Servidor actiu"
echo ""

# Test 1: Health check
echo "1️⃣ Test Healthcheck:"
HEALTH=$(curl -s http://localhost:5000/health)
echo "$HEALTH" | jq -C '.'
STATUS=$(echo "$HEALTH" | jq -r '.status')
DB=$(echo "$HEALTH" | jq -r '.database')

if [ "$STATUS" == "ok" ] && [ "$DB" == "connected" ]; then
  echo "   ✅ Health check OK"
else
  echo "   ❌ Health check FAILED"
fi
echo ""

# Test 2: Request ID
echo "2️⃣ Test Request ID:"
REQUEST_ID=$(curl -s -i http://localhost:5000/ 2>&1 | grep -i "x-request-id" | cut -d' ' -f2 | tr -d '\r\n')
if [ -n "$REQUEST_ID" ]; then
  echo "   ✅ Request ID present: $REQUEST_ID"
else
  echo "   ❌ Request ID no trobat"
fi
echo ""

# Test 3: Error 404
echo "3️⃣ Test Error 404:"
ERROR_404=$(curl -s http://localhost:5000/ruta-no-existent)
ERROR_MSG=$(echo "$ERROR_404" | jq -r '.message')
if echo "$ERROR_MSG" | grep -q "not found"; then
  echo "   ✅ Error 404 funciona"
  echo "$ERROR_404" | jq -C '.'
else
  echo "   ❌ Error 404 no funciona correctament"
fi
echo ""

# Test 4: Errors personalitzats (només development)
if [ "$NODE_ENV" != "production" ]; then
  echo "4️⃣ Test Errors Personalitzats:"
  
  # NotFoundError
  NOT_FOUND=$(curl -s http://localhost:5000/api/v1/test-errors/not-found)
  if echo "$NOT_FOUND" | jq -r '.statusCode' | grep -q "404"; then
    echo "   ✅ NotFoundError funciona"
  else
    echo "   ❌ NotFoundError fallat"
  fi
  
  # ValidationError
  VALIDATION=$(curl -s http://localhost:5000/api/v1/test-errors/validation)
  if echo "$VALIDATION" | jq -r '.statusCode' | grep -q "422"; then
    echo "   ✅ ValidationError funciona"
  else
    echo "   ❌ ValidationError fallat"
  fi
  
  echo ""
fi

# Test 5: CORS headers
echo "5️⃣ Test CORS Headers:"
CORS=$(curl -s -i -H "Origin: http://localhost:3000" http://localhost:5000/ 2>&1 | grep -i "access-control-allow")
if [ -n "$CORS" ]; then
  echo "   ✅ CORS headers presents"
else
  echo "   ❌ CORS headers no trobats"
fi
echo ""

echo "=============================="
echo "✅ Tests completats!"
