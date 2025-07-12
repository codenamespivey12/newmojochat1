'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Image as ImageIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  LibraryBooks as LibraryIcon,
} from '@mui/icons-material';
import { glassStyles } from '@/theme/theme';

interface ToolResultProps {
  type: 'image_generation_call' | 'code_interpreter_call' | 'mcp_call';
  data: any;
}

export const ToolResult: React.FC<ToolResultProps> = ({ type, data }) => {
  const handleDownloadImage = (base64Data: string, filename: string = 'generated-image.png') => {
    try {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${base64Data}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleViewCode = (code: string) => {
    // Open code in a new window or modal
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Code Output</title>
            <style>
              body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #fff; }
              pre { background: #2a2a2a; padding: 15px; border-radius: 8px; overflow: auto; }
            </style>
          </head>
          <body>
            <h2>Code Execution Result</h2>
            <pre>${code}</pre>
          </body>
        </html>
      `);
    }
  };

  if (type === 'image_generation_call') {
    const imageData = data.result || data.image_data;
    const prompt = data.revised_prompt || data.prompt || 'Generated image';

    return (
      <Card
        sx={{
          ...glassStyles.glass,
          backgroundColor: 'rgba(138, 43, 226, 0.1)',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          mb: 2,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ImageIcon sx={{ mr: 1, color: '#8a2be2' }} />
            <Typography variant="h6" sx={{ color: '#8a2be2' }}>
              Image Generated
            </Typography>
            <Chip
              label="AI Art"
              size="small"
              sx={{
                ml: 'auto',
                backgroundColor: 'rgba(138, 43, 226, 0.2)',
                color: '#8a2be2',
              }}
            />
          </Box>

          {prompt && (
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              <strong>Prompt:</strong> {prompt}
            </Typography>
          )}

          {imageData && (
            <Box sx={{ position: 'relative' }}>
              <img
                src={`data:image/png;base64,${imageData}`}
                alt="Generated image"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 1,
                }}
              >
                <Tooltip title="Download Image">
                  <IconButton
                    size="small"
                    onClick={() => handleDownloadImage(imageData)}
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      },
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  if (type === 'code_interpreter_call') {
    const code = data.code || data.input || '';
    const output = data.output || data.result || '';
    const status = data.status || 'completed';

    return (
      <Card
        sx={{
          ...glassStyles.glass,
          backgroundColor: 'rgba(0, 255, 127, 0.1)',
          border: '1px solid rgba(0, 255, 127, 0.3)',
          mb: 2,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CodeIcon sx={{ mr: 1, color: '#00ff7f' }} />
            <Typography variant="h6" sx={{ color: '#00ff7f' }}>
              Code Execution
            </Typography>
            <Chip
              label={status}
              size="small"
              sx={{
                ml: 'auto',
                backgroundColor: status === 'completed' 
                  ? 'rgba(0, 255, 127, 0.2)' 
                  : 'rgba(255, 165, 0, 0.2)',
                color: status === 'completed' ? '#00ff7f' : '#ffa500',
              }}
            />
          </Box>

          {code && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                <strong>Code:</strong>
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{code}</pre>
              </Box>
            </Box>
          )}

          {output && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  <strong>Output:</strong>
                </Typography>
                <Tooltip title="View Full Output">
                  <IconButton
                    size="small"
                    onClick={() => handleViewCode(output)}
                    sx={{ ml: 'auto' }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  maxHeight: '150px',
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  if (type === 'mcp_call') {
    const toolName = data.name || 'Unknown Tool';
    const serverLabel = data.server_label || 'Unknown Server';
    const output = data.output || '';
    const args = data.arguments ? JSON.parse(data.arguments) : {};
    const error = data.error;

    const getServerIcon = () => {
      if (serverLabel === 'exa') return <SearchIcon sx={{ mr: 1, color: '#00bcd4' }} />;
      if (serverLabel === 'context7') return <LibraryIcon sx={{ mr: 1, color: '#9c27b0' }} />;
      return <CodeIcon sx={{ mr: 1, color: '#ff9800' }} />;
    };

    const getServerColor = () => {
      if (serverLabel === 'exa') return '#00bcd4';
      if (serverLabel === 'context7') return '#9c27b0';
      return '#ff9800';
    };

    return (
      <Card
        sx={{
          ...glassStyles.glass,
          backgroundColor: `rgba(${serverLabel === 'exa' ? '0, 188, 212' : serverLabel === 'context7' ? '156, 39, 176' : '255, 152, 0'}, 0.1)`,
          border: `1px solid rgba(${serverLabel === 'exa' ? '0, 188, 212' : serverLabel === 'context7' ? '156, 39, 176' : '255, 152, 0'}, 0.3)`,
          mb: 2,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getServerIcon()}
            <Typography variant="h6" sx={{ color: getServerColor() }}>
              {serverLabel.toUpperCase()} Tool: {toolName}
            </Typography>
            <Chip
              label={error ? 'Error' : 'Success'}
              size="small"
              sx={{
                ml: 'auto',
                backgroundColor: error
                  ? 'rgba(244, 67, 54, 0.2)'
                  : `rgba(${serverLabel === 'exa' ? '0, 188, 212' : serverLabel === 'context7' ? '156, 39, 176' : '255, 152, 0'}, 0.2)`,
                color: error ? '#f44336' : getServerColor(),
              }}
            />
          </Box>

          {Object.keys(args).length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                <strong>Arguments:</strong>
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  p: 1.5,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  overflow: 'auto',
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(args, null, 2)}
                </pre>
              </Box>
            </Box>
          )}

          {(output || error) && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  <strong>{error ? 'Error:' : 'Result:'}</strong>
                </Typography>
                {output && !error && (
                  <Tooltip title="View Full Result">
                    <IconButton
                      size="small"
                      onClick={() => handleViewCode(output)}
                      sx={{ ml: 'auto' }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                  color: error ? '#f44336' : 'inherit',
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {error || output}
                </pre>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};
