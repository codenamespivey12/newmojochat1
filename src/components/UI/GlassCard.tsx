'use client';

import React from 'react';
import { Card, CardProps, useTheme } from '@mui/material';
import { glassStyles, animations } from '@/theme/theme';

interface GlassCardProps extends Omit<CardProps, 'variant'> {
  hover?: boolean;
  animate?: boolean;
  glassVariant?: 'default' | 'primary' | 'secondary';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  hover = true,
  animate = false,
  glassVariant = 'default',
  sx,
  ...props
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (glassVariant) {
      case 'primary':
        return {
          border: '1px solid rgba(255, 0, 0, 0.3)',
          '&:hover': hover ? {
            borderColor: 'rgba(255, 0, 0, 0.5)',
            boxShadow: '0 12px 40px rgba(255, 0, 0, 0.2)',
          } : {},
        };
      case 'secondary':
        return {
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': hover ? {
            borderColor: 'rgba(255, 255, 255, 0.4)',
            boxShadow: '0 12px 40px rgba(255, 255, 255, 0.1)',
          } : {},
        };
      default:
        return {
          ...glassStyles.glass,
          ...(hover && glassStyles.glassHover),
        };
    }
  };

  return (
    <Card
      sx={{
        ...getVariantStyles(),
        transition: 'all 0.3s ease-in-out',
        ...(animate && animations.fadeIn),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};
