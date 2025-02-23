#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'
BLUE='\033[0;34m'

BASE_URL="http://localhost:8080/api/v1"

# Function to print test results
print_result() {
    local endpoint=$1
    local method=$2
    local response_status=$3
    local expected=$4

    if [ $response_status -eq $expected ]; then
        echo -e "${GREEN}✓ $method $endpoint - Success (Status: $response_status)${NC}"
    else
        echo -e "${RED}✗ $method $endpoint - Failed (Status: $response_status, Expected: $expected)${NC}"
    fi
}

# Function to cleanup test data
cleanup_test_data() {
    echo -e "\n${BLUE}Cleaning up test data...${NC}"

    # Delete breach events
    curl -s -X DELETE "$BASE_URL/breach-events/user/TEST123" > /dev/null

    # Delete breaches
    curl -s -X DELETE "$BASE_URL/breaches/COMP123" > /dev/null

    # Delete company
    curl -s -X DELETE "$BASE_URL/companies/COMP123" > /dev/null

    # Delete user
    curl -s -X DELETE "$BASE_URL/users/TEST123" > /dev/null

    echo -e "${GREEN}Cleanup completed${NC}"
}

# Function to ensure test data exists
ensure_test_data() {
    echo -e "\n${BLUE}Ensuring test data exists...${NC}"

    # Check if test user exists
    USER_EXISTS=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/users/TEST123")
    if [ "${USER_EXISTS: -3}" != "200" ]; then
        echo "Creating test user..."
        curl -s -X POST "$BASE_URL/users/" \
            -H "Content-Type: application/json" \
            -d '{"name": "Test User", "passport_string": "TEST123", "ref_score": 5}' > /dev/null
    fi

    # Check if test company exists
    COMPANY_EXISTS=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/companies/COMP123")
    if [ "${COMPANY_EXISTS: -3}" != "200" ]; then
        echo "Creating test company..."
        curl -s -X POST "$BASE_URL/companies/" \
            -H "Content-Type: application/json" \
            -d '{"name": "Test Company", "id": "COMP123", "industry": "Technology"}' > /dev/null
    fi

    echo -e "${GREEN}Test data setup completed${NC}"
}

# Function to run all tests
run_tests() {
    echo -e "\n${BLUE}Starting API Tests...${NC}\n"

    # Test 1: Create User
    echo -e "${BLUE}Testing User Endpoints:${NC}"
    CREATE_USER_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/users/" \
        -H "Content-Type: application/json" \
        -d '{"name": "Test User", "passport_string": "TEST123", "ref_score": 5}')
    RESPONSE_STATUS=${CREATE_USER_RESPONSE: -3}
    print_result "/users/ (Create)" "POST" $RESPONSE_STATUS 200

    # Test 2: Get User
    GET_USER_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/users/TEST123")
    RESPONSE_STATUS=${GET_USER_RESPONSE: -3}
    print_result "/users/TEST123 (Get)" "GET" $RESPONSE_STATUS 200

    # Test 3: Get User Risk Score
    GET_RISK_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/users/TEST123/risk")
    RESPONSE_STATUS=${GET_RISK_RESPONSE: -3}
    print_result "/users/TEST123/risk (Get Risk)" "GET" $RESPONSE_STATUS 200

    # Test 4: List Users
    LIST_USERS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/users/")
    RESPONSE_STATUS=${LIST_USERS_RESPONSE: -3}
    print_result "/users/ (List)" "GET" $RESPONSE_STATUS 200

    # Test 5: Update User
    UPDATE_USER_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$BASE_URL/users/TEST123" \
        -H "Content-Type: application/json" \
        -d '{"name": "Updated User", "passport_string": "TEST123", "ref_score": 10}')
    RESPONSE_STATUS=${UPDATE_USER_RESPONSE: -3}
    print_result "/users/TEST123 (Update)" "PUT" $RESPONSE_STATUS 200

    # Test 6: Create Company
    echo -e "\n${BLUE}Testing Company Endpoints:${NC}"
    CREATE_COMPANY_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/companies/" \
        -H "Content-Type: application/json" \
        -d '{"name": "Test Company", "id": "COMP123", "industry": "Technology"}')
    RESPONSE_STATUS=${CREATE_COMPANY_RESPONSE: -3}
    print_result "/companies/ (Create)" "POST" $RESPONSE_STATUS 200

    # Test 7: Get Company
    GET_COMPANY_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/companies/COMP123")
    RESPONSE_STATUS=${GET_COMPANY_RESPONSE: -3}
    print_result "/companies/COMP123 (Get)" "GET" $RESPONSE_STATUS 200

    # Test 8: List Companies
    LIST_COMPANIES_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/companies/")
    RESPONSE_STATUS=${LIST_COMPANIES_RESPONSE: -3}
    print_result "/companies/ (List)" "GET" $RESPONSE_STATUS 200

    # Test 9: Update Company
    UPDATE_COMPANY_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$BASE_URL/companies/COMP123" \
        -H "Content-Type: application/json" \
        -d '{"name": "Updated Company", "id": "COMP123", "industry": "Technology"}')
    RESPONSE_STATUS=${UPDATE_COMPANY_RESPONSE: -3}
    print_result "/companies/COMP123 (Update)" "PUT" $RESPONSE_STATUS 200

    # Test 10: Create Breach Type
    echo -e "\n${BLUE}Testing Breach Type Endpoints:${NC}"
    CREATE_BREACH_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/breaches/COMP123" \
        -H "Content-Type: application/json" \
        -d '{"breach_type": "DATA_LEAK", "effect_score": 75, "description": "Test breach", "timestamp": "2025-02-23T00:54:48Z"}')
    RESPONSE_STATUS=${CREATE_BREACH_RESPONSE: -3}
    print_result "/breaches/COMP123 (Create)" "POST" $RESPONSE_STATUS 200

    # Test 11: Get Company Breach
    GET_BREACH_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/breaches/COMP123")
    RESPONSE_STATUS=${GET_BREACH_RESPONSE: -3}
    print_result "/breaches/COMP123 (Get)" "GET" $RESPONSE_STATUS 200

    # Test 12: Update Company Breach
    UPDATE_BREACH_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$BASE_URL/breaches/COMP123" \
        -H "Content-Type: application/json" \
        -d '{"breach_type": "DATA_LEAK", "effect_score": 85, "description": "Updated breach", "timestamp": "2025-02-23T00:54:48Z"}')
    RESPONSE_STATUS=${UPDATE_BREACH_RESPONSE: -3}
    print_result "/breaches/COMP123 (Update)" "PUT" $RESPONSE_STATUS 200

    # Test 13: Get High Impact Breaches
    HIGH_IMPACT_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/breaches/high-impact/70")
    RESPONSE_STATUS=${HIGH_IMPACT_RESPONSE: -3}
    print_result "/breaches/high-impact/70 (Get High Impact)" "GET" $RESPONSE_STATUS 200

    # Test 14: Create Breach Event
    echo -e "\n${BLUE}Testing Breach Events Endpoints:${NC}"
    CREATE_EVENT_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/breach-events/" \
        -H "Content-Type: application/json" \
        -d '{
            "user_id": "TEST123",
            "company_id": "COMP123",
            "breach_type": "DATA_LEAK",
            "description": "Test breach event",
            "severity": "HIGH",
            "status": "OPEN",
            "timestamp": "2025-02-23T00:54:48Z"
        }')
    RESPONSE_STATUS=${CREATE_EVENT_RESPONSE: -3}
    print_result "/breach-events/ (Create)" "POST" $RESPONSE_STATUS 200

    # Test 15: Get User Breach Events
    GET_EVENTS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/breach-events/user/TEST123")
    RESPONSE_STATUS=${GET_EVENTS_RESPONSE: -3}
    print_result "/breach-events/user/TEST123 (Get)" "GET" $RESPONSE_STATUS 200

    # Test 16: Update Breach Event
    UPDATE_EVENT_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$BASE_URL/breach-events/1" \
        -H "Content-Type: application/json" \
        -d '{
            "user_id": "TEST123",
            "company_id": "COMP123",
            "breach_type": "DATA_LEAK",
            "description": "Updated breach event",
            "severity": "CRITICAL",
            "status": "IN_PROGRESS",
            "timestamp": "2025-02-23T00:54:48Z"
        }')
    RESPONSE_STATUS=${UPDATE_EVENT_RESPONSE: -3}
    print_result "/breach-events/1 (Update)" "PUT" $RESPONSE_STATUS 200

    # Test 17: Get Company Breach Events
    GET_COMPANY_EVENTS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/breach-events/company/COMP123")
    RESPONSE_STATUS=${GET_COMPANY_EVENTS_RESPONSE: -3}
    print_result "/breach-events/company/COMP123 (Get)" "GET" $RESPONSE_STATUS 200

    # Test 18: Delete Breach Event
    DELETE_EVENT_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/breach-events/1")
    RESPONSE_STATUS=${DELETE_EVENT_RESPONSE: -3}
    print_result "/breach-events/1 (Delete)" "DELETE" $RESPONSE_STATUS 200

    # Test 19: Delete Company Breach
    DELETE_BREACH_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/breaches/COMP123")
    RESPONSE_STATUS=${DELETE_BREACH_RESPONSE: -3}
    print_result "/breaches/COMP123 (Delete)" "DELETE" $RESPONSE_STATUS 200

    # Test 20: Delete Company
    DELETE_COMPANY_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/companies/COMP123")
    RESPONSE_STATUS=${DELETE_COMPANY_RESPONSE: -3}
    print_result "/companies/COMP123 (Delete)" "DELETE" $RESPONSE_STATUS 200

    # Test 21: Delete User
    DELETE_USER_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/users/TEST123")
    RESPONSE_STATUS=${DELETE_USER_RESPONSE: -3}
    print_result "/users/TEST123 (Delete)" "DELETE" $RESPONSE_STATUS 200

    echo -e "\n${BLUE}API Tests Completed${NC}\n"
}

# Main execution
case "$1" in
    "cleanup")
        cleanup_test_data
        ;;
    "setup")
        ensure_test_data
        ;;
    "test")
        ensure_test_data
        run_tests
        ;;
    "full")
        cleanup_test_data
        ensure_test_data
        run_tests
        cleanup_test_data
        ;;
    *)
        echo "Usage: $0 {cleanup|setup|test|full}"
        echo "  cleanup: Remove all test data"
        echo "  setup: Ensure test data exists"
        echo "  test: Run tests only"
        echo "  full: Full cycle (cleanup -> setup -> test -> cleanup)"
        exit 1
        ;;
esac

exit 0
