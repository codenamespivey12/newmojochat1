// Enhanced user preferences management

import { getUserPreferences, updateUserPreferences, UserPreferences } from './supabase';

export interface ChatPreferences {
  defaultModel: 'mojo' | 'mojo++';
  autoScroll: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
  soundEnabled: boolean;
  streamingEnabled: boolean;
  reasoningEffort: 'low' | 'medium' | 'high';
}

export interface UIPreferences {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  fontSize: 'small' | 'medium' | 'large';
  animationsEnabled: boolean;
  glassEffects: boolean;
}

export interface NotificationPreferences {
  newMessageSound: boolean;
  browserNotifications: boolean;
  emailNotifications: boolean;
  mentionNotifications: boolean;
}

export interface AdvancedPreferences {
  developerMode: boolean;
  debugMode: boolean;
  experimentalFeatures: boolean;
  telemetryEnabled: boolean;
}

export interface AllPreferences {
  chat: ChatPreferences;
  ui: UIPreferences;
  notifications: NotificationPreferences;
  advanced: AdvancedPreferences;
}

// Default preferences
export const DEFAULT_PREFERENCES: AllPreferences = {
  chat: {
    defaultModel: 'mojo',
    autoScroll: true,
    showTimestamps: true,
    compactMode: false,
    soundEnabled: false, // Disabled since no sounds are implemented
    streamingEnabled: true, // Always enabled
    reasoningEffort: 'medium',
  },
  ui: {
    theme: 'dark', // Default to dark mode
    sidebarCollapsed: false,
    fontSize: 'medium',
    animationsEnabled: true,
    glassEffects: true,
  },
  notifications: {
    newMessageSound: false, // Disabled since no sounds are implemented
    browserNotifications: false,
    emailNotifications: false,
    mentionNotifications: false, // Disabled since users only chat with AI
  },
  advanced: {
    developerMode: false,
    debugMode: false,
    experimentalFeatures: false,
    telemetryEnabled: true,
  },
};

export class PreferencesManager {
  private static cache: AllPreferences | null = null;
  private static listeners: Set<(preferences: AllPreferences) => void> = new Set();

  // Load preferences from database
  static async loadPreferences(): Promise<AllPreferences> {
    try {
      const { data, error } = await getUserPreferences();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let preferences = DEFAULT_PREFERENCES;
      
      if (data?.preferences) {
        // Merge with defaults to ensure all properties exist
        preferences = this.mergePreferences(DEFAULT_PREFERENCES, data.preferences);
      }

      this.cache = preferences;
      this.notifyListeners(preferences);
      
      return preferences;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  // Save preferences to database
  static async savePreferences(preferences: Partial<AllPreferences>): Promise<void> {
    try {
      const currentPreferences = this.cache || DEFAULT_PREFERENCES;
      const updatedPreferences = this.mergePreferences(currentPreferences, preferences);

      await updateUserPreferences({
        preferences: updatedPreferences,
      });

      this.cache = updatedPreferences;
      this.notifyListeners(updatedPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  // Get cached preferences
  static getCachedPreferences(): AllPreferences {
    if (!this.cache) {
      // Initialize cache with defaults if not loaded yet
      this.cache = DEFAULT_PREFERENCES;
    }
    return this.cache;
  }

  // Update specific preference category
  static async updateChatPreferences(preferences: Partial<ChatPreferences>): Promise<void> {
    const current = this.getCachedPreferences();
    await this.savePreferences({
      chat: { ...current.chat, ...preferences },
    });
  }

  static async updateUIPreferences(preferences: Partial<UIPreferences>): Promise<void> {
    const current = this.getCachedPreferences();
    await this.savePreferences({
      ui: { ...current.ui, ...preferences },
    });
  }

  static async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    const current = this.getCachedPreferences();
    await this.savePreferences({
      notifications: { ...current.notifications, ...preferences },
    });
  }

  static async updateAdvancedPreferences(preferences: Partial<AdvancedPreferences>): Promise<void> {
    const current = this.getCachedPreferences();
    await this.savePreferences({
      advanced: { ...current.advanced, ...preferences },
    });
  }

  // Reset to defaults
  static async resetToDefaults(): Promise<void> {
    await this.savePreferences(DEFAULT_PREFERENCES);
  }

  // Export preferences
  static exportPreferences(): string {
    const preferences = this.getCachedPreferences();
    return JSON.stringify(preferences, null, 2);
  }

  // Import preferences
  static async importPreferences(preferencesJson: string): Promise<void> {
    try {
      const preferences = JSON.parse(preferencesJson);
      const validatedPreferences = this.validatePreferences(preferences);
      await this.savePreferences(validatedPreferences);
    } catch (error) {
      throw new Error('Invalid preferences format');
    }
  }

  // Add preference change listener
  static addListener(listener: (preferences: AllPreferences) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Private helper methods
  private static mergePreferences(base: AllPreferences, updates: any): AllPreferences {
    return {
      chat: { ...base.chat, ...updates.chat },
      ui: { ...base.ui, ...updates.ui },
      notifications: { ...base.notifications, ...updates.notifications },
      advanced: { ...base.advanced, ...updates.advanced },
    };
  }

  private static validatePreferences(preferences: any): AllPreferences {
    // Basic validation - ensure structure matches expected format
    const validated = this.mergePreferences(DEFAULT_PREFERENCES, preferences);
    
    // Additional validation can be added here
    if (!['mojo', 'mojo++'].includes(validated.chat.defaultModel)) {
      validated.chat.defaultModel = 'mojo';
    }
    
    if (!['dark', 'light'].includes(validated.ui.theme)) {
      validated.ui.theme = 'dark';
    }

    return validated;
  }

  private static notifyListeners(preferences: AllPreferences): void {
    this.listeners.forEach(listener => {
      try {
        listener(preferences);
      } catch (error) {
        console.error('Error in preference listener:', error);
      }
    });
  }
}

// React hook for preferences
export const usePreferences = () => {
  const [preferences, setPreferences] = React.useState<AllPreferences>(
    PreferencesManager.getCachedPreferences()
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Load preferences on mount
    const loadPrefs = async () => {
      setLoading(true);
      try {
        const prefs = await PreferencesManager.loadPreferences();
        setPreferences(prefs);
      } finally {
        setLoading(false);
      }
    };

    loadPrefs();

    // Listen for preference changes
    const unsubscribe = PreferencesManager.addListener(setPreferences);
    
    return unsubscribe;
  }, []);

  const updatePreferences = React.useCallback(async (updates: Partial<AllPreferences>) => {
    setLoading(true);
    try {
      await PreferencesManager.savePreferences(updates);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    preferences,
    loading,
    updatePreferences,
    updateChatPreferences: PreferencesManager.updateChatPreferences,
    updateUIPreferences: PreferencesManager.updateUIPreferences,
    updateNotificationPreferences: PreferencesManager.updateNotificationPreferences,
    updateAdvancedPreferences: PreferencesManager.updateAdvancedPreferences,
    resetToDefaults: PreferencesManager.resetToDefaults,
    exportPreferences: PreferencesManager.exportPreferences,
    importPreferences: PreferencesManager.importPreferences,
  };
};

// Import React for hooks
import React from 'react';
