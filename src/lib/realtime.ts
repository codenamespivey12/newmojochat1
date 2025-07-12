// Real-time functionality using Supabase Realtime

import { supabase } from './supabase';
import { Message, Chat } from './supabase';

export type RealtimeEvent = 
  | { type: 'message_added'; payload: Message }
  | { type: 'message_updated'; payload: Message }
  | { type: 'message_deleted'; payload: { id: string } }
  | { type: 'chat_updated'; payload: Chat }
  | { type: 'typing_start'; payload: { chatId: string; userId: string } }
  | { type: 'typing_stop'; payload: { chatId: string; userId: string } };

export type RealtimeCallback = (event: RealtimeEvent) => void;

class RealtimeService {
  private subscriptions = new Map<string, any>();
  private typingTimeouts = new Map<string, NodeJS.Timeout>();

  // Subscribe to chat messages
  subscribeToChat(chatId: string, callback: RealtimeCallback) {
    const subscriptionKey = `chat_${chatId}`;
    
    // Unsubscribe if already subscribed
    this.unsubscribe(subscriptionKey);

    const subscription = supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          callback({
            type: 'message_added',
            payload: payload.new as Message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          callback({
            type: 'message_updated',
            payload: payload.new as Message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          callback({
            type: 'message_deleted',
            payload: { id: payload.old.id },
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`,
        },
        (payload) => {
          callback({
            type: 'chat_updated',
            payload: payload.new as Chat,
          });
        }
      )
      .subscribe();

    this.subscriptions.set(subscriptionKey, subscription);
    return subscriptionKey;
  }

  // Subscribe to user's chats list
  subscribeToUserChats(userId: string, callback: RealtimeCallback) {
    const subscriptionKey = `user_chats_${userId}`;
    
    // Unsubscribe if already subscribed
    this.unsubscribe(subscriptionKey);

    const subscription = supabase
      .channel(`user_chats_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            callback({
              type: 'chat_updated',
              payload: payload.new as Chat,
            });
          }
        }
      )
      .subscribe();

    this.subscriptions.set(subscriptionKey, subscription);
    return subscriptionKey;
  }

  // Send typing indicator
  sendTypingIndicator(chatId: string, userId: string, isTyping: boolean) {
    const channel = supabase.channel(`typing_${chatId}`);
    
    if (isTyping) {
      // Clear existing timeout
      const timeoutKey = `${chatId}_${userId}`;
      if (this.typingTimeouts.has(timeoutKey)) {
        clearTimeout(this.typingTimeouts.get(timeoutKey)!);
      }

      // Send typing start
      channel.send({
        type: 'broadcast',
        event: 'typing_start',
        payload: { chatId, userId },
      });

      // Auto-stop typing after 3 seconds
      const timeout = setTimeout(() => {
        this.sendTypingIndicator(chatId, userId, false);
      }, 3000);
      
      this.typingTimeouts.set(timeoutKey, timeout);
    } else {
      // Send typing stop
      channel.send({
        type: 'broadcast',
        event: 'typing_stop',
        payload: { chatId, userId },
      });
    }
  }

  // Subscribe to typing indicators
  subscribeToTyping(chatId: string, callback: RealtimeCallback) {
    const subscriptionKey = `typing_${chatId}`;
    
    // Unsubscribe if already subscribed
    this.unsubscribe(subscriptionKey);

    const subscription = supabase
      .channel(`typing_${chatId}`)
      .on('broadcast', { event: 'typing_start' }, (payload) => {
        callback({
          type: 'typing_start',
          payload: payload.payload,
        });
      })
      .on('broadcast', { event: 'typing_stop' }, (payload) => {
        callback({
          type: 'typing_stop',
          payload: payload.payload,
        });
      })
      .subscribe();

    this.subscriptions.set(subscriptionKey, subscription);
    return subscriptionKey;
  }

  // Unsubscribe from a specific subscription
  unsubscribe(subscriptionKey: string) {
    const subscription = this.subscriptions.get(subscriptionKey);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(subscriptionKey);
    }
  }

  // Unsubscribe from all subscriptions
  unsubscribeAll() {
    for (const [key, subscription] of this.subscriptions) {
      supabase.removeChannel(subscription);
    }
    this.subscriptions.clear();
    
    // Clear all typing timeouts
    for (const timeout of this.typingTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.typingTimeouts.clear();
  }

  // Get connection status
  getConnectionStatus() {
    return supabase.realtime.isConnected();
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// React hook for real-time chat
export const useRealtimeChat = (chatId: string | null) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [typingUsers, setTypingUsers] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!chatId) return;

    let subscriptionKey: string | null = null;
    let typingSubscriptionKey: string | null = null;

    const handleRealtimeEvent = (event: RealtimeEvent) => {
      switch (event.type) {
        case 'typing_start':
          setTypingUsers(prev => new Set(prev).add(event.payload.userId));
          break;
        case 'typing_stop':
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(event.payload.userId);
            return newSet;
          });
          break;
      }
    };

    // Subscribe to typing indicators
    typingSubscriptionKey = realtimeService.subscribeToTyping(chatId, handleRealtimeEvent);

    // Check connection status
    setIsConnected(realtimeService.getConnectionStatus());

    return () => {
      if (subscriptionKey) {
        realtimeService.unsubscribe(subscriptionKey);
      }
      if (typingSubscriptionKey) {
        realtimeService.unsubscribe(typingSubscriptionKey);
      }
    };
  }, [chatId]);

  const sendTyping = React.useCallback((isTyping: boolean) => {
    if (chatId) {
      // Get current user ID (you'll need to implement this)
      const userId = 'current-user-id'; // Replace with actual user ID
      realtimeService.sendTypingIndicator(chatId, userId, isTyping);
    }
  }, [chatId]);

  return {
    isConnected,
    typingUsers,
    sendTyping,
  };
};

// Import React for the hook
import React from 'react';
