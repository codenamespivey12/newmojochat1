'use client';

import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { gradients, shadows } from '@/theme/theme';

interface GradientButtonProps extends ButtonProps {
  gradient?: 'primary' | 'secondary' | 'glass';
  loading?: boolean;
  glowing?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  gradient = 'primary',
  loading = false,
  glowing = false,
  disabled,
  sx,
  ...props
}) => {
  const getGradientStyles = () => {
    switch (gradient) {
      case 'primary':
        return {
          background: gradients.primary,
          '&:hover': {
            background: gradients.primaryHover,
            transform: 'translateY(-1px)',
            boxShadow: shadows.redHover,
          },
          ...(glowing && {
            boxShadow: shadows.red,
            '&:hover': {
              boxShadow: shadows.redHover,
            },
          }),
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(135deg, #cccccc 0%, #999999 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)',
          },
        };
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.15)',
            borderColor: 'rgba(255, 0, 0, 0.3)',
            transform: 'translateY(-1px)',
            boxShadow: shadows.glass,
          },
        };
      default:
        return {};
    }
  };

  return (
    <Button
      disabled={disabled || loading}
      sx={{
        ...getGradientStyles(),
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&::before': glowing ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transition: 'left 0.5s',
        } : {},
        '&:hover::before': glowing ? {
          left: '100%',
        } : {},
        '&.Mui-disabled': {
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.3)',
        },
        ...sx,
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={16}
          sx={{
            color: 'inherit',
            mr: 1,
          }}
        />
      )}
      {children}
    </Button>
  );
};
