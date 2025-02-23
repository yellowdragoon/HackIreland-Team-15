#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'
BASE_URL="http://localhost:8080"
TEST_USER_ID="TEST_FRAUD_123"
TEST_COMPANY_ID="COMP_FRAUD_123"

check_response() {
    local response_status=$1
    local expected=$2
    local message=$3

    if [ $response_status -eq $expected ]; then
        echo -e "${GREEN}✓${NC} $message - Success (Status: $response_status)"
        return 0
    else
        echo -e "${RED}✗${NC} $message - Failed (Status: $response_status, Expected: $expected)"
        return 1
    fi
}

echo "Setting up test data..."

# Create test user
USER_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/users/ \
    -H "Content-Type: application/json" \
    -d "{\"passport_string\": \"$TEST_USER_ID\", \"name\": \"Test User\", \"ref_score\": 0}")
USER_DATA=${USER_RESPONSE%???}
echo "User creation response: $USER_DATA"
RESPONSE_STATUS=${USER_RESPONSE: -3}
check_response "$RESPONSE_STATUS" 200 "Create test user"

# Create test company
COMPANY_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/companies/ \
    -H "Content-Type: application/json" \
    -d "{\"id\": \"$TEST_COMPANY_ID\", \"name\": \"Test Company\", \"industry\": \"Technology\"}")
RESPONSE_STATUS=${COMPANY_RESPONSE: -3}
check_response "$RESPONSE_STATUS" 200 "Create test company"

echo "Creating breach events with different severities..."

# Create low effect score event
EVENT1_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/breach-events/ \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$TEST_USER_ID\", \"company_id\": \"$TEST_COMPANY_ID\", \"breach_type\": \"SUSPICIOUS_ACTIVITY\", \"effect_score\": 30, \"severity\": \"LOW\", \"status\": \"OPEN\", \"description\": \"Test Event 1\"}")
RESPONSE_STATUS=${EVENT1_RESPONSE: -3}
check_response "$RESPONSE_STATUS" 200 "Create low effect score event"

# Create medium effect score event
EVENT2_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/breach-events/ \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$TEST_USER_ID\", \"company_id\": \"$TEST_COMPANY_ID\", \"breach_type\": \"VIOLATING_TERMS\", \"effect_score\": 50, \"severity\": \"MEDIUM\", \"status\": \"OPEN\", \"description\": \"Test Event 2\"}")
RESPONSE_STATUS=${EVENT2_RESPONSE: -3}
check_response "$RESPONSE_STATUS" 200 "Create medium effect score event"

# Create high effect score event
EVENT3_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/breach-events/ \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$TEST_USER_ID\", \"company_id\": \"TEST_COMP_2\", \"breach_type\": \"FRAUD\", \"effect_score\": 75, \"severity\": \"HIGH\", \"status\": \"OPEN\", \"description\": \"Test Event 3\"}")
RESPONSE_STATUS=${EVENT3_RESPONSE: -3}
check_response "$RESPONSE_STATUS" 200 "Create high effect score event"

# Create very high effect score event
EVENT4_RESPONSE=$(curl -s -w "%{http_code}" -X POST $BASE_URL/api/v1/breach-events/ \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$TEST_USER_ID\", \"company_id\": \"TEST_COMP_3\", \"breach_type\": \"ILLEGAL_ACTIVITY\", \"effect_score\": 90, \"severity\": \"CRITICAL\", \"status\": \"OPEN\", \"description\": \"Test Event 4\"}")
RESPONSE_STATUS=${EVENT4_RESPONSE: -3}
check_response "$RESPONSE_STATUS" 200 "Create very high effect score event"

echo "Checking reference score..."

# Get user's reference score
echo "Getting reference score for user $TEST_USER_ID..."
SCORE_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/v1/users/score/$TEST_USER_ID")
RESPONSE_STATUS=${SCORE_RESPONSE: -3}
SCORE_DATA=${SCORE_RESPONSE%???}
check_response "$RESPONSE_STATUS" 200 "Get user reference score"

# Extract and validate the score
SCORE=$(echo $SCORE_DATA | jq -r '.data.ref_score')
if [ "$SCORE" != "null" ] && (( $(echo "$SCORE > 0.5" | bc -l) )); then
    echo -e "${GREEN}✓${NC} Reference score ($SCORE) is above 0.5 as expected with multiple severe events"
else
    echo -e "${RED}✗${NC} Reference score ($SCORE) is unexpectedly low or null: $SCORE_DATA"
fi

echo "Cleaning up test data..."

# Delete test events for user
curl -s -X GET "$BASE_URL/api/v1/breach-events/user/$TEST_USER_ID" | jq -r '.data[]._id' | while read -r event_id; do
    curl -s -X DELETE "$BASE_URL/api/v1/breach-events/$event_id" > /dev/null
done

# Delete test user
curl -s -X DELETE "$BASE_URL/api/v1/users/$TEST_USER_ID" > /dev/null

# Delete test company
curl -s -X DELETE "$BASE_URL/api/v1/companies/$TEST_COMPANY_ID" > /dev/null

echo "Fraud score test completed"
