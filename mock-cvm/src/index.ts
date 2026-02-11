/**
 * Mock CVM — WebSocket server mimicking the agent orchestrator.
 * Handles E2E handshake, routes messages, calls mock LLM.
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import { handleConnection } from './handshake.js';

const PORT = parseInt(process.env.PORT || '8080', 10);

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'mock-cvm' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('[mock-cvm] Client connected');
  handleConnection(ws);
});

server.listen(PORT, () => {
  console.log(`[mock-cvm] Listening on port ${PORT}`);
  console.log(`[mock-cvm] WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`[mock-cvm] Health: http://localhost:${PORT}/health`);
});
