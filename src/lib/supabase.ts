import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

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
  const supabase = createClient();
  
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

// Chat helpers
export const createChat = async (title: string, model: 'mojo' | 'mojo++') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: user.id,
      title,
      model,
    })
    .select()
    .single();

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
