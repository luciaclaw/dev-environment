FROM node:22-slim

WORKDIR /app

# Copy protocol dependency
COPY platform-protocol /deps/platform-protocol
WORKDIR /deps/platform-protocol
RUN npm install && npm run build

# Copy PWA client
WORKDIR /app
COPY pwa-client/package.json pwa-client/svelte.config.js pwa-client/vite.config.ts pwa-client/tsconfig.json ./
RUN npm install --engine-strict=false
COPY pwa-client/src ./src
COPY pwa-client/static ./static

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
