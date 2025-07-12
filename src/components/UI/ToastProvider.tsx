'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertProps,
  Slide,
  SlideProps,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';

interface Toast {
  id: string;
  message: string;
  severity: AlertProps['severity'];
  duration?: number;
  action?: React.ReactNode;
}

interface ToastContextType {
  showToast: (
    message: string,
    severity?: AlertProps['severity'],
    duration?: number,
    action?: React.ReactNode
  ) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 3,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      message: string,
      severity: AlertProps['severity'] = 'info',
      duration: number = 4000,
      action?: React.ReactNode
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { id, message, severity, duration, action };

      setToasts(prev => {
        const updated = [...prev, newToast];
        // Keep only the latest toasts if we exceed the limit
        return updated.slice(-maxToasts);
      });

      // Auto-hide toast after duration
      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    [maxToasts]
  );

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration),
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => showToast(message, 'warning', duration),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => showToast(message, 'info', duration),
    [showToast]
  );

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Render toasts */}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            bottom: `${(index * 70) + 24}px !important`,
            '& .MuiSnackbarContent-root': {
              padding: 0,
            },
          }}
        >
          <Alert
            severity={toast.severity}
            onClose={() => hideToast(toast.id)}
            action={
              toast.action || (
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={() => hideToast(toast.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )
            }
            sx={{
              ...glassStyles.glass,
              minWidth: 300,
              maxWidth: 500,
              '& .MuiAlert-message': {
                fontSize: '0.875rem',
                fontWeight: 500,
              },
              '& .MuiAlert-icon': {
                fontSize: '1.25rem',
              },
              border: `1px solid ${
                toast.severity === 'error' ? 'rgba(244, 67, 54, 0.3)' :
                toast.severity === 'warning' ? 'rgba(255, 152, 0, 0.3)' :
                toast.severity === 'success' ? 'rgba(76, 175, 80, 0.3)' :
                'rgba(33, 150, 243, 0.3)'
              }`,
              animation: 'slideInUp 0.3s ease-out',
              '@keyframes slideInUp': {
                '0%': {
                  transform: 'translateY(100%)',
                  opacity: 0,
                },
                '100%': {
                  transform: 'translateY(0)',
                  opacity: 1,
                },
              },
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};
