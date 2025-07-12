'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Button,
  Chip,
  Menu,
  MenuItem,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SmartToy as MojoIcon,
  Psychology as MojoPlusPlusIcon,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';
import { getUserChats, createChat, Chat } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { GradientButton, GlassCard } from '@/components/UI';

interface SidebarProps {
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat }) => {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [newChatModel, setNewChatModel] = useState<'mojo' | 'mojo++'>('mojo');

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const { data, error } = await getUserChats();
      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const handleNewChat = () => {
    setNewChatDialogOpen(true);
  };

  const handleCreateChat = async () => {
    if (!newChatTitle.trim()) return;

    try {
      const { data, error } = await createChat(newChatTitle, newChatModel);
      if (error) throw error;
      
      setNewChatDialogOpen(false);
      setNewChatTitle('');
      setNewChatModel('mojo');
      
      // Reload chats and navigate to new chat
      await loadChats();
      if (data) {
        router.push(`/chat/${data.id}`);
      }
      
      onNewChat();
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleChatClick = (chatId: string) => {
    setSelectedChatId(chatId);
    router.push(`/chat/${chatId}`);
    onNewChat(); // Close sidebar on mobile
  };

  const handleChatMenuOpen = (event: React.MouseEvent<HTMLElement>, chat: Chat) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedChat(chat);
  };

  const handleChatMenuClose = () => {
    setMenuAnchor(null);
    setSelectedChat(null);
  };

  const getModelIcon = (model: 'mojo' | 'mojo++') => {
    return model === 'mojo' ? (
      <MojoIcon sx={{ fontSize: 16, color: '#ffffff' }} />
    ) : (
      <MojoPlusPlusIcon sx={{ fontSize: 16, color: '#ff0000' }} />
    );
  };

  const getModelChip = (model: 'mojo' | 'mojo++') => {
    return (
      <Chip
        label={model === 'mojo' ? 'Mojo' : 'Mojo++'}
        size="small"
        icon={getModelIcon(model)}
        sx={{
          backgroundColor: model === 'mojo' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.2)',
          color: model === 'mojo' ? '#ffffff' : '#ff0000',
          border: `1px solid ${model === 'mojo' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 0, 0, 0.3)'}`,
          '& .MuiChip-label': {
            fontSize: '0.75rem',
            fontWeight: 600,
          },
        }}
      />
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <GradientButton
          fullWidth
          gradient="primary"
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          glowing
        >
          New Chat
        </GradientButton>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.3 }} />

      {/* Chat List */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        <List sx={{ py: 1 }}>
          {chats.map((chat) => (
            <ListItem key={chat.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleChatClick(chat.id)}
                selected={selectedChatId === chat.id}
                sx={{
                  ...glassStyles.glass,
                  ...glassStyles.glassHover,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    borderColor: 'rgba(255, 0, 0, 0.3)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <ChatIcon sx={{ fontSize: 20, opacity: 0.7 }} />
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {chat.title}
                      </Typography>
                      {getModelChip(chat.model)}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      {new Date(chat.updated_at).toLocaleDateString()}
                    </Typography>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleChatMenuOpen(e, chat)}
                  sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {chats.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              opacity: 0.6,
            }}
          >
            <ChatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body2" align="center">
              No chats yet.
              <br />
              Start a new conversation!
            </Typography>
          </Box>
        )}
      </Box>

      {/* Chat Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleChatMenuClose}
        PaperProps={{
          sx: {
            ...glassStyles.glass,
            minWidth: 150,
          },
        }}
      >
        <MenuItem onClick={handleChatMenuClose}>
          <EditIcon sx={{ mr: 2, fontSize: 18 }} />
          Rename
        </MenuItem>
        <MenuItem onClick={handleChatMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 2, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* New Chat Dialog */}
      <Dialog
        open={newChatDialogOpen}
        onClose={() => setNewChatDialogOpen(false)}
        PaperProps={{
          sx: {
            ...glassStyles.glass,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle>Create New Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chat Title"
            fullWidth
            variant="outlined"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Select Model:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={newChatModel === 'mojo' ? 'contained' : 'outlined'}
              onClick={() => setNewChatModel('mojo')}
              startIcon={<MojoIcon />}
              sx={{ flex: 1 }}
            >
              Mojo (GPT-4.1)
            </Button>
            <Button
              variant={newChatModel === 'mojo++' ? 'contained' : 'outlined'}
              onClick={() => setNewChatModel('mojo++')}
              startIcon={<MojoPlusPlusIcon />}
              sx={{ 
                flex: 1,
                ...(newChatModel === 'mojo++' && {
                  background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
                }),
              }}
            >
              Mojo++ (O3)
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateChat}
            variant="contained"
            disabled={!newChatTitle.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
