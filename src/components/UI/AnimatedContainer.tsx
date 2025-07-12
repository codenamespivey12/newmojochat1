'use client';

import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { animations } from '@/theme/theme';

interface AnimatedContainerProps extends BoxProps {
  animation?: 'fadeIn' | 'slideIn' | 'pulse' | 'typing' | 'bounce' | 'scale';
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  animation = 'fadeIn',
  delay = 0,
  duration = 0.3,
  children,
  sx,
  ...props
}) => {
  const getAnimationStyles = () => {
    const baseAnimation = {
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      animationFillMode: 'both',
    };

    switch (animation) {
      case 'fadeIn':
        return {
          ...animations.fadeIn,
          ...baseAnimation,
        };
      case 'slideIn':
        return {
          ...animations.slideIn,
          ...baseAnimation,
        };
      case 'pulse':
        return {
          ...animations.pulse,
          ...baseAnimation,
        };
      case 'typing':
        return {
          ...animations.typing,
          ...baseAnimation,
        };
      case 'bounce':
        return {
          '@keyframes bounce': {
            '0%, 20%, 53%, 80%, 100%': {
              transform: 'translate3d(0,0,0)',
            },
            '40%, 43%': {
              transform: 'translate3d(0, -30px, 0)',
            },
            '70%': {
              transform: 'translate3d(0, -15px, 0)',
            },
            '90%': {
              transform: 'translate3d(0, -4px, 0)',
            },
          },
          animation: `bounce ${duration}s ease-in-out ${delay}s both`,
          ...baseAnimation,
        };
      case 'scale':
        return {
          '@keyframes scale': {
            '0%': {
              transform: 'scale(0.8)',
              opacity: 0,
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 1,
            },
          },
          animation: `scale ${duration}s ease-out ${delay}s both`,
          ...baseAnimation,
        };
      default:
        return {};
    }
  };

  return (
    <Box
      sx={{
        ...getAnimationStyles(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
