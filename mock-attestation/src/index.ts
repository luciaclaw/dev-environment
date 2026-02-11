/**
 * Mock Attestation Service — returns fake TDX attestation reports.
 * Used for Trust Dashboard development without real TEE hardware.
 */

import express from 'express';

const PORT = parseInt(process.env.PORT || '8081', 10);
const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mock-attestation' });
});

app.get('/verify', (_req, res) => {
  res.json({
    verified: true,
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
        collateral: null,
      },
      generatedAt: Date.now(),
      imageHash: 'sha256:mock_image_hash_for_dev_environment',
    },
    message: 'This is a mock attestation report for local development. In production, this would contain a real Intel TDX quote verified by the PCCS server.',
  });
});

app.post('/attest', (_req, res) => {
  // Simulate attestation generation
  res.json({
    report: {
      tdx: {
        quote: 'MOCK_TDX_QUOTE_BASE64_GENERATED_' + Date.now(),
        measurements: {
          mrtd: crypto.randomUUID().replace(/-/g, '').repeat(3),
          rtmr0: crypto.randomUUID().replace(/-/g, '').repeat(3),
          rtmr1: crypto.randomUUID().replace(/-/g, '').repeat(3),
          rtmr2: crypto.randomUUID().replace(/-/g, '').repeat(3),
          rtmr3: crypto.randomUUID().replace(/-/g, '').repeat(3),
        },
      },
      generatedAt: Date.now(),
      imageHash: 'sha256:mock_image_hash_for_dev_environment',
    },
  });
});

app.listen(PORT, () => {
  console.log(`[mock-attestation] Listening on port ${PORT}`);
  console.log(`[mock-attestation] Verify: http://localhost:${PORT}/verify`);
  console.log(`[mock-attestation] Health: http://localhost:${PORT}/health`);
});
