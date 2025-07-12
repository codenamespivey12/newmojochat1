'use client';

import React, { useEffect, useState } from 'react';
import { Box, Fade, Slide, Grow, Zoom } from '@mui/material';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  transition?: 'fade' | 'slide' | 'grow' | 'zoom';
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transition = 'fade',
  duration = 300,
  direction = 'up',
}) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(pathname);

  useEffect(() => {
    if (pathname !== key) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setKey(pathname);
        setIsVisible(true);
      }, duration / 2);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [pathname, key, duration]);

  const renderTransition = () => {
    const transitionProps = {
      in: isVisible,
      timeout: duration,
      key,
    };

    switch (transition) {
      case 'slide':
        return (
          <Slide direction={direction} {...transitionProps}>
            <Box>{children}</Box>
          </Slide>
        );
      case 'grow':
        return (
          <Grow {...transitionProps}>
            <Box>{children}</Box>
          </Grow>
        );
      case 'zoom':
        return (
          <Zoom {...transitionProps}>
            <Box>{children}</Box>
          </Zoom>
        );
      default:
        return (
          <Fade {...transitionProps}>
            <Box>{children}</Box>
          </Fade>
        );
    }
  };

  return renderTransition();
};

// Loading overlay component for page transitions
export const LoadingOverlay: React.FC<{
  loading: boolean;
  message?: string;
}> = ({ loading, message = 'Loading...' }) => {
  return (
    <Fade in={loading} timeout={200}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid #ff0000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
        <Box
          sx={{
            color: 'white',
            fontSize: '1rem',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {message}
        </Box>
      </Box>
    </Fade>
  );
};
