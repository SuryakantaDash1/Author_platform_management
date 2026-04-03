/**
 * Theme Configuration
 * Centralized design tokens and color system
 */

export const theme = {
  // ==================
  // COLORS
  // ==================
  colors: {
    // Brand Colors
    brand: {
      primary: '#3b82f6',
      secondary: '#22c55e',
      accent: '#8b5cf6',
    },

    // Status Colors
    status: {
      success: '#059669',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },

    // Light Mode
    light: {
      background: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6',
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#94a3b8',
      },
      border: '#e5e7eb',
    },

    // Dark Mode
    dark: {
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#334155',
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
      },
      border: '#334155',
    },
  },

  // ==================
  // TYPOGRAPHY
  // ==================
  typography: {
    // Font Families
    fontFamily: {
      sans: "'Inter', system-ui, sans-serif",
      display: "'Poppins', 'Inter', sans-serif",
      mono: "'Fira Code', monospace",
    },

    // Font Sizes
    fontSize: {
      // Display
      'display-1': '4.5rem',      // 72px
      'display-2': '3.75rem',     // 60px
      'display-3': '3rem',        // 48px

      // Headings
      h1: '2.25rem',              // 36px
      h2: '1.875rem',             // 30px
      h3: '1.5rem',               // 24px
      h4: '1.25rem',              // 20px
      h5: '1.125rem',             // 18px
      h6: '1rem',                 // 16px

      // Body
      'body-xl': '1.25rem',       // 20px
      'body-lg': '1.125rem',      // 18px
      body: '1rem',               // 16px
      'body-sm': '0.875rem',      // 14px
      'body-xs': '0.75rem',       // 12px
    },

    // Font Weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    // Line Heights
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // ==================
  // SPACING
  // ==================
  spacing: {
    xs: '0.25rem',      // 4px
    sm: '0.5rem',       // 8px
    md: '1rem',         // 16px
    lg: '1.5rem',       // 24px
    xl: '2rem',         // 32px
    '2xl': '3rem',      // 48px
    '3xl': '4rem',      // 64px
    '4xl': '6rem',      // 96px
    '5xl': '8rem',      // 128px
  },

  // ==================
  // BORDER RADIUS
  // ==================
  borderRadius: {
    none: '0',
    sm: '0.25rem',      // 4px
    md: '0.375rem',     // 6px
    DEFAULT: '0.5rem',  // 8px
    lg: '0.75rem',      // 12px
    xl: '1rem',         // 16px
    '2xl': '1.5rem',    // 24px
    full: '9999px',
  },

  // ==================
  // SHADOWS
  // ==================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // ==================
  // BREAKPOINTS
  // ==================
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
    '4xl': '2560px',
  },

  // ==================
  // Z-INDEX
  // ==================
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // ==================
  // TRANSITIONS
  // ==================
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // ==================
  // COMPONENT CONFIGS
  // ==================
  components: {
    button: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
      },
    },
    input: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
    },
    card: {
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
    },
  },
} as const;

export type Theme = typeof theme;

export default theme;
