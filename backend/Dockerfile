# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeapp -u 1001

# Change ownership of the app directory
RUN chown -R nodeapp:nodejs /app

# Switch to non-root user
USER nodeapp

# Expose port
EXPOSE 3002

# Start the application
CMD ["npm", "start"]
