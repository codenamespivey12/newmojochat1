'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';
import { signOut, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  onProfileEdit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  sidebarOpen,
  onProfileEdit,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { user } = await getCurrentUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileEdit = () => {
    onProfileEdit();
    handleProfileMenuClose();
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/signin');
    handleProfileMenuClose();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const DRAWER_WIDTH = 280;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Brand Logo */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ff0000 0%, #ffffff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              sixtyoneeighty
            </Typography>
          </Box>

          {/* Center - Time and Date */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              ...glassStyles.glass,
              px: 3,
              py: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {formatDate(currentTime)}
            </Typography>
          </Box>

          {/* Right side - User menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{
                ...glassStyles.glassButton,
                p: 1,
              }}
            >
              {user?.user_metadata?.avatar_url ? (
                <Avatar
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name || user.email}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle sx={{ fontSize: 32 }} />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            ...glassStyles.glass,
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.user_metadata?.full_name || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleProfileEdit}>
          <Settings sx={{ mr: 2 }} />
          Profile Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};
