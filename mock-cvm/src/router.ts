/**
 * Message routing — dispatches decrypted messages to handlers.
 */

import type { MessageEnvelope, ChatMessagePayload, ModelInfo } from '@luciaclaw/protocol';
import { generateMockResponse } from './mock-llm.js';

const MOCK_MODELS: ModelInfo[] = [
  {
    id: 'deepseek/deepseek-chat-v3-0324',
    name: 'DeepSeek Chat V3',
    provider: 'deepseek',
    contextLength: 65536,
    inputPrice: 0.50,
    outputPrice: 1.50,
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'meta-llama',
    contextLength: 131072,
    inputPrice: 0.20,
    outputPrice: 0.30,
  },
  {
    id: 'qwen/qwq-32b',
    name: 'QWQ 32B',
    provider: 'qwen',
    contextLength: 131072,
    inputPrice: 0.20,
    outputPrice: 0.60,
  },
];

let currentModel = MOCK_MODELS[0].id;

export async function routeMessage(msg: MessageEnvelope): Promise<MessageEnvelope | null> {
  switch (msg.type) {
    case 'chat.message': {
      const payload = msg.payload as ChatMessagePayload;
      if (payload.model) {
        currentModel = payload.model;
      }
      console.log(`[mock-cvm] User: ${payload.content} (model: ${currentModel})`);
      const response = await generateMockResponse(payload.content);
      console.log(`[mock-cvm] Agent: ${response}`);
      return {
        id: crypto.randomUUID(),
        type: 'chat.response',
        timestamp: Date.now(),
        payload: { content: response, model: currentModel },
      };
    }

    case 'models.list': {
      console.log('[mock-cvm] Models list requested');
      return {
        id: crypto.randomUUID(),
        type: 'models.response',
        timestamp: Date.now(),
        payload: {
          models: MOCK_MODELS,
          currentModel,
        },
      };
    }

    case 'tool.confirm.response':
      console.log('[mock-cvm] Tool confirmation received:', msg.payload);
      return null;

    default:
      console.log('[mock-cvm] Unhandled message type:', msg.type);
      return null;
  }
}
