#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Base URL for the API
BASE_URL="http://localhost:8080"

# Test user and company data
TEST_USER_ID="TEST_FRAUD_123"
TEST_COMPANY_ID="COMP_FRAUD_123"

# Function to check API response
check_response() {
    local status=$1
    local expected=$2
    local message=$3

    if [ $status -eq $expected ]; then
        echo -e "${GREEN}✓${NC} $message - Success (Status: $status)"
        return 0
    else
        echo -e "${RED}✗${NC} $message - Failed (Status: $status, Expected: $expected)"
        return 1
    fi
}

# Setup test data
echo "Setting up test data..."

# Create test user
USER_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/users/ \
    -H "Content-Type: application/json" \
    -d "{\"passport_string\": \"$TEST_USER_ID\", \"name\": \"Test User\", \"email\": \"test@example.com\"}")
STATUS=${USER_RESPONSE: -3}
check_response $STATUS 200 "Create test user"

# Create test company
COMPANY_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/companies/ \
    -H "Content-Type: application/json" \
    -d "{\"company_id\": \"$TEST_COMPANY_ID\", \"name\": \"Test Company\", \"sector\": \"Technology\"}")
STATUS=${COMPANY_RESPONSE: -3}
check_response $STATUS 200 "Create test company"

echo "Creating breach events with different severities..."

# Create LOW severity event
EVENT1_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/breach-events/ \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$TEST_USER_ID\", \"company_id\": \"$TEST_COMPANY_ID\", \"severity\": \"LOW\", \"event_type\": \"suspicious_activity\", \"description\": \"Test Event 1\"}")
STATUS=${EVENT1_RESPONSE: -3}
check_response $STATUS 200 "Create LOW severity event"

# Create MEDIUM severity event
EVENT2_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/breach-events/ \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$TEST_USER_ID\", \"company_id\": \"$TEST_COMPANY_ID\", \"severity\": \"MEDIUM\", \"event_type\": \"violating_terms\", \"description\": \"Test Event 2\"}")
STATUS=${EVENT2_RESPONSE: -3}
check_response $STATUS 200 "Create MEDIUM severity event"

# Create HIGH severity event
EVENT3_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/breach-events/ \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$TEST_USER_ID\", \"company_id\": \"TEST_COMP_2\", \"severity\": \"HIGH\", \"event_type\": \"fraud\", \"description\": \"Test Event 3\"}")
STATUS=${EVENT3_RESPONSE: -3}
check_response $STATUS 200 "Create HIGH severity event"

# Create CRITICAL severity event
EVENT4_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/breach-events/ \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$TEST_USER_ID\", \"company_id\": \"TEST_COMP_3\", \"severity\": \"CRITICAL\", \"event_type\": \"illegal_activity\", \"description\": \"Test Event 4\"}")
STATUS=${EVENT4_RESPONSE: -3}
check_response $STATUS 200 "Create CRITICAL severity event"

echo "Checking reference score..."

# Get user's reference score
SCORE_RESPONSE=$(curl -s -w "%{http_code}" -X GET $BASE_URL/api/v1/users/$TEST_USER_ID/ref-score)
STATUS=${SCORE_RESPONSE: -3}
SCORE_DATA=${SCORE_RESPONSE%???}
check_response $STATUS 200 "Get user reference score"

# Extract and validate the score
SCORE=$(echo $SCORE_DATA | jq -r '.ref_score')
if (( $(echo "$SCORE > 0.5" | bc -l) )); then
    echo -e "${GREEN}✓${NC} Reference score ($SCORE) is above 0.5 as expected with multiple severe events"
else
    echo -e "${RED}✗${NC} Reference score ($SCORE) is unexpectedly low"
fi

echo "Cleaning up test data..."

# Delete test events for user
curl -s -X GET "$BASE_URL/api/v1/breach-events/user/$TEST_USER_ID" | jq -r '.[].id' | while read -r event_id; do
    curl -s -X DELETE "$BASE_URL/api/v1/breach-events/$event_id" > /dev/null
done

# Delete test user
curl -s -X DELETE "$BASE_URL/api/v1/users/$TEST_USER_ID" > /dev/null

# Delete test company
curl -s -X DELETE "$BASE_URL/api/v1/companies/$TEST_COMPANY_ID" > /dev/null

echo "Fraud score test completed"
