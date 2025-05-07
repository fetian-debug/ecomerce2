# Deployment Guide for ShopEase E-commerce Application on Hostinger VPS

This guide will walk you through the process of deploying your e-commerce application on a Hostinger VPS using Docker.

## Prerequisites

- A Hostinger VPS with SSH access
- A domain name pointing to your VPS IP address
- Basic knowledge of Linux commands

## Step 1: Set Up Your Hostinger VPS

1. Log in to your Hostinger control panel
2. Navigate to the VPS section and ensure your server is running
3. Note down your server's IP address
4. Make sure your domain's DNS records point to your VPS IP address

## Step 2: Connect to Your VPS via SSH

```bash
ssh root@your-server-ip
```

Replace `your-server-ip` with the IP address of your VPS.

## Step 3: Install Required Packages

Update your system and install Git:

```bash
apt update && apt upgrade -y
apt install git curl -y
```

## Step 4: Clone Your Repository

```bash
mkdir -p /var/www
cd /var/www
git clone YOUR_REPOSITORY_URL shopease
cd shopease
```

Replace `YOUR_REPOSITORY_URL` with the URL to your GitHub repository.

## Step 5: Create Environment Variables

Create a `.env` file with your database credentials and other environment variables:

```bash
cat > .env << EOF
# MongoDB Credentials
MONGO_USERNAME=yourusername
MONGO_PASSWORD=yourpassword
DATABASE_URL=mongodb://yourusername:yourpassword@mongodb:27017/ecommerce?authSource=admin

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Other environment variables
NODE_ENV=production
EOF
```

Make sure to replace the placeholders with secure credentials.

## Step 6: Make Scripts Executable

```bash
chmod +x deploy.sh init-ssl.sh
```

## Step 7: Install Docker and Docker Compose

The `deploy.sh` script will install Docker and Docker Compose for you if they're not already installed. Run:

```bash
./deploy.sh
```

If prompted to log out and log back in to use Docker without sudo, do so:

```bash
exit
ssh root@your-server-ip
cd /var/www/shopease
```

## Step 8: Deploy with Docker Compose

For production deployment with Nginx and SSL:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

This will start all your services: the Node.js application, MongoDB, Nginx, and Certbot.

## Step 9: Set Up SSL Certificates

To set up SSL certificates for your domain:

```bash
./init-ssl.sh your-domain.com your-email@example.com
```

Replace `your-domain.com` with your actual domain name and `your-email@example.com` with your email address.

## Step 10: Verify Deployment

1. Open a web browser and navigate to your domain (https://your-domain.com)
2. Verify that your e-commerce application is running correctly
3. Test the various features like browsing products, adding to cart, etc.

## Monitoring and Maintenance

### View Logs

```bash
# View logs for the app container
docker-compose -f docker-compose.prod.yml logs -f app

# View logs for the MongoDB container
docker-compose -f docker-compose.prod.yml logs -f mongodb

# View logs for the Nginx container
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart a specific service
docker-compose -f docker-compose.prod.yml restart app
```

### Update the Application

When you need to update your application:

1. Pull the latest changes from your repository:
   ```bash
   git pull
   ```

2. Rebuild and restart the containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## Backing Up MongoDB Data

Create a backup script:

```bash
cat > backup-mongo.sh << EOF
#!/bin/bash
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"

mkdir -p \$BACKUP_DIR

docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump --username=\$MONGO_USERNAME --password=\$MONGO_PASSWORD --authenticationDatabase=admin --db=ecommerce --out=/dump

docker cp \$(docker-compose -f docker-compose.prod.yml ps -q mongodb):/dump/ecommerce \$BACKUP_DIR/ecommerce_\$TIMESTAMP

echo "Backup completed: \$BACKUP_DIR/ecommerce_\$TIMESTAMP"
EOF

chmod +x backup-mongo.sh
```

Schedule the backup using cron:

```bash
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/shopease/backup-mongo.sh") | crontab -
```

This will run a backup every day at 2:00 AM.

## Troubleshooting

### Container Doesn't Start

Check the logs:

```bash
docker-compose -f docker-compose.prod.yml logs app
```

### Database Connection Issues

Verify your MongoDB connection string in the `.env` file and ensure the MongoDB container is running:

```bash
docker-compose -f docker-compose.prod.yml ps
```

### SSL Certificate Issues

Check the Certbot logs:

```bash
docker-compose -f docker-compose.prod.yml logs certbot
```

If necessary, recreate the certificates:

```bash
./init-ssl.sh your-domain.com your-email@example.com
```

## Conclusion

Your e-commerce application should now be running on your Hostinger VPS with Docker. This setup includes:

- Node.js application containerized with Docker
- MongoDB database for data storage
- Nginx as a reverse proxy
- SSL certificates for secure HTTPS connections
- Automated backups

For additional support, visit the Hostinger help center or contact their customer support.