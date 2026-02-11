FROM node:22-slim

WORKDIR /app

COPY mock-attestation/package.json mock-attestation/tsconfig.json ./
RUN npm install
COPY mock-attestation/src ./src
RUN npm run build

EXPOSE 8081
CMD ["node", "dist/index.js"]
