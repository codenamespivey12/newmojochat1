'use client';

import React from 'react';
import { Box, Skeleton, SkeletonProps } from '@mui/material';
import { glassStyles } from '@/theme/theme';

interface LoadingSkeletonProps {
  variant?: 'message' | 'chat-list' | 'profile' | 'sidebar' | 'custom';
  count?: number;
  height?: number | string;
  width?: number | string;
  animation?: SkeletonProps['animation'];
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'custom',
  count = 1,
  height = 40,
  width = '100%',
  animation = 'wave',
}) => {
  const getSkeletonStyles = () => ({
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '&::after': {
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    },
  });

  const renderMessageSkeleton = () => (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
      {/* Avatar */}
      <Skeleton
        variant="circular"
        width={40}
        height={40}
        animation={animation}
        sx={getSkeletonStyles()}
      />
      
      {/* Message Content */}
      <Box sx={{ flex: 1, maxWidth: '70%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
          <Skeleton
            variant="rectangular"
            width={60}
            height={20}
            animation={animation}
            sx={{ ...getSkeletonStyles(), borderRadius: '10px' }}
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={16}
            animation={animation}
            sx={getSkeletonStyles()}
          />
        </Box>
        
        {/* Message Bubble */}
        <Box sx={{ ...glassStyles.glass, p: 2, borderRadius: '20px 20px 20px 4px' }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={20}
            animation={animation}
            sx={{ ...getSkeletonStyles(), mb: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width="80%"
            height={20}
            animation={animation}
            sx={{ ...getSkeletonStyles(), mb: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width="60%"
            height={20}
            animation={animation}
            sx={getSkeletonStyles()}
          />
        </Box>
      </Box>
    </Box>
  );

  const renderChatListSkeleton = () => (
    <Box sx={{ p: 1 }}>
      <Box sx={{ ...glassStyles.glass, p: 2, borderRadius: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton
            variant="circular"
            width={20}
            height={20}
            animation={animation}
            sx={getSkeletonStyles()}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Skeleton
                variant="rectangular"
                width="60%"
                height={16}
                animation={animation}
                sx={getSkeletonStyles()}
              />
              <Skeleton
                variant="rectangular"
                width={50}
                height={18}
                animation={animation}
                sx={{ ...getSkeletonStyles(), borderRadius: '9px' }}
              />
            </Box>
            <Skeleton
              variant="rectangular"
              width="40%"
              height={12}
              animation={animation}
              sx={getSkeletonStyles()}
            />
          </Box>
          <Skeleton
            variant="circular"
            width={24}
            height={24}
            animation={animation}
            sx={getSkeletonStyles()}
          />
        </Box>
      </Box>
    </Box>
  );

  const renderProfileSkeleton = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Skeleton
        variant="circular"
        width={80}
        height={80}
        animation={animation}
        sx={getSkeletonStyles()}
      />
      <Skeleton
        variant="rectangular"
        width={150}
        height={24}
        animation={animation}
        sx={getSkeletonStyles()}
      />
      <Skeleton
        variant="rectangular"
        width={200}
        height={16}
        animation={animation}
        sx={getSkeletonStyles()}
      />
    </Box>
  );

  const renderSidebarSkeleton = () => (
    <Box sx={{ p: 2 }}>
      {/* New Chat Button */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={40}
        animation={animation}
        sx={{ ...getSkeletonStyles(), borderRadius: 2, mb: 2 }}
      />
      
      {/* Chat List */}
      {Array.from({ length: 5 }).map((_, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          {renderChatListSkeleton()}
        </Box>
      ))}
    </Box>
  );

  const renderCustomSkeleton = () => (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      animation={animation}
      sx={getSkeletonStyles()}
    />
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'message':
        return renderMessageSkeleton();
      case 'chat-list':
        return renderChatListSkeleton();
      case 'profile':
        return renderProfileSkeleton();
      case 'sidebar':
        return renderSidebarSkeleton();
      default:
        return renderCustomSkeleton();
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index}>
          {renderSkeleton()}
        </Box>
      ))}
    </>
  );
};
