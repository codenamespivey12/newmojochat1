// Enhanced streaming functionality for real-time chat
import React from 'react';

export interface StreamingMessage {
  id: string;
  content: string;
  isComplete: boolean;
  metadata?: {
    model?: string;
    tokens?: number;
    reasoning_effort?: string;
    tool_calls?: any[];
  };
}

export interface StreamingOptions {
  onStart?: () => void;
  onChunk?: (chunk: any, fullContent: string) => void;
  onComplete?: (finalContent: string, metadata?: any) => void;
  onError?: (error: Error) => void;
}

export class StreamingManager {
  private activeStreams = new Map<string, AbortController>();

  // Start a streaming response
  async startStream(
    streamId: string,
    stream: ReadableStream,
    options: StreamingOptions = {}
  ): Promise<string> {
    // Cancel any existing stream with the same ID
    this.cancelStream(streamId);

    const controller = new AbortController();
    this.activeStreams.set(streamId, controller);

    let fullContent = '';
    
    try {
      options.onStart?.();

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      while (!controller.signal.aborted) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (controller.signal.aborted) break;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              options.onComplete?.(fullContent);
              return fullContent;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                options.onChunk?.(parsed, fullContent);
              } else if (parsed.type === 'image_generation' || parsed.type === 'code_interpreter' || parsed.type === 'mcp_call') {
                // Handle tool results
                options.onChunk?.(parsed, fullContent);
              }
            } catch (error) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }

      if (controller.signal.aborted) {
        throw new Error('Stream was cancelled');
      }

      options.onComplete?.(fullContent);
      return fullContent;

    } catch (error) {
      if (!controller.signal.aborted) {
        options.onError?.(error as Error);
      }
      throw error;
    } finally {
      this.activeStreams.delete(streamId);
    }
  }

  // Cancel a specific stream
  cancelStream(streamId: string) {
    const controller = this.activeStreams.get(streamId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(streamId);
    }
  }

  // Cancel all active streams
  cancelAllStreams() {
    for (const [streamId, controller] of this.activeStreams) {
      controller.abort();
    }
    this.activeStreams.clear();
  }

  // Check if a stream is active
  isStreamActive(streamId: string): boolean {
    return this.activeStreams.has(streamId);
  }

  // Get active stream count
  getActiveStreamCount(): number {
    return this.activeStreams.size;
  }
}

// Singleton instance
export const streamingManager = new StreamingManager();

// React hook for streaming messages
export const useStreaming = () => {
  const [activeStreams, setActiveStreams] = React.useState<Set<string>>(new Set());

  const startStream = React.useCallback(async (
    streamId: string,
    stream: ReadableStream,
    options: StreamingOptions = {}
  ) => {
    setActiveStreams(prev => new Set(prev).add(streamId));

    const enhancedOptions: StreamingOptions = {
      ...options,
      onComplete: (content, metadata) => {
        setActiveStreams(prev => {
          const newSet = new Set(prev);
          newSet.delete(streamId);
          return newSet;
        });
        options.onComplete?.(content, metadata);
      },
      onError: (error) => {
        setActiveStreams(prev => {
          const newSet = new Set(prev);
          newSet.delete(streamId);
          return newSet;
        });
        options.onError?.(error);
      },
    };

    try {
      return await streamingManager.startStream(streamId, stream, enhancedOptions);
    } catch (error) {
      setActiveStreams(prev => {
        const newSet = new Set(prev);
        newSet.delete(streamId);
        return newSet;
      });
      throw error;
    }
  }, []);

  const cancelStream = React.useCallback((streamId: string) => {
    streamingManager.cancelStream(streamId);
    setActiveStreams(prev => {
      const newSet = new Set(prev);
      newSet.delete(streamId);
      return newSet;
    });
  }, []);

  const cancelAllStreams = React.useCallback(() => {
    streamingManager.cancelAllStreams();
    setActiveStreams(new Set());
  }, []);

  return {
    activeStreams,
    startStream,
    cancelStream,
    cancelAllStreams,
    isStreamActive: (streamId: string) => activeStreams.has(streamId),
  };
};

// Utility for creating streaming message components
export const createStreamingMessage = (
  initialContent: string = '',
  metadata?: any
): StreamingMessage => ({
  id: `streaming_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  content: initialContent,
  isComplete: false,
  metadata,
});

// Utility for updating streaming message
export const updateStreamingMessage = (
  message: StreamingMessage,
  newContent: string,
  additionalMetadata?: any,
  isComplete: boolean = false
): StreamingMessage => ({
  ...message,
  content: newContent,
  isComplete,
  metadata: {
    ...message.metadata,
    ...additionalMetadata,
  },
});

// Debounced update utility for smooth streaming
export const createDebouncedUpdater = (
  callback: (content: string) => void,
  delay: number = 50
) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingContent = '';

  return (content: string) => {
    pendingContent = content;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(pendingContent);
      timeoutId = null;
    }, delay);
  };
};


