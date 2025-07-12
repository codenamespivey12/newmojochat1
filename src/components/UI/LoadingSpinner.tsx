'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { animations } from '@/theme/theme';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  variant?: 'primary' | 'secondary' | 'glass';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  variant = 'primary',
  fullScreen = false,
}) => {
  const getColor = () => {
    switch (variant) {
      case 'primary':
        return '#ff0000';
      case 'secondary':
        return '#ffffff';
      case 'glass':
        return 'rgba(255, 255, 255, 0.7)';
      default:
        return '#ff0000';
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        ...animations.fadeIn,
      }}
    >
      <CircularProgress
        size={size}
        sx={{
          color: getColor(),
          ...animations.pulse,
        }}
      />
      {message && (
        <Typography
          variant="body2"
          sx={{
            opacity: 0.7,
            textAlign: 'center',
            maxWidth: 200,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};
