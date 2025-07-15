import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create Supabase client if environment variables are properly set
const isSupabaseConfigured = supabaseUrl && 
                            supabaseAnonKey &&
                            supabaseUrl !== 'your_supabase_url_here' &&
                            supabaseAnonKey !== 'your_supabase_anon_key_here' &&
                            supabaseUrl.startsWith('http');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Database types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  model: 'mojo' | 'mojo++';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    model?: string;
    tokens?: number;
    reasoning_effort?: string;
    tool_calls?: any[];
    attachments?: Array<{
      name: string;
      type: string;
      url: string;
    }>;
  };
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'dark' | 'light';
  default_model: 'mojo' | 'mojo++';
  sidebar_collapsed: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Auth helpers
export const signUp = async (email: string, password: string, fullName?: string) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

// Generate AI-powered chat title based on user message
const generateAIChatTitle = async (userMessage: string): Promise<string> => {
  try {
    // Simple title generation based on message content
    // Extract key topics and create a catchy title
    const message = userMessage.toLowerCase();

    // Holiday/weekend patterns
    if (message.includes('memorial day') && (message.includes('weekend') || message.includes('do'))) {
      return '3 Day Weekend Adventures!';
    }
    if (message.includes('christmas') || message.includes('holiday')) {
      return 'Holiday Planning & Fun';
    }
    if (message.includes('weekend') && message.includes('plan')) {
      return 'Weekend Planning Session';
    }

    // Work/career patterns
    if (message.includes('job') || message.includes('career') || message.includes('interview')) {
      return 'Career & Work Chat';
    }
    if (message.includes('resume') || message.includes('cv')) {
      return 'Resume Building Help';
    }

    // Tech/coding patterns
    if (message.includes('code') || message.includes('programming') || message.includes('debug')) {
      return 'Coding & Development';
    }
    if (message.includes('react') || message.includes('javascript') || message.includes('python')) {
      return 'Programming Help';
    }

    // Creative patterns
    if (message.includes('write') || message.includes('story') || message.includes('creative')) {
      return 'Creative Writing Session';
    }
    if (message.includes('design') || message.includes('art')) {
      return 'Design & Creative Ideas';
    }

    // Learning patterns
    if (message.includes('learn') || message.includes('explain') || message.includes('how to')) {
      return 'Learning & Exploration';
    }
    if (message.includes('help') && message.includes('understand')) {
      return 'Understanding & Help';
    }

    // Food/cooking patterns
    if (message.includes('recipe') || message.includes('cook') || message.includes('food')) {
      return 'Cooking & Recipes';
    }

    // Travel patterns
    if (message.includes('travel') || message.includes('trip') || message.includes('vacation')) {
      return 'Travel Planning';
    }

    // Health/fitness patterns
    if (message.includes('workout') || message.includes('exercise') || message.includes('fitness')) {
      return 'Health & Fitness';
    }

    // General conversation starters
    if (message.includes('hello') || message.includes('hi ') || message.includes('hey')) {
      return 'Friendly Chat';
    }

    // Default: Extract first few meaningful words
    const words = userMessage.split(' ').filter(word =>
      word.length > 2 &&
      !['the', 'and', 'but', 'for', 'are', 'can', 'you', 'what', 'how', 'why', 'when', 'where'].includes(word.toLowerCase())
    );

    if (words.length > 0) {
      const title = words.slice(0, 3).join(' ');
      return title.charAt(0).toUpperCase() + title.slice(1) + ' Discussion';
    }

    // Fallback to timestamp-based title
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `Chat ${timeStr}`;

  } catch (error) {
    console.error('Error generating AI chat title:', error);
    return 'New Chat';
  }
};

// Generate simple fallback title based on model
const generateFallbackTitle = (model: 'mojo' | 'mojo++') => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const modelName = model === 'mojo' ? 'GPT-4.1' : 'O3-Mini';
  return `${modelName} Chat - ${dateStr} ${timeStr}`;
};

// Chat helpers
export const createChat = async (title?: string, model: 'mojo' | 'mojo++' = 'mojo') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Use generated title if none provided
  const chatTitle = title || generateFallbackTitle(model);

  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: user.id,
      title: chatTitle,
      model,
    })
    .select()
    .single();

  return { data, error };
};

// Update chat title based on first user message
export const updateChatTitle = async (chatId: string, userMessage: string) => {
  try {
    const newTitle = await generateAIChatTitle(userMessage);

    const { error } = await supabase
      .from('chats')
      .update({ title: newTitle })
      .eq('id', chatId);

    if (error) throw error;

    return { success: true, title: newTitle };
  } catch (error) {
    console.error('Error updating chat title:', error);
    return { success: false, error };
  }
};

// Delete a chat and all its messages
export const deleteChat = async (chatId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // First delete all messages in the chat
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId);

  if (messagesError) return { data: null, error: messagesError };

  // Then delete the chat itself
  const { data, error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', user.id); // Ensure user can only delete their own chats

  return { data, error };
};

export const getUserChats = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return { data, error };
};

export const getChatMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  return { data, error };
};

export const addMessage = async (
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata?: Message['metadata']
) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      role,
      content,
      metadata,
    })
    .select()
    .single();

  return { data, error };
};

// User preferences helpers
export const getUserPreferences = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return { data, error };
};

export const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
    })
    .select()
    .single();

  return { data, error };
};
