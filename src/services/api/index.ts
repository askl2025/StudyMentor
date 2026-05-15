import type { Message, ModelProvider, CustomModelConfig } from '../../types';

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: string) => void;
}

interface ProviderConfig {
  endpoint: string;
  defaultModel: string;
  headers: (apiKey: string) => Record<string, string>;
  buildBody: (params: {
    messages: { role: string; content: string }[];
    systemPrompt: string;
    model: string;
    maxTokens: number;
    temperature: number;
  }) => any;
  parseChunk: (data: any) => string;
  urlSuffix?: (model: string, apiKey: string) => string;
}

const PROVIDER_CONFIGS: Partial<Record<ModelProvider, ProviderConfig>> = {
  claude: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-sonnet-20241022',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
    buildBody: ({ messages, systemPrompt, model, maxTokens, temperature }) => ({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages,
      stream: true,
    }),
    parseChunk: (parsed) => {
      if (parsed.type === 'content_block_delta') return parsed.delta?.text || '';
      return '';
    },
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: ({ messages, systemPrompt, model, maxTokens, temperature }) => ({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature,
      max_tokens: maxTokens,
    }),
    parseChunk: (parsed) => parsed.choices?.[0]?.delta?.content || '',
  },
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-2.0-flash',
    headers: () => ({ 'Content-Type': 'application/json' }),
    buildBody: ({ messages, systemPrompt, maxTokens, temperature }) => ({
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    }),
    parseChunk: (parsed) => parsed.candidates?.[0]?.content?.parts?.[0]?.text || '',
    urlSuffix: (model, apiKey) => `/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
  },
  deepseek: {
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: ({ messages, systemPrompt, model, maxTokens, temperature }) => ({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature,
      max_tokens: maxTokens,
    }),
    parseChunk: (parsed) => parsed.choices?.[0]?.delta?.content || '',
  },
  kimi: {
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    defaultModel: 'moonshot-v1-8k',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: ({ messages, systemPrompt, model, maxTokens, temperature }) => ({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature,
      max_tokens: maxTokens,
    }),
    parseChunk: (parsed) => parsed.choices?.[0]?.delta?.content || '',
  },
  glm: {
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    defaultModel: 'glm-4-flash',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: ({ messages, systemPrompt, model, maxTokens, temperature }) => ({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature,
      max_tokens: maxTokens,
    }),
    parseChunk: (parsed) => parsed.choices?.[0]?.delta?.content || '',
  },
};

function getCustomConfig(customConfig: CustomModelConfig): ProviderConfig {
  const baseUrl = customConfig.baseUrl.replace(/\/+$/, '');
  const endpoint = baseUrl.endsWith('/chat/completions')
    ? baseUrl
    : `${baseUrl}/chat/completions`;

  return {
    endpoint,
    defaultModel: customConfig.modelName,
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: ({ messages, systemPrompt, model, maxTokens, temperature }) => ({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature,
      max_tokens: maxTokens,
    }),
    parseChunk: (parsed) => parsed.choices?.[0]?.delta?.content || '',
  };
}

export async function sendMessage(
  messages: Message[],
  apiKey: string,
  provider: ModelProvider,
  systemPrompt: string,
  callbacks: StreamCallbacks,
  customConfig?: CustomModelConfig
): Promise<void> {
  try {
    const config = provider === 'custom'
      ? getCustomConfig(customConfig!)
      : PROVIDER_CONFIGS[provider]!;

    const model = config.defaultModel;
    const maxTokens = 4096;
    const temperature = 0.7;

    const headers = config.headers(apiKey);
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const body = config.buildBody({
      messages: formattedMessages,
      systemPrompt,
      model,
      maxTokens,
      temperature,
    });

    const endpoint = config.urlSuffix
      ? `${config.endpoint}${config.urlSuffix(model, apiKey)}`
      : config.endpoint;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API请求失败: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch { /* ignore */ }
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取响应流');

    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = config.parseChunk(parsed);
          if (content) {
            fullResponse += content;
            callbacks.onChunk(content);
          }
        } catch { /* skip */ }
      }
    }

    callbacks.onComplete(fullResponse);
  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : '未知错误');
  }
}

export async function sendNonStreamMessage(
  messages: Message[],
  apiKey: string,
  provider: ModelProvider,
  systemPrompt: string,
  customConfig?: CustomModelConfig
): Promise<string> {
  const config = provider === 'custom'
    ? getCustomConfig(customConfig!)
    : PROVIDER_CONFIGS[provider]!;

  const model = config.defaultModel;
  const headers = config.headers(apiKey);
  const formattedMessages = messages.map((m) => ({ role: m.role, content: m.content }));

  const body = config.buildBody({
    messages: formattedMessages,
    systemPrompt,
    model,
    maxTokens: 4096,
    temperature: 0.7,
  });

  const endpoint = config.urlSuffix
    ? `${config.endpoint}${config.urlSuffix(model, apiKey).replace('streamGenerateContent', 'generateContent').replace('&alt=sse', '')}`
    : config.endpoint;

  const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API请求失败: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorMessage;
    } catch { /* ignore */ }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (provider === 'gemini') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  return data.choices?.[0]?.message?.content || '';
}