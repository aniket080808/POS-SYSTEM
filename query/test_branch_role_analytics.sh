#!/bin/bash
# Test that BRANCH_CASHIER, BRANCH_MANAGER, BRANCH_ADMIN cannot access store analytics
# while STORE_ADMIN and STORE_MANAGER can.
#
# Usage: ./test_branch_role_analytics.sh
# Requires: running backend on localhost:5000, valid JWTs in env vars

BASE_URL="http://localhost:5000"
STORE_ADMIN_ID=1

echo "=== Branch Role Analytics Access Test ==="
echo ""

# Positive controls: legitimate store roles should get 200
if [ -n "$STORE_ADMIN_JWT" ]; then
    echo "Testing STORE_ADMIN (expect 200)..."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $STORE_ADMIN_JWT" \
        "$BASE_URL/api/store/analytics/$STORE_ADMIN_ID/overview")
    echo "  Status: $STATUS"
    if [ "$STATUS" -ne 200 ]; then
        echo "  FAIL: STORE_ADMIN should get 200"
        exit 1
    fi
else
    echo "SKIP: STORE_ADMIN_JWT not set"
fi

if [ -n "$STORE_MANAGER_JWT" ]; then
    echo "Testing STORE_MANAGER (expect 200)..."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $STORE_MANAGER_JWT" \
        "$BASE_URL/api/store/analytics/$STORE_ADMIN_ID/overview")
    echo "  Status: $STATUS"
    if [ "$STATUS" -ne 200 ]; then
        echo "  FAIL: STORE_MANAGER should get 200"
        exit 1
    fi
else
    echo "SKIP: STORE_MANAGER_JWT not set"
fi

# Negative tests: branch roles should get 403
FAIL=0

for ROLE in BRANCH_CASHIER BRANCH_MANAGER BRANCH_ADMIN; do
    JWT_VAR="${ROLE}_JWT"
    JWT="${!JWT_VAR}"
    if [ -z "$JWT" ]; then
        echo "SKIP: ${JWT_VAR} not set"
        continue
    fi
    echo "Testing $ROLE (expect 403)..."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $JWT" \
        "$BASE_URL/api/store/analytics/$STORE_ADMIN_ID/overview")
    echo "  Status: $STATUS"
    if [ "$STATUS" -ne 403 ]; then
        echo "  FAIL: $ROLE should get 403, got $STATUS"
        FAIL=1
    fi
done

if [ "$FAIL" -eq 1 ]; then
    echo ""
    echo "RESULT: FAIL"
    exit 1
fi

echo ""
echo "RESULT: PASS"