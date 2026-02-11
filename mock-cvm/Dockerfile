FROM node:22-slim

WORKDIR /app

# Copy protocol dependency first
COPY ../platform-protocol /deps/platform-protocol
WORKDIR /deps/platform-protocol
RUN npm install && npm run build

# Copy mock-cvm
WORKDIR /app
COPY mock-cvm/package.json mock-cvm/tsconfig.json ./
RUN npm install
COPY mock-cvm/src ./src
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/index.js"]
