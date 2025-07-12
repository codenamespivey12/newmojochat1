'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Mic as MicIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';
import { ModelSelector } from '@/components/UI';

interface FileAttachment {
  file: File;
  name: string;
  type: string;
  size: number;
}

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string, attachments?: FileAttachment[]) => void;
  onModelChange: (model: 'mojo' | 'mojo++') => void;
  model: 'mojo' | 'mojo++';
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onModelChange,
  model,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 4000,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() || attachments.length > 0) {
      onSend(value.trim(), attachments);
      onChange('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: FileAttachment[] = files.map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <Box
      sx={{
        ...glassStyles.glass,
        p: 2,
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        '&:focus-within': {
          borderColor: model === 'mojo++' ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.4)',
          boxShadow: `0 0 0 2px ${model === 'mojo++' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`,
        },
      }}
    >
      {/* Model Selector */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ModelSelector
          value={model}
          onChange={onModelChange}
          disabled={disabled}
          size="small"
        />
      </Box>

      {/* File Attachments */}
      {attachments.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {attachments.map((attachment, index) => (
            <Chip
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption">
                    {attachment.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    ({formatFileSize(attachment.size)})
                  </Typography>
                </Box>
              }
              onDelete={() => handleRemoveAttachment(index)}
              deleteIcon={<CloseIcon />}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '& .MuiChip-label': {
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        {/* File Upload Button */}
        <Tooltip title="Attach files">
          <IconButton
            onClick={handleAttachClick}
            disabled={disabled}
            sx={{
              ...glassStyles.glassButton,
              mb: 0.5,
            }}
          >
            <AttachFileIcon />
          </IconButton>
        </Tooltip>

        {/* Text Input */}
        <TextField
          fullWidth
          multiline
          maxRows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          inputProps={{
            maxLength,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'transparent',
              border: 'none',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              fontSize: '1rem',
              lineHeight: 1.5,
              '&::placeholder': {
                opacity: 0.7,
              },
            },
          }}
        />

        {/* Voice Recording Button */}
        <Tooltip title={isRecording ? "Stop recording" : "Voice message"}>
          <IconButton
            onClick={handleVoiceToggle}
            disabled={disabled}
            sx={{
              ...glassStyles.glassButton,
              mb: 0.5,
              ...(isRecording && {
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                color: '#ff0000',
              }),
            }}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>

        {/* Send Button */}
        <Tooltip title="Send message">
          <IconButton
            type="submit"
            disabled={!canSend}
            sx={{
              ...glassStyles.glassButton,
              mb: 0.5,
              background: canSend 
                ? (model === 'mojo++' 
                  ? 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)')
                : 'rgba(255, 255, 255, 0.1)',
              color: canSend 
                ? (model === 'mojo++' ? '#ffffff' : '#000000')
                : 'rgba(255, 255, 255, 0.3)',
              '&:hover': canSend ? {
                background: model === 'mojo++' 
                  ? 'linear-gradient(135deg, #ff3333 0%, #ff0000 100%)'
                  : 'linear-gradient(135deg, #cccccc 0%, #999999 100%)',
                transform: 'scale(1.05)',
              } : {},
            }}
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Character Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          {model === 'mojo++' ? 'Advanced reasoning mode' : 'Fast response mode'}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            opacity: 0.6,
            color: value.length > maxLength * 0.9 ? '#ff9800' : 'inherit',
          }}
        >
          {value.length}/{maxLength}
        </Typography>
      </Box>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,text/*,.pdf,.doc,.docx,.txt,.md"
      />
    </Box>
  );
};
