# dev-environment

Local development environment for the Lucia privacy-preserving AI agent platform.

## Services

| Service | Port | Description |
|---------|------|-------------|
| **mock-cvm** | 8080 | WebSocket server with E2E ECDH handshake and mock LLM responses |
| **mock-attestation** | 8081 | Fake TDX attestation reports for Trust Dashboard development |
| **pwa-dev** | 5173 | SvelteKit dev server with hot reload |

## Quick Start

### With Docker Compose

```bash
docker compose up
```

Open http://localhost:5173 to use the PWA.

### Without Docker (local Node.js)

In three terminals:

```bash
# Terminal 1: Mock CVM
cd mock-cvm && npm install && npx tsx src/index.ts

# Terminal 2: Mock Attestation
cd mock-attestation && npm install && npx tsx src/index.ts

# Terminal 3: PWA Client
cd ../pwa-client && npm install && npm run dev
```

## Architecture

```
Browser (localhost:5173)
  └── PWA Client (SvelteKit)
        └── E2E Encrypted WebSocket ──→ Mock CVM (localhost:8080)
                                            └── Mock LLM responses

Trust Dashboard ──→ Mock Attestation (localhost:8081)
```

The mock CVM performs a real ECDH P-256 key exchange with the PWA and encrypts all subsequent messages with AES-256-GCM — identical to production, but with mock attestation reports instead of real Intel TDX quotes.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
