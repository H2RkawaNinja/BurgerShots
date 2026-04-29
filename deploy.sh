#!/bin/bash
# deploy.sh — Auf dem VPS ausführen nach jedem git pull
set -e

APP_DIR="/var/www/burgershot"

echo "==> Wechsel ins App-Verzeichnis..."
cd "$APP_DIR"

echo "==> Neuste Änderungen holen..."
git pull origin main

echo "==> Server-Dependencies installieren..."
cd server
npm install --omit=dev
cd ..

echo "==> Frontend bauen..."
cd client
npm install
npm run build
cd ..

echo "==> PM2 neustarten..."
pm2 reload ecosystem.config.js --update-env

echo "==> Deploy abgeschlossen!"
pm2 status
