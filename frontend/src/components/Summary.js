import React, { useState } from 'react';
import styled from 'styled-components';

const SummaryOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const SummaryContent = styled.div`
  background: #2a2a2a;
  padding: 30px;
  border-radius: 15px;
  width: 80%;
  max-width: 600px;
  color: white;
  max-height: 90vh;
  overflow-y: auto;
`;

const Score = styled.div`
  font-size: 3em;
  text-align: center;
  margin: 20px 0;
  color: ${props => {
    if (props.score >= 90) return '#4CAF50';
    if (props.score >= 70) return '#FFC107';
    return '#FF5252';
  }};
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

const FeedbackItem = styled.div`
  padding: 8px;
  margin: 5px 0;
  background: ${props => props.isPerfect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)'};
  border-radius: 5px;
`;

const ImprovementSection = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 193, 7, 0.2);
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.finish) return '#FF5252';
    if (props.primary) return '#4CAF50';
    return '#2196F3';
  }};
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const ExemplarModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1a1a1a;
  padding: 20px;
  border-radius: 15px;
  z-index: 1100;
  width: 90%;
  max-width: 800px;

  video {
    width: 100%;
    border-radius: 10px;
  }
`;

const getImprovements = (feedback, exerciseType) => {
  const errorCounts = feedback.reduce((counts, fb) => {
    if (exerciseType === 'bicep_curl') {
      if (fb.includes('Swinging')) counts.swinging = (counts.swinging || 0) + 1;
      if (fb.includes('Moving too fast')) counts.speed = (counts.speed || 0) + 1;
    } 
    else if (exerciseType === 'squats') {
      if (fb.includes('Knees wobbling')) counts.knees = (counts.knees || 0) + 1;
      if (fb.includes('Not squatting deep enough')) counts.depth = (counts.depth || 0) + 1;
      if (fb.includes('Moving too fast')) counts.speed = (counts.speed || 0) + 1;
    }
    return counts;
  }, {});

  const improvements = [];
  const totalReps = feedback.length;

  if (exerciseType === 'squats') {
    if (errorCounts.knees) {
      const kneePercentage = (errorCounts.knees / totalReps) * 100;
      if (kneePercentage > 50) {
        improvements.push('Focus on keeping your knees stable and tracking over your toes. Try using a resistance band around your knees during warm-up sets.');
      }
    }
    if (errorCounts.depth) {
      const depthPercentage = (errorCounts.depth / totalReps) * 100;
      if (depthPercentage > 50) {
        improvements.push('Work on achieving proper depth. Try box squats to learn the correct depth feeling.');
      }
    }
    if (errorCounts.speed) {
      improvements.push('Control your descent speed. Try counting to 3 on the way down.');
    }
  }

  if (exerciseType === 'bicep_curl') {
    // Add improvements based on error frequency
    if (errorCounts.swinging) {
      const swingingPercentage = (errorCounts.swinging / totalReps) * 100;
      if (swingingPercentage > 75) {
        improvements.push('Major form correction needed: Your elbow is moving significantly during most reps. Try practicing with lighter weights while focusing on keeping your elbow fixed to your side.');
      } else if (swingingPercentage > 50) {
        improvements.push('Focus on stabilizing your elbows. Try doing the exercise next to a wall to prevent swinging.');
      } else {
        improvements.push('Watch for occasional swinging. Keep your elbows locked throughout the movement.');
      }
    }

    if (errorCounts.speed) {
      const speedPercentage = (errorCounts.speed / totalReps) * 100;
      if (speedPercentage > 75) {
        improvements.push('Significantly slow down your reps. Try counting to 2 on the down phases of each rep.');
      } else if (speedPercentage > 50) {
        improvements.push('Work on maintaining a consistent, controlled pace throughout your set.');
      } else {
        improvements.push('Remember to maintain control and avoid rushing through some reps.');
      }
    }
  }

  // Add general improvements based on overall performance
  const totalErrors = Object.values(errorCounts).reduce((a, b) => a + b, 0);
  const errorPercentage = (totalErrors / totalReps) * 100;

  if (errorPercentage > 80) {
    improvements.push('Consider reducing the weight to focus on proper form first.');
  } else if (errorPercentage < 20 && totalReps >= 8) {
    improvements.push('Great form!');
  }

  return improvements;
};

const Summary = ({ summary, onClose, exerciseType }) => {
  const [showExemplar, setShowExemplar] = useState(false);
  
  // Calculate perfect reps
  const perfectReps = summary.rep_feedback.filter(feedback => feedback.includes('Perfect form!')).length;
  
  // Calculate score based on perfect reps / total reps
  const score = Math.round((perfectReps / summary.total_reps) * 100);
  
  // Get improvements if there are errors
  const improvements = getImprovements(summary.rep_feedback, exerciseType);

  const handleNewSet = () => {
    onClose();
  };

  return (
    <SummaryOverlay>
      <CloseButton onClick={onClose}>×</CloseButton>
      <SummaryContent>
        <h2>Workout Summary</h2>
        <Score score={score}>{score}%</Score>
        
        <h3>Stats</h3>
        <StatRow>
          <span>Exercise Type:</span>
          <span>{exerciseType === 'squats' ? 'Squats' : 'Bicep Curl'}</span>
        </StatRow>
        <StatRow>
          <span>Total Reps:</span>
          <span>{summary.total_reps}</span>
        </StatRow>
        <StatRow>
          <span>Total Errors:</span>
          <span>{summary.total_reps - perfectReps}</span>
        </StatRow>
        
        <h3>Form Breakdown</h3>
        {summary.rep_feedback.map((feedback, index) => (
          <FeedbackItem 
            key={index}
            isPerfect={feedback.includes('Perfect form!')}
          >
            {feedback}
          </FeedbackItem>
        ))}

        {improvements.length > 0 && (
          <ImprovementSection>
            <h3>💡 Improvements for Next Time</h3>
            <ul>
              {improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </ImprovementSection>
        )}

        <ButtonContainer>
          <ActionButton primary onClick={handleNewSet}>
            New Set
          </ActionButton>
          <ActionButton onClick={() => setShowExemplar(true)}>
            View Exemplar
          </ActionButton>
        </ButtonContainer>
      </SummaryContent>

      {showExemplar && (
        <ExemplarModal>
          <CloseButton onClick={() => setShowExemplar(false)}>×</CloseButton>
          <h3>Perfect {exerciseType === 'squats' ? 'Squat' : 'Bicep Curl'} Form</h3>
          <video controls autoPlay loop>
            <source 
              src={exerciseType === 'squats' 
                ? "https://your-domain.com/assets/squat-example.mp4"
                : "https://your-domain.com/assets/bicep-curl-example.mp4"
              } 
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            {exerciseType === 'squats' 
              ? 'Notice the depth, knee stability, and controlled movement'
              : 'Notice the controlled movement and stable upper arm position'
            }
          </p>
        </ExemplarModal>
      )}
    </SummaryOverlay>
  );
};

export default Summary; 