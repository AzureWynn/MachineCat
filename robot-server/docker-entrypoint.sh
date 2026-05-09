#!/bin/sh

echo "🌱 Waiting for MongoDB to be ready..."
sleep 5

echo " Seeding database..."
npm run seed

echo "🚀 Starting server..."
exec node src/infrastructure/web/server.http.js
