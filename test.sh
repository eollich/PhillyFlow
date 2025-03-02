#!/bin/bash

URL="localhost:5858/geocode"

# JSON payload with address
JSON_PAYLOAD=$(
    cat <<EOF
{
  "address": "Center City, Philadelphia"
}
EOF
)

# Make the POST request
response=$(curl -s -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD")

# Output response
echo "Response from server:"
echo "$response"
