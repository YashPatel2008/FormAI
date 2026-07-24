import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiUser, FiTool, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
  transition: background-color 0.3s ease;
`;

const Sidebar = styled.nav`
  width: 250px;
  background: var(--surface);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--surface-light);
  position: fixed;
  height: 100vh;
  transition: all 0.3s ease;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: var(--text);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  font-weight: 500;

  svg {
    font-size: 1.2rem;
  }

  &:hover {
    background: var(--surface-light);
    color: var(--primary);
  }

  &.active {
    background: var(--surface-light);
    color: var(--primary);
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  min-height: 100vh;
`;

const ThemeToggle = styled(motion.button)`
  margin-top: auto;
  background: var(--surface-light);
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary);
    color: var(--background);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const Layout = ({ children }) => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>
          <span>FormAI</span>
        </Logo>
        <NavLink to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          <FiHome />
          Dashboard
        </NavLink>
        <NavLink to="/exercise-selection" className={location.pathname === '/exercise-selection' ? 'active' : ''}>
          <FiTool />
          Exercises
        </NavLink>
        <NavLink to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
          <FiUser />
          Profile
        </NavLink>
        <ThemeToggle
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDarkMode ? <FiSun /> : <FiMoon />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </ThemeToggle>
      </Sidebar>
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
