import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import GlobalStyles from './styles/GlobalStyles';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ExerciseSelection from './pages/ExerciseSelection';
import Exercise from './pages/Exercise';
import Layout from './components/Layout';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--background);
  transition: background-color 0.3s ease;
`;

const LayoutWrapper = ({ children }) => (
  <Layout>
    {children}
  </Layout>
);

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <AppContainer>
        <Routes>
          <Route path="/dashboard" element={
            <LayoutWrapper>
              <Dashboard />
            </LayoutWrapper>
          } />
          <Route path="/exercise-selection" element={
            <LayoutWrapper>
              <ExerciseSelection />
            </LayoutWrapper>
          } />
          <Route path="/exercise/:exerciseId" element={
            <LayoutWrapper>
              <Exercise />
            </LayoutWrapper>
          } />
          <Route path="/profile" element={
            <LayoutWrapper>
              <Profile />
            </LayoutWrapper>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
