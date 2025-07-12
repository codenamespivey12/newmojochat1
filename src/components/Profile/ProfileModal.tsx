'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';
import { getUserPreferences, updateUserPreferences, UserPreferences, supabase } from '@/lib/supabase';
import { usePreferences } from '@/lib/preferences';
import { GradientButton } from '@/components/UI';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Personalization fields
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestsText, setInterestsText] = useState(''); // Temporary text state
  const [age, setAge] = useState<number | ''>('');
  const [occupation, setOccupation] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [goals, setGoals] = useState('');
  const [bio, setBio] = useState('');

  // Use enhanced preferences
  const {
    preferences,
    updateChatPreferences,
    updateUIPreferences,
    updateNotificationPreferences,
    resetToDefaults,
    exportPreferences,
  } = usePreferences();

  // Load user data when modal opens
  useEffect(() => {
    if (open && user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');

      // Load personalization data from database
      const loadUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('location, interests, age, occupation, hobbies, goals, bio')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            setLocation(data.location || '');
            setInterests(data.interests || []);
            setInterestsText((data.interests || []).join(', '));
            setAge(data.age || '');
            setOccupation(data.occupation || '');
            setHobbies(data.hobbies || '');
            setGoals(data.goals || '');
            setBio(data.bio || '');
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      };

      loadUserProfile();
    }
  }, [open, user]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Update user profile in auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        }
      });

      if (authError) throw authError;

      // Parse interests from text
      const parsedInterests = interestsText
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      // Update user record in database with all profile fields
      const { error: dbError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          location: location || null,
          interests: parsedInterests.length > 0 ? parsedInterests : [],
          age: age || null,
          occupation: occupation || null,
          hobbies: hobbies || null,
          goals: goals || null,
          bio: bio || null,
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleAvatarUpload = () => {
    // TODO: Implement avatar upload functionality
    // This would involve file upload to Supabase storage
    console.log('Avatar upload not implemented yet');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          ...glassStyles.glass,
          minHeight: 500,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Profile Settings
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Avatar Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatarUrl}
                  alt={fullName || email}
                  sx={{ width: 80, height: 80 }}
                />
                <Button
                  size="small"
                  onClick={handleAvatarUpload}
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: -8,
                    minWidth: 32,
                    width: 32,
                    height: 32,
                    ...glassStyles.glassButton,
                    borderRadius: '50%', // Override glassButton borderRadius for circular button
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 16 }} />
                </Button>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Click the camera icon to upload a new avatar
              </Typography>
            </Box>

            <Divider />

            {/* Profile Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Profile Information
              </Typography>
              
              <TextField
                fullWidth
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Email"
                value={email}
                disabled
                helperText="Email cannot be changed from this interface"
                sx={{ mb: 2 }}
              />

              {/* Personalization Fields */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Tell Mojo About Yourself
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                Help Mojo get to know you better for more personalized conversations. All fields are optional.
              </Typography>

              <TextField
                fullWidth
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g., Software Engineer, Teacher, Student"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Interests"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="e.g., Technology, Music, Travel, Cooking"
                helperText="Separate multiple interests with commas"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Hobbies"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                placeholder="e.g., Playing guitar, Reading, Hiking"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g., Learn a new language, Start a business"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell Mojo a bit about yourself..."
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
            </Box>

            <Divider />

            {/* Preferences */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Preferences
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.ui.theme === 'dark'}
                    onChange={(e) =>
                      updateUIPreferences({
                        theme: e.target.checked ? 'dark' : 'light',
                      })
                    }
                  />
                }
                label="Dark Mode"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.chat.defaultModel === 'mojo++'}
                    onChange={(e) =>
                      updateChatPreferences({
                        defaultModel: e.target.checked ? 'mojo++' : 'mojo',
                      })
                    }
                  />
                }
                label="Default to Mojo++ (O3) Model"
                sx={{ mb: 2 }}
              />
            </Box>

            {/* Status Messages */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Profile updated successfully!
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <GradientButton
          gradient="primary"
          onClick={handleSave}
          disabled={saving || loading}
          loading={saving}
          startIcon={<SaveIcon />}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </GradientButton>
      </DialogActions>
    </Dialog>
  );
};
