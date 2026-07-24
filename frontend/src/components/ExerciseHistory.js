import React, { useState } from 'react';
import styled from 'styled-components';

const HistoryContainer = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
`;

const HistoryTitle = styled.h3`
  color: white;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ExerciseEntry = styled.div`
  background: ${props => props.selected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(76, 175, 80, 0.2);
    transform: translateX(5px);
  }
`;

const DateText = styled.div`
  font-size: 0.9em;
  color: #888;
  margin-bottom: 5px;
`;

const ScoreText = styled.div`
  color: ${props => {
    if (props.score >= 90) return '#4CAF50';
    if (props.score >= 70) return '#FFC107';
    return '#FF5252';
  }};
  font-weight: bold;
`;

const NoHistoryText = styled.div`
  color: #888;
  text-align: center;
  padding: 20px;
`;

const ExerciseHistory = ({ onSelectHistory }) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Get history from localStorage
  const getHistory = () => {
    const history = localStorage.getItem('exerciseHistory');
    return history ? JSON.parse(history) : [];
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry.id);
    onSelectHistory(entry);
  };

  const history = getHistory();

  return (
    <HistoryContainer>
      <HistoryTitle>
        <span>📅</span> Exercise History
      </HistoryTitle>
      
      {history.length > 0 ? (
        history.map((entry) => (
          <ExerciseEntry 
            key={entry.id}
            selected={selectedEntry === entry.id}
            onClick={() => handleSelectEntry(entry)}
          >
            <DateText>
              {new Date(entry.date).toLocaleDateString()} at{' '}
              {new Date(entry.date).toLocaleTimeString()}
            </DateText>
            <div>Bicep Curl - {entry.summary.total_reps} reps</div>
            <ScoreText score={entry.summary.score}>
              Score: {entry.summary.score}%
            </ScoreText>
          </ExerciseEntry>
        ))
      ) : (
        <NoHistoryText>
          No exercise history yet. Complete your first set!
        </NoHistoryText>
      )}
    </HistoryContainer>
  );
};

export default ExerciseHistory; 