#!/bin/bash

# Exit on error
set -e

# Install Docker if not installed
if ! [ -x "$(command -v docker)" ]; then
  echo 'Installing Docker...'
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  echo 'Please log out and log back in to use Docker without sudo.'
  exit 1
fi

# Install Docker Compose if not installed
if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Installing Docker Compose...'
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo 'Creating .env file...'
  echo 'DATABASE_URL=mongodb://username:password@mongodb:27017/ecommerce?authSource=admin' > .env
  echo 'MONGO_USERNAME=username' >> .env
  echo 'MONGO_PASSWORD=password' >> .env
  echo 'JWT_SECRET=your_jwt_secret' >> .env
  echo 'Please update the .env file with your actual credentials.'
fi

# Build and start the application
echo 'Building and starting the application...'
docker-compose up -d --build

echo 'Deployment complete!'
echo 'Your application should now be running at http://your-server-ip:5000'