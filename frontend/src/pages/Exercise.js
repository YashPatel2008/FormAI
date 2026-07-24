import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowBack } from 'react-icons/io5';
import LiveFeed from '../components/LiveFeed';
import axios from 'axios';

const ExerciseContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  padding: 2rem;
  height: 100vh;
`;

const VideoSection = styled.div`
  position: relative;
  height: calc(100vh - 4rem);
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
`;

const StatsPanel = styled(motion.div)`
  background: var(--surface);
  padding: 2rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  h3 {
    margin: 0;
    color: var(--text-secondary);
  }

  .count {
    font-size: 3rem;
    font-weight: 700;
    color: var(--primary);
  }

  .error {
    color: var(--error);
  }

  .success {
    color: var(--success);
  }
`;

const ControlButton = styled(motion.button)`
  padding: 1rem;
  border: none;
  border-radius: 10px;
  background: ${props => props.isTracking ? 'var(--error)' : 'var(--primary)'};
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: auto;
`;

const SummaryModal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--surface);
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  h2 {
    margin: 0 0 1.5rem 0;
    color: var(--text-primary);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: var(--background);
    padding: 1rem;
    border-radius: 10px;
    text-align: center;

    h4 {
      margin: 0;
      color: var(--text-secondary);
    }

    .value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
    }
  }

  .feedback {
    margin-bottom: 1.5rem;

    h3 {
      margin: 0 0 1rem 0;
      color: var(--text-secondary);
    }

    .rep-feedback {
      background: var(--background);
      padding: 1rem;
      border-radius: 10px;
      margin-bottom: 0.5rem;

      &.perfect {
        color: var(--success);
      }

      &.error {
        color: var(--error);
      }
    }
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  
  &.primary {
    background: var(--primary);
    color: white;
  }
  
  &.secondary {
    background: var(--surface-variant);
    color: var(--text-primary);
  }
`;

const Exercise = () => {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const [isTracking, setIsTracking] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [exerciseData, setExerciseData] = useState({
    count: 0,
    errors: [],
    stage: 'down',
    rep_feedback: {},
    points: 0
  });

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get('http://localhost:5000/exercise_data');
          setExerciseData(prev => ({
            ...prev,
            ...response.data
          }));
        } catch (error) {
          console.error('Error fetching exercise data:', error);
        }
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking]);

  const startExercise = async () => {
    try {
      await axios.post('http://localhost:5000/start_exercise', {
        exercise: exerciseId
      });
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting exercise:', error);
    }
  };

  const stopExercise = async () => {
    try {
      setIsTracking(false);
      const response = await axios.post('http://localhost:5000/stop_exercise');
      
      if (response.data.status === 'success') {
        // Save workout data
        const token = localStorage.getItem('token');
        const workoutData = {
          exercise_type: exerciseId,
          reps: exerciseData.count,
          accuracy: calculateAccuracy(),
          errors: exerciseData.rep_feedback || {},
          date: new Date().toISOString()
        };

        await axios.post('http://localhost:5000/auth/save_workout', workoutData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setShowSummary(true);
      }
    } catch (error) {
      console.error('Error stopping exercise:', error);
    }
  };

  const calculateAccuracy = () => {
    if (!exerciseData.rep_feedback || Object.keys(exerciseData.rep_feedback).length === 0) {
      return 100;
    }
    const totalReps = exerciseData.count;
    const perfectReps = Object.values(exerciseData.rep_feedback)
      .filter(feedback => feedback.some(f => f.includes('Perfect'))).length;
    return totalReps > 0 ? Math.round((perfectReps / totalReps) * 100) : 100;
  };

  return (
    <ExerciseContainer>
      <VideoSection>
        <BackButton
          onClick={() => navigate('/exercise-selection')}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <IoArrowBack />
          Back to Exercises
        </BackButton>
        <LiveFeed
          exerciseData={exerciseData}
          exerciseType={exerciseId}
          showOverlay={true}
        />
      </VideoSection>

      <StatsPanel
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h3>Reps</h3>
          <div className="count">{exerciseData.count}</div>
        </div>

        <div>
          <h3>Form Analysis</h3>
          <div className={exerciseData.errors.length > 0 ? 'error' : 'success'}>
            {exerciseData.errors.length > 0 
              ? exerciseData.errors[exerciseData.errors.length - 1]
              : 'Perfect Form!'}
          </div>
        </div>

        <ControlButton
          isTracking={isTracking}
          onClick={() => {
            if (isTracking) {
              stopExercise();
            } else {
              startExercise();
            }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isTracking ? 'Stop Exercise' : 'Start Exercise'}
        </ControlButton>
      </StatsPanel>

      <AnimatePresence>
        {showSummary && (
          <>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSummary(false)}
            />
            <SummaryModal
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h2>Workout Summary</h2>
              <div className="stats">
                <div className="stat-card">
                  <h4>Total Reps</h4>
                  <div className="value">{exerciseData.count}</div>
                </div>
                <div className="stat-card">
                  <h4>Form Accuracy</h4>
                  <div className="value">{calculateAccuracy()}%</div>
                </div>
              </div>

              <div className="feedback">
                <h3>Detailed Feedback</h3>
                {exerciseData.rep_feedback && Object.entries(exerciseData.rep_feedback).map(([rep, feedback]) => (
                  <div 
                    key={rep} 
                    className={`rep-feedback ${feedback.some(f => f.includes('Perfect')) ? 'perfect' : 'error'}`}
                  >
                    <strong>Rep {rep}:</strong>
                    {feedback.map((f, i) => (
                      <div key={i}>{f}</div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="actions">
                <Button 
                  className="secondary"
                  onClick={() => setShowSummary(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </Button>
                <Button 
                  className="primary"
                  onClick={() => {
                    setShowSummary(false);
                    navigate('/exercise-selection');
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Choose Another Exercise
                </Button>
              </div>
            </SummaryModal>
          </>
        )}
      </AnimatePresence>
    </ExerciseContainer>
  );
};

export default Exercise;
