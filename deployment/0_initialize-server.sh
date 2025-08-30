#!/bin/bash
set -e

# Setup Script for Deployment (Ubuntu 24.04)

echo "Setting up server instance for Deployment..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install base tools
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common unzip

# Install Docker
echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose (standalone binary)
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Bun
echo "Installing Bun..."
curl -fsSL https://bun.sh/install | bash
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc

# Install NGINX
echo "Installing NGINX..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install Certbot
echo "Installing Certbot..."
sudo apt install -y snapd
sudo snap install core
sudo snap refresh core
# Ensure any apt certbot is not installed to avoid conflicts
sudo apt remove -y certbot || true
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# Configure firewall (UFW)
echo "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'   # opens 80 & 443
sudo ufw --force enable

# Create systemd service for auto-start (Docker Compose)
# Uses /home/$USER/deployment as working directory by default.
echo "Creating systemd service..."
sudo tee /etc/systemd/system/deployment.service > /dev/null <<EOF
[Unit]
Description=Deployment Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/$USER/trackyrs
ExecStart=/usr/local/bin/docker compose --file deployment/production-compose.yaml up -d
ExecStop=/usr/local/bin/docker compose --file deployment/production-compose.yaml down
User=$USER
Group=docker

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable deployment.service

# Install fail2ban for security
echo "Installing fail2ban..."
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure log rotation for Docker container logs
echo "Setting up log rotation..."
sudo tee /etc/logrotate.d/docker > /dev/null <<'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

echo "Deployment setup completed successfully!"
echo "Please reboot the instance to ensure all changes take effect."
echo "When your NGINX vhosts are in place, get certs with:"
echo "  sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo "Or for a dry run: sudo certbot renew --dry-run"
echo "You may now proceed cloning the repo, preparing the database and building/running the containers"

# docker compose --file deployment/production-compose.yaml up -d (it is required to create a .env in that directory with all ENV variables)