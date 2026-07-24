import React from 'react';
import styled from 'styled-components';

const ListContainer = styled.div`
  padding: 20px;
`;

const ExerciseItem = styled.div`
  padding: 15px;
  margin: 10px 0;
  background: ${props => props.theme.colors.surface};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ExerciseList = ({ onExerciseSelect }) => {
  const exercises = [
    { id: 1, name: 'Push-ups', description: 'Upper body exercise' },
    { id: 2, name: 'Squats', description: 'Lower body exercise' },
    // Add more exercises as needed
  ];

  return (
    <ListContainer>
      <h2>Exercises</h2>
      {exercises.map(exercise => (
        <ExerciseItem
          key={exercise.id}
          onClick={() => onExerciseSelect(exercise)}
        >
          <h3>{exercise.name}</h3>
          <p>{exercise.description}</p>
        </ExerciseItem>
      ))}
    </ListContainer>
  );
};

export default ExerciseList; 