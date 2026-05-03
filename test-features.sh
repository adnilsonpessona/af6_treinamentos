#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000/api/v1"
ADMIN_EMAIL="testadmin@example.com"
ADMIN_PASSWORD="test123"

echo -e "${BLUE}=== Testing Treinamentos Features ===${NC}\n"

# Test 1: Login to get token
echo -e "${BLUE}1. Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo -e "Token: ${TOKEN:0:20}...\n"

# Test 2: Get companies
echo -e "${BLUE}2. Testing Companies Endpoint...${NC}"
COMPANIES=$(curl -s -X GET "$API_URL/companies" \
  -H "Authorization: Bearer $TOKEN")

COMPANY_COUNT=$(echo "$COMPANIES" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓ Got $COMPANY_COUNT companies${NC}\n"

# Test 3: Create a new company
echo -e "${BLUE}3. Testing Create Company...${NC}"
CREATE_COMPANY=$(curl -s -X POST "$API_URL/companies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa": 1,
    "revenda": 100,
    "razaoSocial": "Test Company Ltd",
    "nomeFantasia": "Test Company",
    "cnpj": "12345678901234"
  }')

COMPANY_ID=$(echo "$CREATE_COMPANY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$COMPANY_ID" ]; then
  echo -e "${RED}❌ Create company failed${NC}"
  echo "Response: $CREATE_COMPANY"
else
  echo -e "${GREEN}✓ Company created with ID: $COMPANY_ID${NC}\n"
fi

# Test 4: Get categories
echo -e "${BLUE}4. Testing Categories Endpoint...${NC}"
CATEGORIES=$(curl -s -X GET "$API_URL/categories" \
  -H "Authorization: Bearer $TOKEN")

CATEGORY_COUNT=$(echo "$CATEGORIES" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓ Got $CATEGORY_COUNT categories${NC}\n"

# Test 5: Create a category with department
echo -e "${BLUE}5. Testing Create Category with Department...${NC}"
CREATE_CATEGORY=$(curl -s -X POST "$API_URL/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Category",
    "department": "RH"
  }')

CATEGORY_ID=$(echo "$CREATE_CATEGORY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$CATEGORY_ID" ]; then
  echo -e "${RED}❌ Create category failed${NC}"
  echo "Response: $CREATE_CATEGORY"
else
  echo -e "${GREEN}✓ Category created with ID: $CATEGORY_ID${NC}\n"
fi

# Test 6: Create a subcategory
echo -e "${BLUE}6. Testing Create Subcategory...${NC}"
CREATE_SUBCATEGORY=$(curl -s -X POST "$API_URL/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Subcategory\",
    \"department\": \"RH\",
    \"parentCategoryId\": \"$CATEGORY_ID\"
  }")

SUBCATEGORY_ID=$(echo "$CREATE_SUBCATEGORY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$SUBCATEGORY_ID" ]; then
  echo -e "${RED}❌ Create subcategory failed${NC}"
  echo "Response: $CREATE_SUBCATEGORY"
else
  echo -e "${GREEN}✓ Subcategory created with ID: $SUBCATEGORY_ID${NC}\n"
fi

# Test 7: Get courses
echo -e "${BLUE}7. Testing Courses Endpoint...${NC}"
COURSES=$(curl -s -X GET "$API_URL/courses" \
  -H "Authorization: Bearer $TOKEN")

COURSE_COUNT=$(echo "$COURSES" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓ Got $COURSE_COUNT courses${NC}\n"

echo -e "${BLUE}=== All Tests Completed ===${NC}"
