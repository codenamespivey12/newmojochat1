'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  AccountCircle,
  Logout,
  Settings,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProfileModal } from '../Profile/ProfileModal';
import { getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';

const DRAWER_WIDTH = 280;

interface MainLayoutProps {
  children: React.ReactNode;
  model?: 'mojo' | 'mojo++';
  onModelChange?: (model: 'mojo' | 'mojo++') => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, model, onModelChange }) => {
  const theme = useTheme();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, closeSidebar, isMobile } = useNavigation();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { user } = await getCurrentUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleProfileEdit = () => {
    setProfileModalOpen(true);
  };

  const drawer = (
    <Sidebar onNewChat={closeSidebar} />
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Header */}
      <Header
        onMenuClick={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onProfileEdit={handleProfileEdit}
        model={model}
        onModelChange={onModelChange}
      />

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: sidebarOpen ? DRAWER_WIDTH : 0 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={sidebarOpen}
          onClose={toggleSidebar}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Profile Modal */}
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
      />
    </Box>
  );
};
