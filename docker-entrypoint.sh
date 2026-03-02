#!/bin/sh
set -e

echo "Running prisma db push..."
./node_modules/.bin/prisma db push --skip-generate

echo "Starting server..."
exec node server.js
