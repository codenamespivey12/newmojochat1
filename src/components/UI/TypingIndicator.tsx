'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { glassStyles, animations } from '@/theme/theme';

interface TypingIndicatorProps {
  model?: 'mojo' | 'mojo++';
  message?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  model = 'mojo',
  message = 'AI is thinking...',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        ...glassStyles.glass,
        borderRadius: '16px',
        maxWidth: 'fit-content',
        ...animations.fadeIn,
      }}
    >
      {/* Model Icon */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: model === 'mojo' 
            ? 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)'
            : 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
          color: model === 'mojo' ? '#000000' : '#ffffff',
          fontSize: '14px',
          fontWeight: 700,
        }}
      >
        {model === 'mojo' ? 'M' : 'M++'}
      </Box>

      {/* Typing Animation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {message}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: model === 'mojo' ? '#ffffff' : '#ff0000',
                opacity: 0.3,
                ...animations.typing,
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
