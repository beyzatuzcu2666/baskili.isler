import { createTheme } from '@mui/material/styles';

// Matbaa temasına uygun profesyonel renk paleti
const theme = createTheme({
    palette: {
        primary: {
            main: '#1A365D', // Derin lacivert - güven ve profesyonellik
            light: '#2C5282',
            dark: '#0F2A44',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#D69E2E', // Altın sarısı - premium ve kalite
            light: '#ECC94B',
            dark: '#B7791F',
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#F7FAFC', // Çok açık gri - temiz ve modern
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1A202C', // Koyu gri - okunabilirlik
            secondary: '#4A5568',
        },
        error: {
            main: '#E53E3E',
        },
        warning: {
            main: '#D69E2E',
        },
        info: {
            main: '#3182CE',
        },
        success: {
            main: '#38A169',
        },
        divider: '#E2E8F0',
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
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: 600,
        },
        h5: {
            fontSize: '1.125rem',
            fontWeight: 600,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12, // Yumuşak köşeler
    },
    components: {
        // Card tasarımı
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    borderRadius: 16,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        // Button tasarımı
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-1px)',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #1A365D 0%, #2C5282 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #0F2A44 0%, #1A365D 100%)',
                    },
                },
                outlined: {
                    borderWidth: 2,
                    '&:hover': {
                        borderWidth: 2,
                    },
                },
            },
        },
        // TextField tasarımı
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3182CE',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1A365D',
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        // Paper tasarımı
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    borderRadius: 16,
                },
                elevation1: {
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                },
                elevation3: {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        // AppBar tasarımı
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #1A365D 0%, #2C5282 100%)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        // Drawer tasarımı
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: 'linear-gradient(180deg, #1A365D 0%, #0F2A44 100%)',
                    borderRight: 'none',
                    boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        // Table tasarımı
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: '#F7FAFC',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: '#1A202C',
                        borderBottom: '2px solid #E2E8F0',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: '#F7FAFC',
                        transition: 'background-color 0.2s ease-in-out',
                    },
                },
            },
        },
    },
});

export default theme;
