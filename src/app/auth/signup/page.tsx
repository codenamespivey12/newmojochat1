'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';
import { signUp } from '@/lib/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(email, password, fullName);
      
      if (error) {
        throw error;
      }

      if (data.user) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        }}
      >
        <Card
          sx={{
            maxWidth: 400,
            width: '100%',
            ...glassStyles.glass,
            p: 2,
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#4caf50',
                mb: 2,
              }}
            >
              Account Created Successfully!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
              Please check your email to verify your account, then sign in.
            </Typography>
            <CircularProgress sx={{ color: '#ff0000' }} />
            <Typography variant="body2" sx={{ opacity: 0.6, mt: 2 }}>
              Redirecting to sign in...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          ...glassStyles.glass,
          p: 2,
        }}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ff0000 0%, #ffffff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              sixtyoneeighty
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Create your account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, ...glassStyles.glass }}>
              {error}
            </Alert>
          )}

          {/* Sign Up Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, opacity: 0.7 }} />,
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, opacity: 0.7 }} />,
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              helperText="Must be at least 6 characters"
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, opacity: 0.7 }} />,
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, opacity: 0.7 }} />,
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff3333 0%, #ff0000 100%)',
                },
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </Box>

          <Divider sx={{ my: 3, opacity: 0.3 }} />

          {/* Sign In Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                sx={{
                  color: '#ff0000',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
