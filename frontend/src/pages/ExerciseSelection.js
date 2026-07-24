import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaDumbbell, FaRunning, FaFire } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem;
  color: var(--text);
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 3rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--primary), transparent);
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    filter: blur(20px);
    opacity: 0.5;
  }
`;

const Title = styled(motion.h1)`
  font-size: 3em;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: inline-block;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.2em;
  max-width: 600px;
`;

const ExerciseGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  perspective: 1000px;
`;

const ExerciseCard = styled(motion.div)`
  background: var(--surface);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 245, 255, 0.1),
      rgba(255, 46, 99, 0.1)
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &::after {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 90deg at 40% -25%,
      var(--background),
      var(--primary),
      var(--primary-dark),
      var(--background),
      var(--background)
    );
    animation: rotate 4s linear infinite;
    z-index: -1;
  }

  @keyframes rotate {
    to {
      transform: rotate(1turn);
    }
  }
`;

const ExerciseIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;

  svg {
    font-size: 1.8rem;
    color: var(--background);
  }

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 17px;
    z-index: -1;
    opacity: 0.5;
  }
`;

const ExerciseTitle = styled.h2`
  font-size: 1.8em;
  margin-bottom: 1rem;
  color: var(--text);
  position: relative;
  z-index: 1;
`;

const ExerciseDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

const StartButton = styled(motion.button)`
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: var(--background);
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transform: translateX(-100%);
  }

  &:hover::before {
    transform: translateX(100%);
    transition: transform 0.5s ease;
  }
`;

const exercises = [
  {
    id: 'bicep_curls',
    title: 'Bicep Curls',
    description: 'Perfect your form with AI-powered tracking. Build stronger, more defined biceps with real-time feedback.',
    icon: <FaDumbbell />,
    color: 'var(--primary)'
  },
  {
    id: 'squats',
    title: 'Squats',
    description: 'Master the fundamental lower body exercise. Get instant feedback on your form and track your progress.',
    icon: <FaRunning />,
    color: 'var(--secondary)'
  }
];

const ExerciseSelection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <Container>
      <Header>
        <Title
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Choose Your Exercise
        </Title>
        <Subtitle>
          Select an exercise to begin your AI-powered workout session. 
          Get real-time form feedback and track your progress.
        </Subtitle>
      </Header>

      <ExerciseGrid
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            variants={cardVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            onClick={() => navigate(`/exercise/${exercise.id}`)}
          >
            <ExerciseIcon style={{ background: exercise.color }}>
              {exercise.icon}
            </ExerciseIcon>
            <ExerciseTitle>{exercise.title}</ExerciseTitle>
            <ExerciseDescription>{exercise.description}</ExerciseDescription>
            <StartButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Exercise
            </StartButton>
          </ExerciseCard>
        ))}
      </ExerciseGrid>
    </Container>
  );
};

export default ExerciseSelection;
