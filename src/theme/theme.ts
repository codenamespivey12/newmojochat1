import { createTheme } from '@mui/material/styles';
import { red, grey } from '@mui/material/colors';

// Custom color palette for sixtyoneeighty brand
const sixtyoneEightyColors = {
  primary: {
    main: '#000000',
    light: '#333333',
    dark: '#000000',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff0000',
    light: '#ff3333',
    dark: '#cc0000',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0a0a0a',
    paper: 'rgba(20, 20, 20, 0.8)',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassHover: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  error: {
    main: '#f44336',
  },
  warning: {
    main: '#ff9800',
  },
  info: {
    main: '#2196f3',
  },
  success: {
    main: '#4caf50',
  },
};

// Create the main theme
export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    ...sixtyoneEightyColors,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          minHeight: '100vh',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        '*': {
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(20, 20, 20, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 16px rgba(255, 0, 0, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #ff3333 0%, #ff0000 100%)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.3)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '&:hover': {
            borderColor: '#ff0000',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff0000',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(20, 20, 20, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(255, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          },
        },
      },
    },
  },
});

// Glass effect utility styles
export const glassStyles = {
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
  },
  glassHover: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 0, 0, 0.3)',
    },
  },
  glassButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 16px rgba(255, 0, 0, 0.2)',
    },
  },
};

// Enhanced animation utilities
export const animations = {
  fadeIn: {
    '@keyframes fadeIn': {
      '0%': {
        opacity: 0,
        transform: 'translateY(10px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
    animation: 'fadeIn 0.3s ease-out',
  },
  slideIn: {
    '@keyframes slideIn': {
      '0%': {
        opacity: 0,
        transform: 'translateX(-20px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateX(0)',
      },
    },
    animation: 'slideIn 0.4s ease-out',
  },
  slideInRight: {
    '@keyframes slideInRight': {
      '0%': {
        opacity: 0,
        transform: 'translateX(20px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateX(0)',
      },
    },
    animation: 'slideInRight 0.4s ease-out',
  },
  slideUp: {
    '@keyframes slideUp': {
      '0%': {
        opacity: 0,
        transform: 'translateY(20px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
    animation: 'slideUp 0.4s ease-out',
  },
  scaleIn: {
    '@keyframes scaleIn': {
      '0%': {
        opacity: 0,
        transform: 'scale(0.9)',
      },
      '100%': {
        opacity: 1,
        transform: 'scale(1)',
      },
    },
    animation: 'scaleIn 0.3s ease-out',
  },
  pulse: {
    '@keyframes pulse': {
      '0%': {
        transform: 'scale(1)',
      },
      '50%': {
        transform: 'scale(1.05)',
      },
      '100%': {
        transform: 'scale(1)',
      },
    },
    animation: 'pulse 2s ease-in-out infinite',
  },
  typing: {
    '@keyframes typing': {
      '0%': {
        opacity: 0.3,
      },
      '50%': {
        opacity: 1,
      },
      '100%': {
        opacity: 0.3,
      },
    },
    animation: 'typing 1.5s ease-in-out infinite',
  },
  glow: {
    '@keyframes glow': {
      '0%': {
        boxShadow: '0 0 5px rgba(255, 0, 0, 0.3)',
      },
      '50%': {
        boxShadow: '0 0 20px rgba(255, 0, 0, 0.6)',
      },
      '100%': {
        boxShadow: '0 0 5px rgba(255, 0, 0, 0.3)',
      },
    },
    animation: 'glow 2s ease-in-out infinite',
  },
  shimmer: {
    '@keyframes shimmer': {
      '0%': {
        backgroundPosition: '-200px 0',
      },
      '100%': {
        backgroundPosition: 'calc(200px + 100%) 0',
      },
    },
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    backgroundSize: '200px 100%',
    animation: 'shimmer 1.5s infinite',
  },
  bounce: {
    '@keyframes bounce': {
      '0%, 20%, 53%, 80%, 100%': {
        transform: 'translate3d(0,0,0)',
      },
      '40%, 43%': {
        transform: 'translate3d(0, -30px, 0)',
      },
      '70%': {
        transform: 'translate3d(0, -15px, 0)',
      },
      '90%': {
        transform: 'translate3d(0, -4px, 0)',
      },
    },
    animation: 'bounce 1s ease-in-out',
  },
  float: {
    '@keyframes float': {
      '0%': {
        transform: 'translateY(0px)',
      },
      '50%': {
        transform: 'translateY(-10px)',
      },
      '100%': {
        transform: 'translateY(0px)',
      },
    },
    animation: 'float 3s ease-in-out infinite',
  },
  spin: {
    '@keyframes spin': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(360deg)',
      },
    },
    animation: 'spin 1s linear infinite',
  },
  // Utility function for staggered animations
  staggered: (index: number, delay: number = 0.1) => ({
    animationDelay: `${index * delay}s`,
  }),
};

// Gradient utilities
export const gradients = {
  primary: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
  primaryHover: 'linear-gradient(135deg, #ff3333 0%, #ff0000 100%)',
  text: 'linear-gradient(135deg, #ff0000 0%, #ffffff 100%)',
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  card: 'linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(30, 30, 30, 0.6) 100%)',
};

// Spacing utilities
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

// Shadow utilities
export const shadows = {
  glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
  glassHover: '0 12px 40px rgba(0, 0, 0, 0.4)',
  red: '0 4px 16px rgba(255, 0, 0, 0.3)',
  redHover: '0 8px 24px rgba(255, 0, 0, 0.4)',
  card: '0 4px 20px rgba(0, 0, 0, 0.2)',
  cardHover: '0 8px 32px rgba(0, 0, 0, 0.3)',
};

// Responsive breakpoints
export const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '900px',
  lg: '1200px',
  xl: '1536px',
};

export default theme;
