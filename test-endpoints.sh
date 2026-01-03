#!/bin/bash

# Script para testing de endpoints
# Requiere curl instalado

BASE_URL="http://localhost"

echo "🧪 Testing API Endpoints"
echo "===================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function for testing
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo ""
    echo -e "${YELLOW}📌 $description${NC}"
    echo "   $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json")
    fi
    
    echo "   Response: $response"
}

# 1. Health Check
test_endpoint "GET" "/health" "" "Health Check"

# 2. Auth Service - Register
test_endpoint "POST" "/auth/register" \
    '{"email":"test@example.com","password":"TestPass123!","name":"Test User"}' \
    "Auth - Register User"

# 3. Auth Service - Login
test_endpoint "POST" "/auth/login" \
    '{"email":"test@example.com","password":"TestPass123!"}' \
    "Auth - Login"

# 4. Payment Service - Init Payment
test_endpoint "POST" "/payment/init" \
    '{"user_id":"user_123","amount":100.00,"currency":"USD","method":"stripe"}' \
    "Payment - Init Payment"

# 5. AI Orchestrator - Chat
test_endpoint "POST" "/chat" \
    '{"message":"Busca tours a la Amazonía","conversation_id":"conv_123"}' \
    "AI - Chat Message"

# 6. REST API - List Tours
test_endpoint "GET" "/api/tours" "" "REST API - List Tours"

# 7. GraphQL - Introspection
test_endpoint "POST" "/graphql" \
    '{"query":"{ __schema { types { name } } }"}' \
    "GraphQL - Schema Introspection"

echo ""
echo "===================="
echo "✅ Testing completado"
