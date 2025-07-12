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
  Login as LoginIcon,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';
import { signIn, signInWithGoogle } from '@/lib/supabase';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }

      if (data.user) {
        router.push('/chat');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    
    try {
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        throw error;
      }
      
      // Google auth redirects to the provider, so we don't need to handle navigation here
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign in');
      setGoogleLoading(false);
    }
  };

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
              Sign in to your account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, ...glassStyles.glass }}>
              {error}
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              startIcon={googleLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
              sx={{
                py: 1.5,
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              {googleLoading ? 'Connecting...' : 'Sign in with Google'}
            </Button>
          </Box>

          <Divider sx={{ my: 3, opacity: 0.3 }}>
            <Typography variant="body2" sx={{ opacity: 0.7, px: 1 }}>
              OR
            </Typography>
          </Divider>

          {/* Sign In Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff3333 0%, #ff0000 100%)',
                },
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3, opacity: 0.3 }} />

          {/* Sign Up Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                sx={{
                  color: '#ff0000',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
