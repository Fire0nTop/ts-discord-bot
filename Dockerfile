# Use Node.js 20 base image
FROM node:20

# Create working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the bot source code
COPY . .

# compile to JavaScript
RUN npm run build
# run index.js
CMD ["node", "dist/index.js"]
