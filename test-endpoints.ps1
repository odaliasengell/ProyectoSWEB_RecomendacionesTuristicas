# Script para testing de endpoints en Windows
# Requiere curl (incluido en Windows 10+)

$baseUrl = "http://localhost"

Write-Host "🧪 Testing API Endpoints" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green

function Test-Endpoint {
    param(
        [string]$method,
        [string]$endpoint,
        [string]$data,
        [string]$description
    )
    
    Write-Host ""
    Write-Host "📌 $description" -ForegroundColor Yellow
    Write-Host "   $method $endpoint"
    
    try {
        if ($data) {
            $response = curl -s -X $method "$baseUrl$endpoint" `
                -H "Content-Type: application/json" `
                -d $data
        } else {
            $response = curl -s -X $method "$baseUrl$endpoint" `
                -H "Content-Type: application/json"
        }
        
        Write-Host "   Response: $response" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Error: $_" -ForegroundColor Red
    }
}

# 1. Health Check
Test-Endpoint -method "GET" -endpoint "/health" -description "Health Check"

# 2. Auth Service - Register
Test-Endpoint -method "POST" -endpoint "/auth/register" `
    -data '{"email":"test@example.com","password":"TestPass123!","name":"Test User"}' `
    -description "Auth - Register User"

# 3. Auth Service - Login
Test-Endpoint -method "POST" -endpoint "/auth/login" `
    -data '{"email":"test@example.com","password":"TestPass123!"}' `
    -description "Auth - Login"

# 4. Payment Service - Init Payment
Test-Endpoint -method "POST" -endpoint "/payment/init" `
    -data '{"user_id":"user_123","amount":100.00,"currency":"USD","method":"stripe"}' `
    -description "Payment - Init Payment"

# 5. AI Orchestrator - Chat
Test-Endpoint -method "POST" -endpoint "/chat" `
    -data '{"message":"Busca tours a la Amazonía","conversation_id":"conv_123"}' `
    -description "AI - Chat Message"

# 6. REST API - List Tours
Test-Endpoint -method "GET" -endpoint "/api/tours" -description "REST API - List Tours"

# 7. GraphQL - Introspection
Test-Endpoint -method "POST" -endpoint "/graphql" `
    -data '{"query":"{ __schema { types { name } } }"}' `
    -description "GraphQL - Schema Introspection"

Write-Host ""
Write-Host "====================" -ForegroundColor Green
Write-Host "✅ Testing completado" -ForegroundColor Green
