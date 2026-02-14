FROM node:22-slim

WORKDIR /app

# Copy and build protocol dependency (context is repos/)
COPY platform-protocol /deps/platform-protocol
WORKDIR /deps/platform-protocol
RUN npm install && npm run build

# Copy mock-cvm source (paths relative to repos/ context)
WORKDIR /app
COPY dev-environment/mock-cvm/package.json dev-environment/mock-cvm/tsconfig.json ./
# Rewrite protocol dep to point to container path
RUN node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));p.dependencies['@luciaclaw/protocol']='file:/deps/platform-protocol';require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))"
RUN npm install
COPY dev-environment/mock-cvm/src ./src
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/index.js"]
