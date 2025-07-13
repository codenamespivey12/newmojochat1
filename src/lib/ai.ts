// AI service for handling chat completions

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: {
    role: 'assistant';
    content: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: 'mojo' | 'mojo++';
  metadata: {
    model: string;
    tokens?: number;
    reasoning_effort?: string;
    completion_tokens?: number;
    prompt_tokens?: number;
  };
}

export interface StreamChunk {
  content: string;
}

export class AIService {
  private static async makeRequest(
    endpoint: string,
    messages: ChatMessage[],
    options: {
      stream?: boolean;
      reasoning_effort?: 'low' | 'medium' | 'high';
      userId?: string;
    } = {}
  ): Promise<Response> {
    console.log('AIService.makeRequest:', endpoint, { messages, options });
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        ...options,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  // Mojo (GPT-4.1) - Fast and efficient
  static async chatWithMojo(
    messages: ChatMessage[],
    options: { stream?: boolean; userId?: string } = {}
  ): Promise<ChatResponse | ReadableStream> {
    const response = await this.makeRequest('/api/chat/mojo', messages, options);

    if (options.stream) {
      return response.body!;
    }

    return response.json();
  }

  // Mojo++ (O3) - Advanced reasoning
  static async chatWithMojoPlus(
    messages: ChatMessage[],
    options: {
      stream?: boolean;
      reasoning_effort?: 'low' | 'medium' | 'high';
      userId?: string;
    } = {}
  ): Promise<ChatResponse | ReadableStream> {
    const response = await this.makeRequest('/api/chat/mojo-plus', messages, {
      reasoning_effort: 'medium',
      ...options,
    });

    if (options.stream) {
      return response.body!;
    }

    return response.json();
  }

  // Generic chat method that routes to appropriate model
  static async chat(
    model: 'mojo' | 'mojo++',
    messages: ChatMessage[],
    options: {
      stream?: boolean;
      reasoning_effort?: 'low' | 'medium' | 'high';
      userId?: string;
    } = {}
  ): Promise<ChatResponse | ReadableStream> {
    if (model === 'mojo++') {
      return this.chatWithMojoPlus(messages, options);
    } else {
      return this.chatWithMojo(messages, options);
    }
  }

  // Stream parser utility
  static async *parseStream(stream: ReadableStream): AsyncGenerator<StreamChunk> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                yield { content: parsed.content };
              }
            } catch (error) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Utility to convert messages for API
  static formatMessages(messages: Array<{ role: string; content: string }>): ChatMessage[] {
    return messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
  }

  // Error handling utility
  static handleError(error: any): string {
    if (error.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred. Please try again.';
  }
}

// Hook for React components
export const useAI = () => {
  const sendMessage = async (
    model: 'mojo' | 'mojo++',
    messages: ChatMessage[],
    options?: {
      stream?: boolean;
      reasoning_effort?: 'low' | 'medium' | 'high';
      userId?: string;
    }
  ) => {
    try {
      return await AIService.chat(model, messages, options);
    } catch (error) {
      throw new Error(AIService.handleError(error));
    }
  };

  const sendStreamingMessage = async (
    model: 'mojo' | 'mojo++',
    messages: ChatMessage[],
    onChunk: (chunk: StreamChunk) => void,
    options?: {
      reasoning_effort?: 'low' | 'medium' | 'high';
      userId?: string;
    }
  ) => {
    try {
      const stream = await AIService.chat(model, messages, {
        stream: true,
        ...options,
      }) as ReadableStream;

      for await (const chunk of AIService.parseStream(stream)) {
        onChunk(chunk);
      }
    } catch (error) {
      throw new Error(AIService.handleError(error));
    }
  };

  return {
    sendMessage,
    sendStreamingMessage,
  };
};
