export interface DesignToken {
  color: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    success: string;
    warning: string;
    error: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    background: {
      base: string;
      container: string;
      elevated: string;
    };
    border: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
  };
}

export const lightTheme: DesignToken = {
  color: {
    primary: '#1677ff',
    primaryLight: '#e6f4ff',
    primaryDark: '#0958d9',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    text: {
      primary: 'rgba(0, 0, 0, 0.88)',
      secondary: 'rgba(0, 0, 0, 0.65)',
      disabled: 'rgba(0, 0, 0, 0.25)',
    },
    background: {
      base: '#f5f5f5',
      container: '#ffffff',
      elevated: '#ffffff',
    },
    border: '#d9d9d9',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  },
};

export const darkTheme: DesignToken = {
  color: {
    primary: '#4096ff',
    primaryLight: '#162642',
    primaryDark: '#69b1ff',
    success: '#49aa19',
    warning: '#d89614',
    error: '#d32029',
    text: {
      primary: 'rgba(255, 255, 255, 0.85)',
      secondary: 'rgba(255, 255, 255, 0.65)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
    background: {
      base: '#141414',
      container: '#1f1f1f',
      elevated: '#2a2a2a',
    },
    border: '#434343',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  },
};

let currentTheme: 'light' | 'dark' = 'light';

export function getDesignToken(): DesignToken {
  return currentTheme === 'light' ? lightTheme : darkTheme;
}

export function setTheme(theme: 'light' | 'dark') {
  currentTheme = theme;
}

export function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
}
