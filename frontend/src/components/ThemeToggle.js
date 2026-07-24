import React from 'react';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { IoSunny, IoMoon } from 'react-icons/io5';
import { useTheme } from '../context/ThemeContext';

const ToggleButton = styled.button`
  position: absolute;
  bottom: 20px;
  width: 100%;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.hover};
  }

  svg {
    font-size: 20px;
  }
`;

const ThemeToggle = () => {
  const theme = useTheme();

  return (
    <StyledThemeProvider theme={theme}>
      <ToggleButton onClick={theme.toggleTheme}>
        {theme.isDarkMode ? <IoSunny /> : <IoMoon />}
        {theme.isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </ToggleButton>
    </StyledThemeProvider>
  );
};

export default ThemeToggle; 