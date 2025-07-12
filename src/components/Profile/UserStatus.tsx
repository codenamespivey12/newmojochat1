'use client';

import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import {
  Circle as CircleIcon,
  Schedule as ScheduleIcon,
  DoNotDisturb as DoNotDisturbIcon,
  RadioButtonUnchecked as OfflineIcon,
} from '@mui/icons-material';

interface UserStatusProps {
  status: 'online' | 'away' | 'busy' | 'offline';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showIcon?: boolean;
}

export const UserStatus: React.FC<UserStatusProps> = ({
  status,
  size = 'medium',
  showLabel = false,
  showIcon = true,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: '#4caf50',
          label: 'Online',
          icon: <CircleIcon />,
          description: 'Available for chat',
        };
      case 'away':
        return {
          color: '#ff9800',
          label: 'Away',
          icon: <ScheduleIcon />,
          description: 'Away from keyboard',
        };
      case 'busy':
        return {
          color: '#f44336',
          label: 'Busy',
          icon: <DoNotDisturbIcon />,
          description: 'Do not disturb',
        };
      case 'offline':
        return {
          color: '#9e9e9e',
          label: 'Offline',
          icon: <OfflineIcon />,
          description: 'Not available',
        };
      default:
        return {
          color: '#9e9e9e',
          label: 'Unknown',
          icon: <OfflineIcon />,
          description: 'Status unknown',
        };
    }
  };

  const config = getStatusConfig();
  
  const getSize = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'large':
        return 16;
      default:
        return 12;
    }
  };

  const iconSize = getSize();

  if (showLabel) {
    return (
      <Tooltip title={config.description}>
        <Chip
          icon={
            showIcon ? (
              <Box
                sx={{
                  width: iconSize,
                  height: iconSize,
                  borderRadius: '50%',
                  backgroundColor: config.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.cloneElement(config.icon, {
                  sx: { fontSize: iconSize * 0.7, color: 'white' },
                })}
              </Box>
            ) : undefined
          }
          label={config.label}
          size={size === 'large' ? 'medium' : 'small'}
          sx={{
            backgroundColor: `${config.color}20`,
            color: config.color,
            border: `1px solid ${config.color}40`,
            '& .MuiChip-label': {
              fontWeight: 600,
            },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`${config.label} - ${config.description}`}>
      <Box
        sx={{
          width: iconSize,
          height: iconSize,
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'help',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      >
        {showIcon && React.cloneElement(config.icon, {
          sx: { fontSize: iconSize * 0.7, color: 'white' },
        })}
      </Box>
    </Tooltip>
  );
};
