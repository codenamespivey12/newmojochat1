'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { Add as AddIcon, Chat as ChatIcon } from '@mui/icons-material';
import { MainLayout } from '@/components/Layout/MainLayout';
import { getCurrentUser, createChat } from '@/lib/supabase';
import { GlassCard, GradientButton, LoadingSpinner } from '@/components/UI';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleNewChat = async (model: 'mojo' | 'mojo++') => {
    try {
      const title = `New ${model === 'mojo' ? 'Mojo' : 'Mojo++'} Chat`;
      const { data, error } = await createChat(title, model);
      
      if (error) throw error;
      
      if (data) {
        router.push(`/chat/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen size={60} message="Loading..." />;
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <MainLayout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          p: 4,
          gap: 4,
        }}
      >
        {/* Welcome Section */}
        <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
          <ChatIcon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ff0000 0%, #ffffff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Welcome to sixtyoneeighty
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, mb: 4 }}>
            Choose your AI model to start a conversation
          </Typography>
        </Box>

        {/* Model Selection */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            maxWidth: 600,
          }}
        >
          {/* Mojo (GPT-4.1) Card */}
          <GlassCard
            glassVariant="secondary"
            hover
            animate
            sx={{
              flex: 1,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
            onClick={() => handleNewChat('mojo')}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Mojo
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
              Powered by GPT-4.1
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6, mb: 3 }}>
              Fast, efficient, and perfect for most conversations. Great for general questions, creative writing, and everyday tasks.
            </Typography>
            <GradientButton
              gradient="secondary"
              startIcon={<AddIcon />}
            >
              Start Mojo Chat
            </GradientButton>
          </GlassCard>

          {/* Mojo++ (O3) Card */}
          <GlassCard
            glassVariant="primary"
            hover
            animate
            sx={{
              flex: 1,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
            onClick={() => handleNewChat('mojo++')}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(135deg, #ff0000 0%, #ff6666 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Mojo++
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
              Powered by O3 Reasoning
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6, mb: 3 }}>
              Advanced reasoning capabilities for complex problems. Perfect for deep analysis, coding, mathematics, and challenging tasks.
            </Typography>
            <GradientButton
              gradient="primary"
              startIcon={<AddIcon />}
              glowing
            >
              Start Mojo++ Chat
            </GradientButton>
          </GlassCard>
        </Box>

        {/* Features */}
        <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.6 }}>
          <Typography variant="body2">
            • Real-time conversations • Chat history • File uploads • Advanced reasoning
          </Typography>
        </Box>
      </Box>
    </MainLayout>
  );
}
