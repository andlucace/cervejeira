#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/cervejeira"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

sudo mkdir -p /var/www "$APP_DIR" "$BACKEND_DIR" "$FRONTEND_DIR"

sudo rm -rf "$BACKEND_DIR"/* "$FRONTEND_DIR"/*
sudo cp -r "$REPO_DIR/backend/." "$BACKEND_DIR/"

if [ -d "$REPO_DIR/frontend/dist" ]; then
  sudo cp -r "$REPO_DIR/frontend/dist/." "$FRONTEND_DIR/"
else
  cd "$REPO_DIR/frontend"
  npm install --no-audit --no-fund
  npm run build
  sudo rm -rf "$FRONTEND_DIR"/*
  sudo cp -r "$REPO_DIR/frontend/dist/." "$FRONTEND_DIR/"
fi

sudo apt-get update
sudo apt-get install -y python3-pip python3-venv nginx nodejs npm

sudo python3 -m venv "$APP_DIR/venv"
sudo "$APP_DIR/venv/bin/pip" install --upgrade pip
sudo "$APP_DIR/venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"

sudo chown -R www-data:www-data "$APP_DIR"
sudo chmod -R 755 "$APP_DIR"

DOMAIN_NAME="${1:-your-domain.com}"

sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
sudo sed "s/__DOMAIN__/$DOMAIN_NAME/g" "$REPO_DIR/deploy/nginx-cervejeira.conf" > /etc/nginx/sites-available/cervejeira
sudo ln -sf /etc/nginx/sites-available/cervejeira /etc/nginx/sites-enabled/cervejeira
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl reload nginx || service nginx reload || true

sudo sed "s/__DOMAIN__/$DOMAIN_NAME/g" "$REPO_DIR/deploy/cervejeira-api.service" > /etc/systemd/system/cervejeira-api.service
sudo systemctl daemon-reload || true
sudo systemctl enable cervejeira-api || true
sudo systemctl restart cervejeira-api || true

echo "Deployment completed."
echo "Frontend: http://$DOMAIN_NAME:8080/"
echo "API: http://$DOMAIN_NAME:8080/api/"
