import React from 'react';
import styled from 'styled-components';

const ExerciseContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #121212;

  .main-content {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .video-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
  }

  .stats-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    background: #1a1a1a;
    padding: 20px;
    transform: translateX(${props => props.isNavOpen ? '0' : '100%'});
    transition: transform 0.3s ease;
  }
`;

const ExerciseInterface = ({ children, isNavOpen }) => {
  return (
    <ExerciseContainer isNavOpen={isNavOpen}>
      {children}
    </ExerciseContainer>
  );
};

export default ExerciseInterface;
