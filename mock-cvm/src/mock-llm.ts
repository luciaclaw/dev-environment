/**
 * Mock LLM — returns canned or echoed responses for development.
 *
 * In production, this would call the Python inference bridge.
 */

const CANNED_RESPONSES: Record<string, string> = {
  hello: 'Hello! I\'m Lucia, your privacy-preserving AI agent. All our communication is end-to-end encrypted inside a Trusted Execution Environment. How can I help you today?',
  help: 'I can help you with:\n- Answering questions\n- Managing your calendar and email (coming in Phase 2)\n- Web searches and research (coming in Phase 2)\n- Running skills from the marketplace (coming in Phase 3)\n\nAll processing happens inside a hardware-encrypted enclave. Not even the platform operator can see your data.',
  ping: 'Pong! E2E encryption verified.',
};

export async function generateMockResponse(userMessage: string): Promise<string> {
  const lower = userMessage.toLowerCase().trim();

  // Check for canned responses
  for (const [key, response] of Object.entries(CANNED_RESPONSES)) {
    if (lower.includes(key)) {
      return response;
    }
  }

  // Simulate thinking delay
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

  // Echo with context
  return `[Mock Agent] I received your message: "${userMessage}"\n\nThis is a mock response from the dev environment. In production, this would be processed by the LLM inference TEE via the Python inference bridge.`;
}
