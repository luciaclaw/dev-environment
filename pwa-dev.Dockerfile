FROM node:22-slim

WORKDIR /app

# Copy and build protocol dependency (context is repos/)
COPY platform-protocol /deps/platform-protocol
WORKDIR /deps/platform-protocol
RUN npm install && npm run build

# Copy PWA client source
WORKDIR /app
COPY pwa-client/package.json pwa-client/svelte.config.js pwa-client/vite.config.ts pwa-client/tsconfig.json ./
# Rewrite protocol dep to point to container path
RUN node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));p.dependencies['@luciaclaw/protocol']='file:/deps/platform-protocol';require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))"
RUN npm install --engine-strict=false
COPY pwa-client/src ./src
COPY pwa-client/static ./static

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
