import React, { useState } from 'react';
import styled from 'styled-components';
import Summary from './Summary';
import { useNavigate } from 'react-router-dom';

const CalendarContainer = styled.div`
  margin-left: 80px;
  padding: 20px;
  min-height: 100vh;
  background: #121212;
  color: white;
`;

const HistoryContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const DateGroup = styled.div`
  margin-bottom: 30px;
`;

const DateHeader = styled.h2`
  color: #2196F3;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ExerciseCardContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }
`;

const ScoreText = styled.div`
  color: ${props => {
    if (props.score >= 90) return '#4CAF50';
    if (props.score >= 70) return '#FFC107';
    return '#FF5252';
  }};
  font-weight: bold;
  font-size: 1.2em;
`;

const ExerciseCard = ({ exercise, onSelect }) => {
  const totalErrors = exercise.summary.rep_feedback.filter(feedback => !feedback.includes('Perfect form!')).length;
  const score = Math.max(0, Math.round(100 - (totalErrors / exercise.summary.total_reps * 100)));

  return (
    <ExerciseCardContainer onClick={() => onSelect(exercise)}>
      <div>
        <strong>{exercise.type === 'squats' ? 'Squats' : 'Bicep Curl'}</strong> - {exercise.summary.total_reps} reps
      </div>
      <div>
        Time: {new Date(exercise.date).toLocaleTimeString()}
      </div>
      <ScoreText score={score}>
        Score: {score}%
      </ScoreText>
    </ExerciseCardContainer>
  );
};

const CalendarView = () => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const navigate = useNavigate();
  
  // Get history from localStorage and group by date
  const getGroupedHistory = () => {
    const history = JSON.parse(localStorage.getItem('exerciseHistory') || '[]');
    return history.reduce((groups, exercise) => {
      const date = new Date(exercise.date).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(exercise);
      return groups;
    }, {});
  };

  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  const groupedHistory = getGroupedHistory();

  return (
    <CalendarContainer>
      <HistoryContainer>
        {Object.entries(groupedHistory).map(([date, exercises]) => (
          <DateGroup key={date}>
            <DateHeader>{date}</DateHeader>
            {exercises.map((exercise) => (
              <ExerciseCard 
                key={exercise.id} 
                exercise={exercise}
                onSelect={handleSelectExercise}
              />
            ))}
          </DateGroup>
        ))}
      </HistoryContainer>

      {selectedExercise && (
        <Summary
          summary={selectedExercise.summary}
          exerciseType={selectedExercise.type}
          onClose={() => setSelectedExercise(null)}
          isHistoryView={true}
        />
      )}
    </CalendarContainer>
  );
};

export default CalendarView; 