'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ChatInterface } from '@/components/Chat/ChatInterface';
import { LoadingSpinner } from '@/components/UI';
import { getCurrentUser, supabase } from '@/lib/supabase';

interface Chat {
  id: string;
  title: string;
  model: 'mojo' | 'mojo++';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoadChat = async () => {
      try {
        // Check authentication
        const { user } = await getCurrentUser();
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        setUser(user);

        // Load chat details
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .eq('user_id', user.id)
          .single();

        if (chatError) {
          if (chatError.code === 'PGRST116') {
            setError('Chat not found');
          } else {
            throw chatError;
          }
          return;
        }

        setChat(chatData);
      } catch (error) {
        console.error('Error loading chat:', error);
        setError('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      checkAuthAndLoadChat();
    }
  }, [chatId, router]);

  const handleModelChange = async (newModel: 'mojo' | 'mojo++') => {
    if (!chat) return;

    try {
      const { error } = await supabase
        .from('chats')
        .update({ model: newModel })
        .eq('id', chat.id);

      if (error) throw error;

      setChat(prev => prev ? { ...prev, model: newModel } : null);
    } catch (error) {
      console.error('Error updating chat model:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading chat..." />;
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  if (error || !chat) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 64px)',
            gap: 2,
          }}
        >
          <Typography variant="h5" color="error">
            {error || 'Chat not found'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            The chat you're looking for doesn't exist or you don't have access to it.
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout model={chat.model} onModelChange={handleModelChange}>
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Chat Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {chat.title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {chat.model === 'mojo' ? 'Mojo (GPT-4.1)' : 'Mojo++ (O3 Reasoning)'}
            </Typography>
          </Box>
        </Box>

        {/* Chat Interface */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <ChatInterface
            chatId={chat.id}
            model={chat.model}
            onModelChange={handleModelChange}
          />
        </Box>
      </Box>
    </MainLayout>
  );
}
