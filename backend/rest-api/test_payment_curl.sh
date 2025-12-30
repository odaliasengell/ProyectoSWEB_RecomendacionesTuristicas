#!/bin/bash
# Script de prueba manual usando curl
# Ejecuta: bash test_payment_curl.sh

BASE_URL="http://localhost:8000"
TOKEN=""
RESERVA_ID=""
PAYMENT_ID=""

echo "================================"
echo "PRUEBAS MANUALES - Payment Service"
echo "================================"

# 1. Login
echo -e "\n[1] Autenticándose..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

echo "Response: $RESPONSE"

# Extraer token (nota: esto es simple, en producción usa jq)
TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "✅ Token: ${TOKEN:0:20}..."

# 2. Crear una reserva de prueba
echo -e "\n[2] Creando reserva de prueba..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/reservas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tour_id": "507f1f77bcf86cd799439999",
    "fecha_reserva": "2024-01-20",
    "cantidad_personas": 2,
    "estado": "pendiente"
  }')

echo "Response: $RESPONSE"
RESERVA_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
if [ -z "$RESERVA_ID" ]; then
  RESERVA_ID=$(echo $RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
fi
echo "✅ Reserva ID: ${RESERVA_ID:0:20}..."

# 3. Procesar pago de reserva
echo -e "\n[3] Procesando pago de reserva..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/pagos/reserva" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"reserva_id\": \"$RESERVA_ID\",
    \"monto\": 150.00,
    \"descripcion\": \"Pago de prueba - Semana 2\"
  }")

echo "Response: $RESPONSE"
PAYMENT_ID=$(echo $RESPONSE | grep -o '"payment_id":"[^"]*' | cut -d'"' -f4)
echo "✅ Payment ID: ${PAYMENT_ID:0:20}..."

# 4. Obtener estado del pago
echo -e "\n[4] Consultando estado del pago..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/pagos/estado/$PAYMENT_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $RESPONSE"

# 5. Procesar pago de tour
echo -e "\n[5] Procesando pago de tour..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/pagos/tour" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tour_id": "507f1f77bcf86cd799439013",
    "cantidad_personas": 3,
    "precio_por_persona": 85.00
  }')
echo "Response: $RESPONSE"
TOUR_PAYMENT_ID=$(echo $RESPONSE | grep -o '"payment_id":"[^"]*' | cut -d'"' -f4)
echo "✅ Tour Payment ID: ${TOUR_PAYMENT_ID:0:20}..."

# 6. Procesar reembolso
echo -e "\n[6] Procesando reembolso..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/pagos/reembolso" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"payment_id\": \"$PAYMENT_ID\",
    \"razon\": \"Prueba de reembolso\"
  }")
echo "Response: $RESPONSE"

echo -e "\n================================"
echo "✅ Pruebas completadas"
echo "================================"
