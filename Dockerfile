# Use official Node.js 24 LTS image
FROM node:24-alpine

# Create app directory
WORKDIR /app

# Install app dependencies first (better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Run the app
CMD ["node", "index.js"]