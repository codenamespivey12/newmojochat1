'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  SmartToy as MojoIcon,
  Psychology as MojoPlusPlusIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { glassStyles, animations } from '@/theme/theme';
import { Message } from '@/lib/supabase';
import { ToolResult } from './ToolResult';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  model?: 'mojo' | 'mojo++';
  onEdit?: (messageId: string) => void;
  onRerun?: (messageId: string) => void;
  onCopy?: (content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  model,
  onEdit,
  onRerun,
  onCopy,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleCopy = () => {
    onCopy?.(message.content);
    handleMenuClose();
  };

  const handleEdit = () => {
    onEdit?.(message.id);
    handleMenuClose();
  };

  const handleRerun = () => {
    onRerun?.(message.id);
    handleMenuClose();
  };

  const getModelIcon = () => {
    if (isUser) return <PersonIcon sx={{ fontSize: 20 }} />;
    return model === 'mojo++' ? (
      <MojoPlusPlusIcon sx={{ fontSize: 20, color: '#ff0000' }} />
    ) : (
      <MojoIcon sx={{ fontSize: 20, color: '#ffffff' }} />
    );
  };

  const getModelColor = () => {
    if (isUser) return 'linear-gradient(135deg, #333333 0%, #555555 100%)';
    return model === 'mojo++' 
      ? 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)';
  };

  const getAvatarTextColor = () => {
    if (isUser) return '#ffffff';
    return model === 'mojo++' ? '#ffffff' : '#000000';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 2,
        mb: 3,
        ...animations.fadeIn,
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 40,
          height: 40,
          background: getModelColor(),
          color: getAvatarTextColor(),
          flexShrink: 0,
        }}
      >
        {getModelIcon()}
      </Avatar>

      {/* Message Content */}
      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {/* Message Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justifyContent: isUser ? 'flex-end' : 'flex-start',
          }}
        >
          {!isUser && model && (
            <Chip
              label={model === 'mojo' ? 'Mojo' : 'Mojo++'}
              size="small"
              sx={{
                backgroundColor: model === 'mojo++' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: model === 'mojo++' ? '#ff0000' : '#ffffff',
                border: `1px solid ${model === 'mojo++' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          )}
          
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            {new Date(message.created_at).toLocaleTimeString()}
          </Typography>

          {/* Reasoning Effort Badge (for O3) */}
          {!isUser && message.metadata?.reasoning_effort && (
            <Tooltip title={`Reasoning Effort: ${message.metadata.reasoning_effort}`}>
              <Chip
                label={message.metadata.reasoning_effort}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 165, 0, 0.2)',
                  color: '#ffa500',
                  border: '1px solid rgba(255, 165, 0, 0.3)',
                  fontSize: '0.65rem',
                  height: 18,
                }}
              />
            </Tooltip>
          )}
        </Box>

        {/* Message Bubble */}
        <Box
          sx={{
            position: 'relative',
            ...glassStyles.glass,
            p: 2,
            borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            backgroundColor: isUser 
              ? 'rgba(255, 0, 0, 0.1)' 
              : 'rgba(255, 255, 255, 0.05)',
            border: isUser 
              ? '1px solid rgba(255, 0, 0, 0.2)' 
              : '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover .message-actions': {
              opacity: 1,
            },
          }}
        >
          {/* Tool Results */}
          {message.metadata?.tool_calls && message.metadata.tool_calls.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {message.metadata.tool_calls.map((toolCall: any, index: number) => (
                <ToolResult
                  key={index}
                  type={toolCall.type}
                  data={toolCall}
                />
              ))}
            </Box>
          )}

          {/* Message Text */}
          {message.content && (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.6,
              }}
            >
              {message.content}
            </Typography>
          )}

          {/* File Attachments */}
          {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {message.metadata.attachments.map((attachment, index) => (
                <Chip
                  key={index}
                  label={attachment.name}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                />
              ))}
            </Box>
          )}

          {/* Message Actions */}
          <Box
            className="message-actions"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              opacity: 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Token Count (if available) */}
        {message.metadata?.tokens && (
          <Typography
            variant="caption"
            sx={{
              opacity: 0.5,
              textAlign: isUser ? 'right' : 'left',
              fontSize: '0.7rem',
            }}
          >
            {message.metadata.tokens} tokens
          </Typography>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            ...glassStyles.glass,
            minWidth: 150,
          },
        }}
      >
        <MenuItem onClick={handleCopy}>
          <CopyIcon sx={{ mr: 2, fontSize: 18 }} />
          Copy
        </MenuItem>
        {isUser && onEdit && (
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 2, fontSize: 18 }} />
            Edit
          </MenuItem>
        )}
        {!isUser && onRerun && (
          <MenuItem onClick={handleRerun}>
            <RefreshIcon sx={{ mr: 2, fontSize: 18 }} />
            Rerun
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};
