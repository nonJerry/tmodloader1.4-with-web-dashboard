#!/bin/sh
set -e

: "${REDIS_USER:?Need to set REDIS_USER}"
: "${REDIS_PASSWORD:?Need to set REDIS_PASSWORD}"

# Ping Redis
if ! redis-cli --user "$REDIS_USER" --pass "$REDIS_PASSWORD" ping | grep -q PONG; then
    echo "Redis not responding"
    exit 1
fi

exit 0