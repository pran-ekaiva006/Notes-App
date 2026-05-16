#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Notes API — Automated Test Suite
# Run: bash tests/api.test.sh
# Requires: curl, python3
# ─────────────────────────────────────────────────────────────────

BASE_URL="${BASE_URL:-http://localhost:5000}"
PASS=0
FAIL=0
TOTAL=0

# Unique emails per run to avoid duplicate conflicts
RUN_ID=$(date +%s)
USER1_EMAIL="testuser1_${RUN_ID}@test.com"
USER2_EMAIL="testuser2_${RUN_ID}@test.com"
PASSWORD="secure123"

# ── Helper ───────────────────────────────────────────────────────
assert() {
  TOTAL=$((TOTAL + 1))
  local test_name="$1"
  local expected_code="$2"
  local actual_code="$3"
  local body="$4"

  if [ "$actual_code" -eq "$expected_code" ]; then
    echo "  ✅ PASS: $test_name (HTTP $actual_code)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAIL: $test_name — expected $expected_code, got $actual_code"
    echo "     Body: $body"
    FAIL=$((FAIL + 1))
  fi
}

# ── AUTH TESTS ───────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "  🔐  AUTH TESTS"
echo "═══════════════════════════════════════════"

# Register User 1
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER1_EMAIL\",\"password\":\"$PASSWORD\"}")
assert "Register User 1" 201 "$RESP" "$(cat /tmp/body.txt)"

# Register User 2
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER2_EMAIL\",\"password\":\"$PASSWORD\"}")
assert "Register User 2" 201 "$RESP" "$(cat /tmp/body.txt)"

# Register duplicate
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER1_EMAIL\",\"password\":\"$PASSWORD\"}")
assert "Register duplicate email → 400" 400 "$RESP" "$(cat /tmp/body.txt)"

# Register missing fields
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" -d '{}')
assert "Register missing fields → 400" 400 "$RESP" "$(cat /tmp/body.txt)"

# Register short password
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" -d '{"email":"x@y.com","password":"123"}')
assert "Register short password → 400" 400 "$RESP" "$(cat /tmp/body.txt)"

# Login User 1
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER1_EMAIL\",\"password\":\"$PASSWORD\"}")
assert "Login User 1" 200 "$RESP" "$(cat /tmp/body.txt)"
TOKEN1=$(python3 -c "import json; print(json.load(open('/tmp/body.txt'))['access_token'])" 2>/dev/null)

# Login User 2
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER2_EMAIL\",\"password\":\"$PASSWORD\"}")
assert "Login User 2" 200 "$RESP" "$(cat /tmp/body.txt)"
TOKEN2=$(python3 -c "import json; print(json.load(open('/tmp/body.txt'))['access_token'])" 2>/dev/null)

# Login wrong password
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER1_EMAIL\",\"password\":\"wrongpass\"}")
assert "Login wrong password → 401" 401 "$RESP" "$(cat /tmp/body.txt)"

# Login non-existent user
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" -d '{"email":"nobody@test.com","password":"123456"}')
assert "Login non-existent user → 401" 401 "$RESP" "$(cat /tmp/body.txt)"

# ── NOTES TESTS ──────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "  📝  NOTES CRUD TESTS"
echo "═══════════════════════════════════════════"

# Create note — no auth
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" -d '{"title":"T","content":"C"}')
assert "Create note without auth → 401" 401 "$RESP" "$(cat /tmp/body.txt)"

# Create note — missing fields
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN1" -d '{}')
assert "Create note missing fields → 400" 400 "$RESP" "$(cat /tmp/body.txt)"

# Create note — empty strings
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN1" \
  -d '{"title":"  ","content":"  "}')
assert "Create note empty strings → 400" 400 "$RESP" "$(cat /tmp/body.txt)"

# Create note — success
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN1" \
  -d '{"title":"First Note","content":"Hello world"}')
assert "Create note → 201" 201 "$RESP" "$(cat /tmp/body.txt)"
NOTE_ID=$(python3 -c "import json; print(json.load(open('/tmp/body.txt'))['_id'])" 2>/dev/null)

# Create more notes for pagination
for i in $(seq 2 6); do
  curl -s -X POST "$BASE_URL/notes" \
    -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN1" \
    -d "{\"title\":\"Note $i\",\"content\":\"Content $i\"}" > /dev/null
done

# Create pinned note
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN1" \
  -d '{"title":"Pinned","content":"Important","isPinned":true}')
assert "Create pinned note → 201" 201 "$RESP" "$(cat /tmp/body.txt)"

# GET all notes
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/notes" \
  -H "Authorization: Bearer $TOKEN1")
assert "GET /notes → 200" 200 "$RESP" "$(cat /tmp/body.txt)"

# Verify pinned note is first
FIRST_PINNED=$(python3 -c "import json; d=json.load(open('/tmp/body.txt')); print(d['notes'][0]['isPinned'])" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$FIRST_PINNED" = "True" ]; then
  echo "  ✅ PASS: Pinned note appears first"
  PASS=$((PASS + 1))
else
  echo "  ❌ FAIL: Pinned note NOT first"
  FAIL=$((FAIL + 1))
fi

# Pagination
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/notes?page=1&limit=3" \
  -H "Authorization: Bearer $TOKEN1")
assert "GET /notes?page=1&limit=3 → 200" 200 "$RESP" "$(cat /tmp/body.txt)"
PAGE_NOTES=$(python3 -c "import json; print(len(json.load(open('/tmp/body.txt'))['notes']))" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$PAGE_NOTES" = "3" ]; then
  echo "  ✅ PASS: Pagination returns 3 notes"
  PASS=$((PASS + 1))
else
  echo "  ❌ FAIL: Expected 3 notes, got $PAGE_NOTES"
  FAIL=$((FAIL + 1))
fi

# GET by ID
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN1")
assert "GET /notes/:id → 200" 200 "$RESP" "$(cat /tmp/body.txt)"

# GET by ID — other user can't access
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN2")
assert "GET /notes/:id other user → 403" 403 "$RESP" "$(cat /tmp/body.txt)"

# Update note
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X PUT "$BASE_URL/notes/$NOTE_ID" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN1" \
  -d '{"title":"Updated Title","content":"Updated content"}')
assert "PUT /notes/:id → 200" 200 "$RESP" "$(cat /tmp/body.txt)"

# Update — other user can't update
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X PUT "$BASE_URL/notes/$NOTE_ID" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN2" \
  -d '{"title":"Hacked"}')
assert "PUT /notes/:id other user → 403" 403 "$RESP" "$(cat /tmp/body.txt)"

# Share note
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE_URL/notes/$NOTE_ID/share" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN1" \
  -d "{\"share_with_email\":\"$USER2_EMAIL\"}")
assert "Share note → 200" 200 "$RESP" "$(cat /tmp/body.txt)"

# After sharing — User 2 can read
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN2")
assert "Shared user can read → 200" 200 "$RESP" "$(cat /tmp/body.txt)"

# Delete — other user can't delete
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X DELETE "$BASE_URL/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN2")
assert "DELETE other user → 403" 403 "$RESP" "$(cat /tmp/body.txt)"

# Delete — owner can delete
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X DELETE "$BASE_URL/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN1")
assert "DELETE /notes/:id → 204" 204 "$RESP" ""

# GET deleted note
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN1")
assert "GET deleted note → 404" 404 "$RESP" "$(cat /tmp/body.txt)"

# Empty notes for user 2
RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/notes" \
  -H "Authorization: Bearer $TOKEN2")
assert "User 2 GET /notes → 200" 200 "$RESP" "$(cat /tmp/body.txt)"

# ── META TESTS ───────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "  📋  META TESTS"
echo "═══════════════════════════════════════════"

RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/")
assert "GET / health check → 200" 200 "$RESP" "$(cat /tmp/body.txt)"

RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/about")
assert "GET /about → 200" 200 "$RESP" "$(cat /tmp/body.txt)"

RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/openapi.json")
assert "GET /openapi.json → 200" 200 "$RESP" "$(cat /tmp/body.txt)"

RESP=$(curl -s -o /tmp/body.txt -w "%{http_code}" "$BASE_URL/nonexistent")
assert "GET /nonexistent → 404" 404 "$RESP" "$(cat /tmp/body.txt)"

# ── SUMMARY ──────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "  📊  RESULTS: $PASS/$TOTAL passed, $FAIL failed"
echo "═══════════════════════════════════════════"
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
