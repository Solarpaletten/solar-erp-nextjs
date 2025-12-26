#!/bin/bash
# ============================================
# WAREHOUSE API TEST SCRIPT
# Sprint 3: Purchases → Stock → Sales
# ============================================

BASE_URL="${1:-http://localhost:3000}"
COMPANY_ID="${2:-16}"

echo "============================================"
echo "🧪 WAREHOUSE API TESTS"
echo "Base URL: $BASE_URL"
echo "Company ID: $COMPANY_ID"
echo "============================================"

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# TEST 1: Проверка текущего состояния склада
# ============================================
echo -e "\n${YELLOW}📦 TEST 1: GET Warehouse (current state)${NC}"
curl -s "$BASE_URL/api/company/$COMPANY_ID/warehouse" | jq '.stats'

# ============================================
# TEST 2: Создание закупки (PURCHASE)
# ============================================
echo -e "\n${YELLOW}📥 TEST 2: POST Purchase (stock INCREMENT)${NC}"

# Сначала получим ID существующего продукта и supplier
echo "Getting existing product..."
PRODUCT_ID=$(curl -s "$BASE_URL/api/company/$COMPANY_ID/products" | jq '.products[0].id')
echo "Product ID: $PRODUCT_ID"

echo "Getting existing supplier..."
SUPPLIER_ID=$(curl -s "$BASE_URL/api/company/$COMPANY_ID/clients" | jq '.clients[] | select(.role == "SUPPLIER" or .role == "BOTH") | .id' | head -1)
if [ -z "$SUPPLIER_ID" ] || [ "$SUPPLIER_ID" = "null" ]; then
  SUPPLIER_ID=$(curl -s "$BASE_URL/api/company/$COMPANY_ID/clients" | jq '.clients[0].id')
fi
echo "Supplier ID: $SUPPLIER_ID"

# Создаём закупку
PURCHASE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/company/$COMPANY_ID/purchases" \
  -H "Content-Type: application/json" \
  -d "{
    \"document_number\": \"PUR-TEST-$(date +%s)\",
    \"document_date\": \"$(date +%Y-%m-%d)\",
    \"supplier_id\": $SUPPLIER_ID,
    \"items\": [
      {
        \"product_id\": $PRODUCT_ID,
        \"quantity\": 100,
        \"unit_price\": 50.00,
        \"vat_rate\": 19
      }
    ],
    \"currency\": \"EUR\"
  }")

echo "$PURCHASE_RESPONSE" | jq '{success, message, purchase_id: .purchase.id}'

if echo "$PURCHASE_RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Purchase created successfully${NC}"
else
  echo -e "${RED}❌ Purchase failed${NC}"
  echo "$PURCHASE_RESPONSE" | jq '.error'
fi

# ============================================
# TEST 3: Проверка склада после закупки
# ============================================
echo -e "\n${YELLOW}📦 TEST 3: GET Warehouse (after purchase)${NC}"
curl -s "$BASE_URL/api/company/$COMPANY_ID/warehouse" | jq ".warehouse[] | select(.id == $PRODUCT_ID) | {id, name, current_stock, status}"

# ============================================
# TEST 4: Попытка продажи больше чем есть
# ============================================
echo -e "\n${YELLOW}📤 TEST 4: POST Sale with INSUFFICIENT stock (should fail)${NC}"

# Получим клиента
CLIENT_ID=$(curl -s "$BASE_URL/api/company/$COMPANY_ID/clients" | jq '.clients[] | select(.role == "CLIENT" or .role == "BOTH") | .id' | head -1)
if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" = "null" ]; then
  CLIENT_ID=$(curl -s "$BASE_URL/api/company/$COMPANY_ID/clients" | jq '.clients[0].id')
fi
echo "Client ID: $CLIENT_ID"

SALE_FAIL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/company/$COMPANY_ID/sales" \
  -H "Content-Type: application/json" \
  -d "{
    \"document_number\": \"SALE-FAIL-$(date +%s)\",
    \"document_date\": \"$(date +%Y-%m-%d)\",
    \"client_id\": $CLIENT_ID,
    \"items\": [
      {
        \"product_id\": $PRODUCT_ID,
        \"quantity\": 999999,
        \"unit_price_base\": 75.00,
        \"vat_rate\": 19
      }
    ],
    \"currency\": \"EUR\"
  }")

if echo "$SALE_FAIL_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo -e "${GREEN}✅ Correctly rejected: Insufficient stock${NC}"
  echo "$SALE_FAIL_RESPONSE" | jq '{error, details}'
else
  echo -e "${RED}❌ Should have failed but didn't!${NC}"
fi

# ============================================
# TEST 5: Успешная продажа
# ============================================
echo -e "\n${YELLOW}📤 TEST 5: POST Sale with VALID quantity (should succeed)${NC}"

SALE_SUCCESS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/company/$COMPANY_ID/sales" \
  -H "Content-Type: application/json" \
  -d "{
    \"document_number\": \"SALE-OK-$(date +%s)\",
    \"document_date\": \"$(date +%Y-%m-%d)\",
    \"client_id\": $CLIENT_ID,
    \"items\": [
      {
        \"product_id\": $PRODUCT_ID,
        \"quantity\": 25,
        \"unit_price_base\": 75.00,
        \"vat_rate\": 19
      }
    ],
    \"currency\": \"EUR\"
  }")

echo "$SALE_SUCCESS_RESPONSE" | jq '{success, message, sale_id: .sale.id}'

if echo "$SALE_SUCCESS_RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Sale created successfully${NC}"
else
  echo -e "${RED}❌ Sale failed${NC}"
  echo "$SALE_SUCCESS_RESPONSE" | jq '.error'
fi

# ============================================
# TEST 6: Финальная проверка склада
# ============================================
echo -e "\n${YELLOW}📦 TEST 6: GET Warehouse (final state)${NC}"
curl -s "$BASE_URL/api/company/$COMPANY_ID/warehouse" | jq ".warehouse[] | select(.id == $PRODUCT_ID) | {id, name, current_stock, status}"

# ============================================
# TEST 7: Попытка прямого изменения склада
# ============================================
echo -e "\n${YELLOW}🚫 TEST 7: POST to Warehouse (should be rejected)${NC}"

WAREHOUSE_POST=$(curl -s -X POST "$BASE_URL/api/company/$COMPANY_ID/warehouse" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 100}')

if echo "$WAREHOUSE_POST" | jq -e '.error' > /dev/null; then
  echo -e "${GREEN}✅ Direct warehouse POST correctly rejected${NC}"
  echo "$WAREHOUSE_POST" | jq '{error}'
else
  echo -e "${RED}❌ Should have rejected direct warehouse modification!${NC}"
fi

# ============================================
# SUMMARY
# ============================================
echo -e "\n============================================"
echo -e "${GREEN}🏁 TEST COMPLETE${NC}"
echo "============================================"
echo "Expected flow:"
echo "1. Purchase +100 → Stock increases"
echo "2. Sale attempt 999999 → REJECTED (insufficient)"
echo "3. Sale +25 → Stock decreases"
echo "4. Direct warehouse POST → REJECTED (405)"
echo "============================================"

# GET списки для проверки
echo -e "\n📋 Purchases list:"
curl -s "$BASE_URL/api/company/$COMPANY_ID/purchases" | jq '.count'

echo -e "\n📋 Sales list:"
curl -s "$BASE_URL/api/company/$COMPANY_ID/sales" | jq '.count'

echo -e "\n📋 Warehouse stats:"
curl -s "$BASE_URL/api/company/$COMPANY_ID/warehouse" | jq '.stats'
