import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 250px;
  background: ${props => props.theme.colors.surface};
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const NavItem = styled.div`
  padding: 10px;
  margin: 5px 0;
  cursor: pointer;
  border-radius: 5px;
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text};

  &:hover {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  }
`;

const ThemeToggle = styled.button`
  padding: 10px;
  margin-top: auto;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const Sidebar = ({ 
  currentView, 
  setCurrentView, 
  isDarkMode, 
  setIsDarkMode,
  children 
}) => {
  return (
    <>
      <SidebarContainer>
        <NavItem 
          active={currentView === 'exercises'}
          onClick={() => setCurrentView('exercises')}
        >
          Exercises
        </NavItem>
        <ThemeToggle onClick={() => setIsDarkMode(!isDarkMode)}>
          Toggle Theme
        </ThemeToggle>
      </SidebarContainer>
      {children}
    </>
  );
};

export default Sidebar; 