/**
 * Server-side E2E ECDH handshake for mock CVM.
 *
 * In Node.js we use the built-in crypto.subtle (Web Crypto API).
 */

import type { WebSocket } from 'ws';
import type {
  MessageEnvelope,
  HandshakeInitPayload,
  HandshakeCompletePayload,
} from '@luciaclaw/protocol';
import { PROTOCOL_VERSION } from '@luciaclaw/protocol';
import { routeMessage } from './router.js';

// Polyfill crypto for older Node.js versions
const subtle = globalThis.crypto.subtle;

export async function handleConnection(ws: WebSocket): Promise<void> {
  let sessionKey: CryptoKey | null = null;

  ws.on('message', async (data) => {
    try {
      const raw = typeof data === 'string' ? data : data.toString('utf-8');
      const envelope: MessageEnvelope = JSON.parse(raw);

      if (envelope.type === 'handshake.init') {
        // Step 1: Received client public key
        const { clientPublicKey } = envelope.payload as HandshakeInitPayload;

        // Generate server key pair
        const serverKeyPair = await subtle.generateKey(
          { name: 'ECDH', namedCurve: 'P-256' },
          false,
          ['deriveKey', 'deriveBits']
        );

        const serverPubExported = await subtle.exportKey('spki', serverKeyPair.publicKey);
        const serverPubBase64 = arrayBufferToBase64(serverPubExported);

        // Import client public key
        const clientPubKey = await subtle.importKey(
          'spki',
          base64ToArrayBuffer(clientPublicKey),
          { name: 'ECDH', namedCurve: 'P-256' },
          true,
          []
        );

        // Derive shared secret
        sessionKey = await subtle.deriveKey(
          { name: 'ECDH', public: clientPubKey },
          serverKeyPair.privateKey,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        );

        // Step 2: Send server public key + mock attestation
        const response: MessageEnvelope = {
          id: crypto.randomUUID(),
          type: 'handshake.response',
          timestamp: Date.now(),
          payload: {
            serverPublicKey: serverPubBase64,
            protocolVersion: PROTOCOL_VERSION,
            attestation: {
              tdx: {
                quote: 'MOCK_TDX_QUOTE_BASE64',
                measurements: {
                  mrtd: '0'.repeat(96),
                  rtmr0: '0'.repeat(96),
                  rtmr1: '0'.repeat(96),
                  rtmr2: '0'.repeat(96),
                  rtmr3: '0'.repeat(96),
                },
              },
              generatedAt: Date.now(),
              imageHash: 'sha256:mock_image_hash_for_dev_environment',
              verificationUrl: 'http://localhost:8081/verify',
            },
          },
        };
        ws.send(JSON.stringify(response));
        console.log('[mock-cvm] Handshake response sent');
        return;
      }

      if (envelope.type === 'encrypted' && sessionKey) {
        // Decrypt incoming message
        const { iv, ciphertext } = envelope.payload as { iv: string; ciphertext: string };
        const ivBuffer = base64ToArrayBuffer(iv);
        const ctBuffer = base64ToArrayBuffer(ciphertext);
        const decrypted = await subtle.decrypt(
          { name: 'AES-GCM', iv: ivBuffer },
          sessionKey,
          ctBuffer
        );
        const inner: MessageEnvelope = JSON.parse(new TextDecoder().decode(decrypted));

        if (inner.type === 'handshake.complete') {
          const payload = inner.payload as HandshakeCompletePayload;
          if (payload.status === 'ok') {
            console.log('[mock-cvm] Handshake complete — E2E channel established');
          }
          return;
        }

        // Route decrypted message
        const response = await routeMessage(inner);
        if (response) {
          await sendEncrypted(ws, sessionKey, response);
        }
        return;
      }

      console.log('[mock-cvm] Unhandled message type:', envelope.type);
    } catch (err) {
      console.error('[mock-cvm] Error handling message:', err);
    }
  });

  ws.on('close', () => {
    console.log('[mock-cvm] Client disconnected');
    sessionKey = null;
  });
}

async function sendEncrypted(ws: WebSocket, key: CryptoKey, message: MessageEnvelope): Promise<void> {
  const plaintext = JSON.stringify(message);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );

  const envelope: MessageEnvelope = {
    id: crypto.randomUUID(),
    type: 'encrypted',
    timestamp: Date.now(),
    payload: {
      iv: arrayBufferToBase64(iv.buffer),
      ciphertext: arrayBufferToBase64(ciphertext),
    },
  };
  ws.send(JSON.stringify(envelope));
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64');
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const buf = Buffer.from(base64, 'base64');
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}
