#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'
BLUE='\033[0;34m'

BASE_URL="http://localhost:8080/api/v1"

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

make_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    response=$(curl -s -w "%{http_code}" \
        --max-time 5 \
        -X "$method" \
        -H "Content-Type: application/json" \
        ${data:+-d "$data"} \
        "$BASE_URL$endpoint" 2>/dev/null)

    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to connect to server${NC}" >&2
        return 1
    fi

    echo "$response"
    return 0
}

cleanup_test_data() {
    echo -e "\n${BLUE}Cleaning up test data...${NC}"
    make_request "DELETE" "/breach-events/user/TEST123" > /dev/null
    make_request "DELETE" "/breaches/COMP123" > /dev/null
    make_request "DELETE" "/companies/COMP123" > /dev/null
    make_request "DELETE" "/users/TEST123" > /dev/null
    echo -e "${GREEN}Cleanup completed${NC}"
}

ensure_test_data() {
    echo -e "\n${BLUE}Ensuring test data exists...${NC}"

    USER_EXISTS=$(make_request "GET" "/users/TEST123")
    if [ $? -eq 0 ] && [ "${USER_EXISTS: -3}" != "200" ]; then
        echo "Creating test user..."
        make_request "POST" "/users/" '{"name": "Test User", "passport_string": "TEST123", "ref_score": 5}' > /dev/null
    fi

    COMPANY_EXISTS=$(make_request "GET" "/companies/COMP123")
    if [ $? -eq 0 ] && [ "${COMPANY_EXISTS: -3}" != "200" ]; then
        echo "Creating test company..."
        make_request "POST" "/companies/" '{"name": "Test Company", "id": "COMP123", "industry": "Technology"}' > /dev/null
    fi

    echo -e "${GREEN}Test data setup completed${NC}"
}

run_tests() {
    echo -e "\n${BLUE}Starting API Tests...${NC}\n"

    # Test 1: Create User
    echo -e "${BLUE}Testing User Endpoints:${NC}"
    CREATE_USER_RESPONSE=$(make_request "POST" "/users/" '{"name": "Test User", "passport_string": "TEST123", "ref_score": 5}')
    if [ $? -eq 0 ]; then
        RESPONSE_STATUS=${CREATE_USER_RESPONSE: -3}
        print_result "/users/ (Create)" "POST" $RESPONSE_STATUS 200
    else
        echo -e "${RED}Failed to connect to server${NC}"
        return 1
    fi

    # Test 2: Get User
    GET_USER_RESPONSE=$(make_request "GET" "/users/TEST123")
    if [ $? -eq 0 ]; then
        RESPONSE_STATUS=${GET_USER_RESPONSE: -3}
        print_result "/users/TEST123 (Get)" "GET" $RESPONSE_STATUS 200
    else
        echo -e "${RED}Failed to connect to server${NC}"
        return 1
    fi

    # Test 3: Get User Risk Score
    GET_RISK_RESPONSE=$(make_request "GET" "/users/risk/TEST123")
    if [ $? -eq 0 ]; then
        RESPONSE_STATUS=${GET_RISK_RESPONSE: -3}
        print_result "/users/risk/TEST123 (Get Risk)" "GET" $RESPONSE_STATUS 200
    else
        echo -e "${RED}Failed to connect to server${NC}"
        return 1
    fi

    # Test 4: List Users
    LIST_USERS_RESPONSE=$(make_request "GET" "/users/")
    if [ $? -eq 0 ]; then
        RESPONSE_STATUS=${LIST_USERS_RESPONSE: -3}
        print_result "/users/ (List)" "GET" $RESPONSE_STATUS 200
    else
        echo -e "${RED}Failed to connect to server${NC}"
        return 1
    fi

    # Test 5: Update User
    UPDATE_USER_RESPONSE=$(make_request "PUT" "/users/TEST123" '{"name": "Updated User", "passport_string": "TEST123", "ref_score": 10}')
    if [ $? -eq 0 ]; then
        RESPONSE_STATUS=${UPDATE_USER_RESPONSE: -3}
        print_result "/users/TEST123 (Update)" "PUT" $RESPONSE_STATUS 200
    else
        echo -e "${RED}Failed to connect to server${NC}"
        return 1
    fi

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
    CREATE_EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/breach-events/" \
        -H "Content-Type: application/json" \
        -d '{
            "user_id": "TEST123",
            "company_id": "COMP123",
            "breach_type": "DATA_LEAK",
            "description": "Test breach event",
            "severity": "HIGH",
            "status": "OPEN"
        }')
    EVENT_ID=$(echo "$CREATE_EVENT_RESPONSE" | jq -r '.data._id')
    CREATE_STATUS=$(curl -s -w "%{http_code}" -o /dev/null -X GET "$BASE_URL/breach-events/$EVENT_ID")
    print_result "/breach-events/ (Create)" "POST" $CREATE_STATUS 200

    # Test 15: Get User Breach Events
    GET_EVENTS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/breach-events/user/TEST123")
    RESPONSE_STATUS=${GET_EVENTS_RESPONSE: -3}
    print_result "/breach-events/user/TEST123 (Get)" "GET" $RESPONSE_STATUS 200

    # Test 16: Update Breach Event
    UPDATE_EVENT_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$BASE_URL/breach-events/$EVENT_ID" \
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
    print_result "/breach-events/$EVENT_ID (Update)" "PUT" $RESPONSE_STATUS 200

    # Test 17: Get Company Breach Events
    GET_COMPANY_EVENTS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/breach-events/company/COMP123")
    RESPONSE_STATUS=${GET_COMPANY_EVENTS_RESPONSE: -3}
    print_result "/breach-events/company/COMP123 (Get)" "GET" $RESPONSE_STATUS 200

    # Test 18: Get Unresolved Breach Events
    GET_UNRESOLVED_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/breach-events/unresolved")
    RESPONSE_STATUS=${GET_UNRESOLVED_RESPONSE: -3}
    print_result "/breach-events/unresolved (Get)" "GET" $RESPONSE_STATUS 200

    # Test 19: Resolve Breach Event
    RESOLVE_EVENT_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/breach-events/$EVENT_ID/resolve?resolution_notes=Issue%20resolved%20and%20verified" \
        -H "Content-Type: application/json")
    RESPONSE_STATUS=${RESOLVE_EVENT_RESPONSE: -3}
    print_result "/breach-events/$EVENT_ID/resolve (Resolve)" "POST" $RESPONSE_STATUS 200

    # Test 20: Delete Breach Event
    DELETE_EVENT_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/breach-events/$EVENT_ID")
    RESPONSE_STATUS=${DELETE_EVENT_RESPONSE: -3}
    print_result "/breach-events/$EVENT_ID (Delete)" "DELETE" $RESPONSE_STATUS 200

    # Test 21: Delete Company Breach
    DELETE_BREACH_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/breaches/COMP123")
    RESPONSE_STATUS=${DELETE_BREACH_RESPONSE: -3}
    print_result "/breaches/COMP123 (Delete)" "DELETE" $RESPONSE_STATUS 200

    # Test User-Info Device Endpoints
    echo -e "\n${BLUE}Testing User-Info Device Endpoints:${NC}"

    # Test 22: Add Device
    ADD_DEVICE_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/user-info/devices" \
        -H "Content-Type: application/json" \
        -d '{
            "user_id": "TEST123",
            "ip_address": "192.168.1.1",
            "device_name": "Test Device",
            "mac_address": "00:11:22:33:44:55",
            "is_vpn": false,
            "is_proxy": false,
            "is_datacenter": false,
            "is_tor": false,
            "risk_score": 0.0,
            "country_code": "US",
            "city": "San Francisco"
        }')
    RESPONSE_STATUS=${ADD_DEVICE_RESPONSE: -3}
    DEVICE_ID=$(echo "${ADD_DEVICE_RESPONSE%???}" | jq -r '.device_id // "test_device_001"')
    print_result "/user-info/devices (Add)" "POST" $RESPONSE_STATUS 200

    # Test 23: Get User Devices
    GET_USER_DEVICES_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/user-info/devices/TEST123")
    RESPONSE_STATUS=${GET_USER_DEVICES_RESPONSE: -3}
    print_result "/user-info/devices/TEST123 (Get)" "GET" $RESPONSE_STATUS 200

    # Test 24: Get Device By Id
    GET_DEVICE_BY_ID_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/user-info/devices/TEST123")
    RESPONSE_STATUS=${GET_DEVICE_BY_ID_RESPONSE: -3}
    print_result "/user-info/devices/TEST123 (Get)" "GET" $RESPONSE_STATUS 200

    # Test 25: Get Suspicious Devices
    GET_SUSPICIOUS_DEVICES_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/user-info/devices/suspicious")
    RESPONSE_STATUS=${GET_SUSPICIOUS_DEVICES_RESPONSE: -3}
    print_result "/user-info/devices/suspicious (Get)" "GET" $RESPONSE_STATUS 200

    # Test 26: Get Shared Devices
    GET_SHARED_DEVICES_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/user-info/devices/shared")
    RESPONSE_STATUS=${GET_SHARED_DEVICES_RESPONSE: -3}
    print_result "/user-info/devices/shared (Get)" "GET" $RESPONSE_STATUS 200

    # Test 27: Get User Risk Score
    GET_RISK_SCORE_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/user-info/risk-score/TEST123" \
        -H "Content-Type: application/json")
    RESPONSE_STATUS=${GET_RISK_SCORE_RESPONSE: -3}
    print_result "/user-info/risk-score/TEST123 (Get)" "GET" $RESPONSE_STATUS 200

    # Test 28: Delete User Devices
    DELETE_USER_DEVICES_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/user-info/devices/TEST123" \
        -H "Content-Type: application/json")
    RESPONSE_STATUS=${DELETE_USER_DEVICES_RESPONSE: -3}
    print_result "/user-info/devices/TEST123 (Delete)" "DELETE" $RESPONSE_STATUS 200

    # Ensure we wait a bit for device deletion to complete
    sleep 1

    # Test 29: Delete User
    DELETE_USER_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/users/TEST123")
    RESPONSE_STATUS=${DELETE_USER_RESPONSE: -3}
    print_result "/users/TEST123 (Delete)" "DELETE" $RESPONSE_STATUS 200
    RESPONSE_STATUS=${DELETE_BREACH_RESPONSE: -3}
    print_result "/breaches/COMP123 (Delete)" "DELETE" $RESPONSE_STATUS 200

    # Test 20: Delete Company
    DELETE_COMPANY_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/companies/COMP123")
    RESPONSE_STATUS=${DELETE_COMPANY_RESPONSE: -3}
    print_result "/companies/COMP123 (Delete)" "DELETE" $RESPONSE_STATUS 200


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


