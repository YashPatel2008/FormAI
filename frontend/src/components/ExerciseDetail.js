import React from 'react';
import styled from 'styled-components';

const DetailContainer = styled.div`
  padding: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin: 10px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const ExerciseDetail = ({
  exercise,
  onBack,
  onStart,
  isStarted,
  isTracking,
  setIsTracking,
  setSummary
}) => {
  return (
    <DetailContainer>
      <Button onClick={onBack}>← Back</Button>
      <h2>{exercise.name}</h2>
      <p>{exercise.description}</p>
      {!isStarted ? (
        <Button onClick={onStart}>Start Exercise</Button>
      ) : (
        <Button 
          onClick={() => {
            setIsTracking(!isTracking);
            if (isTracking) {
              // Here you would normally process the exercise data
              setSummary({
                total_reps: 10,
                score: 85,
                rep_feedback: ['Good form!', 'Keep it up!']
              });
            }
          }}
        >
          {isTracking ? 'Stop' : 'Resume'}
        </Button>
      )}
    </DetailContainer>
  );
};

export default ExerciseDetail; 