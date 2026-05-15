import type { Message } from '../../types';

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: string) => void;
}

export interface ApiConfig {
  provider: 'claude' | 'kimi';
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

const PROVIDER_CONFIG = {
  claude: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-sonnet-20241022',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
  },
  kimi: {
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    defaultModel: 'moonshot-v1-8k',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
  },
};

export async function sendMessage(
  messages: Message[],
  apiKey: string,
  provider: 'claude' | 'kimi',
  systemPrompt: string,
  callbacks: StreamCallbacks,
  config?: Partial<ApiConfig>
): Promise<void> {
  try {
    const providerConfig = PROVIDER_CONFIG[provider];
    const model = config?.model || providerConfig.defaultModel;
    const maxTokens = config?.maxTokens || 4096;
    const temperature = config?.temperature || 0.7;

    const headers = providerConfig.headers(apiKey);

    const body = provider === 'claude' ? {
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    } : {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      ],
      stream: true,
      temperature,
      max_tokens: maxTokens,
    };

    const response = await fetch(providerConfig.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API请求失败: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // 忽略解析错误
      }

      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

        const data = trimmedLine.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          let content = '';

          if (provider === 'claude') {
            if (parsed.type === 'content_block_delta') {
              content = parsed.delta?.text || '';
            }
          } else {
            content = parsed.choices?.[0]?.delta?.content || '';
          }

          if (content) {
            fullResponse += content;
            callbacks.onChunk(content);
          }
        } catch (e) {
          // 忽略解析错误，可能是不完整的JSON
        }
      }
    }

    // 处理缓冲区中剩余的数据
    if (buffer.trim()) {
      try {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith('data: ') && trimmedLine.slice(6) !== '[DONE]') {
          const parsed = JSON.parse(trimmedLine.slice(6));
          let content = '';

          if (provider === 'claude') {
            if (parsed.type === 'content_block_delta') {
              content = parsed.delta?.text || '';
            }
          } else {
            content = parsed.choices?.[0]?.delta?.content || '';
          }

          if (content) {
            fullResponse += content;
            callbacks.onChunk(content);
          }
        }
      } catch {
        // 忽略解析错误
      }
    }

    callbacks.onComplete(fullResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    callbacks.onError(errorMessage);
  }
}

export async function sendNonStreamMessage(
  messages: Message[],
  apiKey: string,
  provider: 'claude' | 'kimi',
  systemPrompt: string,
  config?: Partial<ApiConfig>
): Promise<string> {
  const providerConfig = PROVIDER_CONFIG[provider];
  const model = config?.model || providerConfig.defaultModel;
  const maxTokens = config?.maxTokens || 4096;
  const temperature = config?.temperature || 0.7;

  const headers = providerConfig.headers(apiKey);

  const body = provider === 'claude' ? {
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  } : {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ],
    temperature,
    max_tokens: maxTokens,
  };

  const response = await fetch(providerConfig.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API请求失败: ${response.status}`;

    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // 忽略解析错误
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (provider === 'claude') {
    return data.content?.[0]?.text || '';
  } else {
    return data.choices?.[0]?.message?.content || '';
  }
}