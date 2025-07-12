'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';
import { GradientButton } from '@/components/UI';
import { supabase } from '@/lib/supabase';

interface AccountSettingsProps {
  user: any;
  onClose: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Export user data
      const { data: chats } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id);

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .in('chat_id', chats?.map(chat => chat.id) || []);

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id);

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          created_at: user.created_at,
        },
        chats: chats || [],
        messages: messages || [],
        preferences: preferences || [],
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sixtyoneeighty-data-${user.id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Data exported successfully');
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Delete user data
      await supabase.from('messages').delete().in(
        'chat_id',
        (await supabase.from('chats').select('id').eq('user_id', user.id)).data?.map(c => c.id) || []
      );
      
      await supabase.from('chats').delete().eq('user_id', user.id);
      await supabase.from('user_preferences').delete().eq('user_id', user.id);
      await supabase.from('users').delete().eq('id', user.id);

      // Delete auth user (this will sign them out)
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      setSuccess('Account deleted successfully');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Account Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, ...glassStyles.glass }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, ...glassStyles.glass }}>
          {success}
        </Alert>
      )}

      {/* Password Change Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon />
          Change Password
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
          <TextField
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
          />
          
          <TextField
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            helperText="Must be at least 6 characters"
          />
          
          <TextField
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          
          <GradientButton
            gradient="primary"
            onClick={handlePasswordChange}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            loading={loading}
            sx={{ alignSelf: 'flex-start' }}
          >
            Update Password
          </GradientButton>
        </Box>
      </Box>

      <Divider sx={{ my: 3, opacity: 0.3 }} />

      {/* Data Management Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Data Management
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Export Data"
              secondary="Download all your chat data, preferences, and account information"
            />
            <ListItemSecondaryAction>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleExportData}
                variant="outlined"
              >
                Export
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 3, opacity: 0.3 }} />

      {/* Danger Zone */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <WarningIcon />
          Danger Zone
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 2, ...glassStyles.glass }}>
          These actions cannot be undone. Please be careful.
        </Alert>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Delete Account"
              secondary="Permanently delete your account and all associated data"
            />
            <ListItemSecondaryAction>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                variant="outlined"
                color="error"
              >
                Delete Account
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Box>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            ...glassStyles.glass,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your chats, messages, and preferences will be permanently deleted.
          </Alert>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Type <strong>DELETE MY ACCOUNT</strong> to confirm:
          </Typography>
          
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={loading || deleteConfirmText !== 'DELETE MY ACCOUNT'}
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
