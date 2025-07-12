'use client';

import React from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  SmartToy as MojoIcon,
  Psychology as MojoPlusPlusIcon,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';

interface ModelSelectorProps {
  value: 'mojo' | 'mojo++';
  onChange: (model: 'mojo' | 'mojo++') => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'medium',
}) => {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: 'mojo' | 'mojo++' | null,
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { py: 0.5, px: 1 };
      case 'large':
        return { py: 1.5, px: 3 };
      default:
        return { py: 1, px: 2 };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="caption" sx={{ opacity: 0.7, textAlign: 'center' }}>
        AI Model
      </Typography>
      
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        disabled={disabled}
        sx={{
          ...glassStyles.glass,
          borderRadius: '12px',
          p: 0.5,
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.7)',
            ...getButtonSize(),
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            },
          },
        }}
      >
        <Tooltip title="GPT-4.1 - Fast and efficient for most tasks">
          <ToggleButton
            value="mojo"
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MojoIcon sx={{ fontSize: size === 'small' ? 16 : 20 }} />
              <Typography
                variant={size === 'small' ? 'caption' : 'body2'}
                sx={{ fontWeight: 600 }}
              >
                Mojo
              </Typography>
            </Box>
          </ToggleButton>
        </Tooltip>

        <Tooltip title="O3 Reasoning - Advanced reasoning for complex problems">
          <ToggleButton
            value="mojo++"
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderColor: 'rgba(255, 0, 0, 0.4)',
                color: '#ff0000',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.25)',
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MojoPlusPlusIcon 
                sx={{ 
                  fontSize: size === 'small' ? 16 : 20,
                  color: value === 'mojo++' ? '#ff0000' : 'inherit',
                }} 
              />
              <Typography
                variant={size === 'small' ? 'caption' : 'body2'}
                sx={{ 
                  fontWeight: 600,
                  color: value === 'mojo++' ? '#ff0000' : 'inherit',
                }}
              >
                Mojo++
              </Typography>
            </Box>
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
};
