import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --background: ${({ theme }) => theme.colors.background};
    --surface: ${({ theme }) => theme.colors.surface};
    --surface-light: ${({ theme }) => theme.colors.surfaceLight};
    --text: ${({ theme }) => theme.colors.text};
    --text-secondary: ${({ theme }) => theme.colors.textSecondary};
    --primary: ${({ theme }) => theme.colors.primary};
    --primary-dark: ${({ theme }) => theme.colors.primaryDark};
    --secondary: ${({ theme }) => theme.colors.secondary};
    --secondary-dark: ${({ theme }) => theme.colors.secondaryDark};
    --border: ${({ theme }) => theme.colors.border};
    --success: ${({ theme }) => theme.colors.success};
    --success-dark: ${({ theme }) => theme.colors.successDark};
    --error: ${({ theme }) => theme.colors.error};
    --error-dark: ${({ theme }) => theme.colors.errorDark};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--background);
    color: var(--text);
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--surface);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--surface-light);
    border-radius: 4px;

    &:hover {
      background: var(--text-secondary);
    }
  }

  /* Focus styles */
  :focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Selection styles */
  ::selection {
    background: var(--primary);
    color: var(--background);
  }
`;

export default GlobalStyles;
