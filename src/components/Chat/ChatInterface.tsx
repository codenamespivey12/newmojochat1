'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MessageEditor } from './MessageEditor';
import { TypingIndicator, LoadingSpinner } from '@/components/UI';
import { Message, getChatMessages, addMessage, getCurrentUser } from '@/lib/supabase';
import { useAI, AIService } from '@/lib/ai';
import { realtimeService, RealtimeEvent } from '@/lib/realtime';
import { useStreaming, createStreamingMessage, updateStreamingMessage } from '@/lib/streaming';
import { supabase } from '@/lib/supabase';

interface FileAttachment {
  file: File;
  name: string;
  type: string;
  size: number;
}

interface ChatInterfaceProps {
  chatId: string;
  model: 'mojo' | 'mojo++';
  onModelChange: (model: 'mojo' | 'mojo++') => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatId,
  model,
  onModelChange,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendStreamingMessage } = useAI();
  const { startStream, cancelStream, isStreamActive } = useStreaming();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { user } = await getCurrentUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  // Load messages when chat changes
  useEffect(() => {
    loadMessages();
  }, [chatId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!chatId) return;

    const handleRealtimeEvent = (event: RealtimeEvent) => {
      switch (event.type) {
        case 'message_added':
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === event.payload.id)) {
              return prev;
            }
            return [...prev, event.payload];
          });
          break;
        case 'message_updated':
          setMessages(prev =>
            prev.map(msg =>
              msg.id === event.payload.id ? event.payload : msg
            )
          );
          break;
        case 'message_deleted':
          setMessages(prev =>
            prev.filter(msg => msg.id !== event.payload.id)
          );
          break;
      }
    };

    const subscriptionKey = realtimeService.subscribeToChat(chatId, handleRealtimeEvent);

    return () => {
      realtimeService.unsubscribe(subscriptionKey);
    };
  }, [chatId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, streamingMessage]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await getChatMessages(chatId);
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    setSending(true);
    setIsTyping(true);

    const streamId = `chat_${chatId}_${Date.now()}`;

    try {
      // Add user message
      const userMessageMetadata = attachments && attachments.length > 0 ? {
        attachments: attachments.map(att => ({
          name: att.name,
          type: att.type,
          url: '', // TODO: Upload files and get URLs
        })),
      } : undefined;

      const { data: userMessage, error: userError } = await addMessage(
        chatId,
        'user',
        content,
        userMessageMetadata
      );

      if (userError) throw userError;

      // Note: Real-time subscription will handle adding the message to the UI

      // Prepare conversation history for AI
      const conversationMessages = AIService.formatMessages([
        ...messages,
        { role: 'user', content }
      ]);

      // Create streaming message
      const streamingMsg = createStreamingMessage('', { model });
      setStreamingMessage(streamingMsg);

      // Get AI response stream
      const stream = await AIService.chat(model, conversationMessages, {
        stream: true,
        reasoning_effort: model === 'mojo++' ? 'medium' : undefined,
        userId: currentUser?.id,
      }) as ReadableStream;

      // Handle streaming response
      let fullResponse = '';
      let toolResults: any[] = [];

      await startStream(streamId, stream, {
        onChunk: (chunk, fullContent) => {
          // Handle tool results
          if (chunk.type === 'image_generation' || chunk.type === 'code_interpreter' || chunk.type === 'mcp_call') {
            toolResults.push(chunk.data);
            setStreamingMessage(updateStreamingMessage(streamingMsg, fullContent, { tool_calls: toolResults }));
          } else {
            fullResponse = fullContent;
            setStreamingMessage(updateStreamingMessage(streamingMsg, fullContent, { tool_calls: toolResults }));
          }
        },
        onComplete: async (finalContent) => {
          // Save AI response to database
          const { data: aiMessage, error: aiError } = await addMessage(
            chatId,
            'assistant',
            finalContent,
            {
              model,
              tokens: Math.ceil(finalContent.length / 4), // Approximate token count
              tool_calls: toolResults.length > 0 ? toolResults : undefined,
              ...(model === 'mojo++' && {
                reasoning_effort: 'medium',
              }),
            }
          );

          if (aiError) {
            console.error('Error saving AI message:', aiError);
          }

          // Clear streaming message (real-time will add the saved message)
          setStreamingMessage(null);
          setIsTyping(false);
        },
        onError: (error) => {
          console.error('Streaming error:', error);
          setStreamingMessage(null);
          setIsTyping(false);
          // TODO: Show error toast
        },
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setStreamingMessage(null);
      setIsTyping(false);
      // TODO: Show error toast
    } finally {
      setSending(false);
    }
  };



  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // TODO: Show toast notification
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      setEditingMessage(message);
    }
  };

  const handleSaveEditedMessage = async (newContent: string) => {
    if (!editingMessage) return;

    try {
      // Update message in database
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          metadata: {
            ...editingMessage.metadata,
            edited: true,
            editedAt: new Date().toISOString(),
          }
        })
        .eq('id', editingMessage.id);

      if (error) throw error;

      // Update local state (real-time will also update)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === editingMessage.id
            ? { ...msg, content: newContent, metadata: { ...msg.metadata, edited: true } }
            : msg
        )
      );

      setEditingMessage(null);
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  };

  const handleRerunMessage = async (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.role !== 'assistant') return;

    // Find the user message that prompted this response
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    const userMessage = messages[messageIndex - 1];

    if (!userMessage || userMessage.role !== 'user') return;

    // Rerun the AI response
    setSending(true);
    setIsTyping(true);

    const streamId = `rerun_${messageId}_${Date.now()}`;

    try {
      // Get conversation history up to the user message
      const conversationMessages = AIService.formatMessages(
        messages.slice(0, messageIndex).concat([userMessage])
      );

      // Create streaming message
      const streamingMsg = createStreamingMessage('', { model });
      setStreamingMessage(streamingMsg);

      // Get AI response stream
      const stream = await AIService.chat(model, conversationMessages, {
        stream: true,
        reasoning_effort: model === 'mojo++' ? 'medium' : undefined,
        userId: currentUser?.id,
      }) as ReadableStream;

      // Handle streaming response
      let fullResponse = '';
      let toolResults: any[] = [];

      await startStream(streamId, stream, {
        onChunk: (chunk, fullContent) => {
          // Handle tool results
          if (chunk.type === 'image_generation' || chunk.type === 'code_interpreter' || chunk.type === 'mcp_call') {
            toolResults.push(chunk.data);
            setStreamingMessage(updateStreamingMessage(streamingMsg, fullContent, { tool_calls: toolResults }));
          } else {
            fullResponse = fullContent;
            setStreamingMessage(updateStreamingMessage(streamingMsg, fullContent, { tool_calls: toolResults }));
          }
        },
        onComplete: async (finalContent) => {
          // Update the existing message instead of creating a new one
          const { error } = await supabase
            .from('messages')
            .update({
              content: finalContent,
              metadata: {
                model,
                tokens: Math.ceil(finalContent.length / 4),
                tool_calls: toolResults.length > 0 ? toolResults : undefined,
                rerun: true,
                rerunAt: new Date().toISOString(),
                ...(model === 'mojo++' && {
                  reasoning_effort: 'medium',
                }),
              }
            })
            .eq('id', messageId);

          if (error) {
            console.error('Error updating rerun message:', error);
          }

          setStreamingMessage(null);
          setIsTyping(false);
        },
        onError: (error) => {
          console.error('Rerun streaming error:', error);
          setStreamingMessage(null);
          setIsTyping(false);
        },
      });

    } catch (error) {
      console.error('Error rerunning message:', error);
      setStreamingMessage(null);
      setIsTyping(false);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <LoadingSpinner message="Loading conversation..." />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              opacity: 0.6,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Start a conversation
            </Typography>
            <Typography variant="body2">
              Send a message to begin chatting with {model === 'mojo' ? 'Mojo' : 'Mojo++'}
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.role === 'user'}
                model={message.role === 'assistant' ? model : undefined}
                onCopy={handleCopyMessage}
                onEdit={message.role === 'user' ? handleEditMessage : undefined}
                onRerun={message.role === 'assistant' ? handleRerunMessage : undefined}
              />
            ))}
            
            {isTyping && !streamingMessage && (
              <TypingIndicator
                model={model}
                message={`${model === 'mojo' ? 'Mojo' : 'Mojo++'} is thinking...`}
              />
            )}

            {streamingMessage && (
              <MessageBubble
                message={{
                  id: streamingMessage.id,
                  chat_id: chatId,
                  role: 'assistant',
                  content: streamingMessage.content,
                  metadata: streamingMessage.metadata,
                  created_at: new Date().toISOString(),
                }}
                isUser={false}
                model={model}
              />
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      <Divider sx={{ opacity: 0.3 }} />

      {/* Input Area */}
      <Box sx={{ p: 3 }}>
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          onModelChange={onModelChange}
          model={model}
          disabled={sending}
          placeholder={`Message ${model === 'mojo' ? 'Mojo' : 'Mojo++'}...`}
        />
      </Box>

      {/* Message Editor Modal */}
      {editingMessage && (
        <MessageEditor
          open={!!editingMessage}
          onClose={() => setEditingMessage(null)}
          onSave={handleSaveEditedMessage}
          initialContent={editingMessage.content}
          messageId={editingMessage.id}
        />
      )}
    </Box>
  );
};
