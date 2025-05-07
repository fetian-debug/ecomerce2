# Use Node.js LTS version as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]