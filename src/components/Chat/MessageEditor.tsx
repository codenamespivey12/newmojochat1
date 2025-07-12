'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';
import { GradientButton } from '@/components/UI';

interface MessageEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (newContent: string) => Promise<void>;
  initialContent: string;
  messageId: string;
}

export const MessageEditor: React.FC<MessageEditorProps> = ({
  open,
  onClose,
  onSave,
  initialContent,
  messageId,
}) => {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
      setError(null);
    }
  }, [open, initialContent]);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Message content cannot be empty');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(content.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save message');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setError(null);
    onClose();
  };

  const hasChanges = content.trim() !== initialContent.trim();

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          ...glassStyles.glass,
          minHeight: 400,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Edit Message
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ ...glassStyles.glass }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your message..."
            disabled={saving}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Message ID: {messageId}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.7,
                color: content.length > 4000 ? 'error.main' : 'inherit',
              }}
            >
              {content.length}/4000 characters
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleCancel}
          disabled={saving}
          startIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        
        <GradientButton
          gradient="primary"
          onClick={handleSave}
          disabled={saving || !hasChanges || content.length > 4000}
          loading={saving}
          startIcon={<SaveIcon />}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </GradientButton>
      </DialogActions>
    </Dialog>
  );
};
