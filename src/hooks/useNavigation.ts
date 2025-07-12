'use client';

import { useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { getUserPreferences, updateUserPreferences } from '@/lib/supabase';

export const useNavigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);

  // Load user preferences for sidebar state
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data } = await getUserPreferences();
        if (data && !isMobile) {
          setSidebarOpen(!data.sidebar_collapsed);
        }
      } catch (error) {
        console.error('Error loading navigation preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [isMobile]);

  // Update sidebar state based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = async () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);

    // Save preference for desktop users
    if (!isMobile) {
      try {
        await updateUserPreferences({
          sidebar_collapsed: !newState,
        });
      } catch (error) {
        console.error('Error saving navigation preferences:', error);
      }
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    isMobile,
    loading,
  };
};
