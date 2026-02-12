/**
 * Message routing — dispatches decrypted messages to handlers.
 */

import type { MessageEnvelope, ChatMessagePayload, ModelInfo, PreferencesSetPayload } from '@luciaclaw/protocol';
import { generateMockResponse } from './mock-llm.js';

/** In-memory preferences store for mock CVM */
const mockPreferences: Record<string, string> = {};

const MOCK_MODELS: ModelInfo[] = [
  {
    id: 'moonshotai/kimi-k2.5',
    name: 'Kimi K2.5',
    provider: 'moonshotai',
    contextLength: 131072,
    inputPrice: 0.20,
    outputPrice: 0.60,
  },
  {
    id: 'phala/uncensored-24b',
    name: 'Uncensored 24B',
    provider: 'phala',
    contextLength: 32768,
    inputPrice: 0.10,
    outputPrice: 0.30,
  },
  {
    id: 'z-ai/glm-5',
    name: 'GLM-5',
    provider: 'z-ai',
    contextLength: 131072,
    inputPrice: 0.50,
    outputPrice: 1.50,
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

    case 'preferences.set': {
      const prefPayload = msg.payload as PreferencesSetPayload;
      mockPreferences[prefPayload.key] = prefPayload.value;
      console.log(`[mock-cvm] Preference set: ${prefPayload.key} = ${prefPayload.value}`);
      return {
        id: crypto.randomUUID(),
        type: 'preferences.response',
        timestamp: Date.now(),
        payload: { preferences: { ...mockPreferences } },
      };
    }

    case 'preferences.list': {
      console.log('[mock-cvm] Preferences list requested');
      return {
        id: crypto.randomUUID(),
        type: 'preferences.response',
        timestamp: Date.now(),
        payload: { preferences: { ...mockPreferences } },
      };
    }

    default:
      console.log('[mock-cvm] Unhandled message type:', msg.type);
      return null;
  }
}
