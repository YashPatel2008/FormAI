import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  IoBarbell, 
  IoCalendar, 
  IoStatsChart
} from 'react-icons/io5';

const NavContainer = styled.div`
  position: fixed;
  left: ${props => props.isOpen ? '0' : '-80px'};
  top: 0;
  bottom: 0;
  width: 80px;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  z-index: 1000;
`;

const NavButton = styled.button`
  width: 60px;
  height: 60px;
  margin: 10px 0;
  background: ${props => props.active ? 'rgba(255,255,255,0.1)' : 'transparent'};
  border: none;
  border-radius: 12px;
  color: ${props => props.active ? '#fff' : '#666'};
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }
`;

const Navigation = ({ isOpen }) => {
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: IoBarbell, label: 'Exercises' },
    { path: '/progress', icon: IoStatsChart, label: 'Progress' },
    { path: '/calendar', icon: IoCalendar, label: 'Calendar' }
  ];

  return (
    <NavContainer isOpen={isOpen}>
      {navItems.map((item) => (
        <NavButton
          key={item.path}
          onClick={() => navigate(item.path)}
          title={item.label}
        >
          <item.icon />
        </NavButton>
      ))}
    </NavContainer>
  );
};

export default Navigation;
