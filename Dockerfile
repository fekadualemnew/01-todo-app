# Use an official, lightweight Node base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for better caching (layering best practice)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Expose the port your server uses
EXPOSE 3000

# Command to run your app, matching what you typed in the terminal
CMD ["node", "server.js"]