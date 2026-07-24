import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaDumbbell, FaFire, FaTrophy, FaBolt } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardContainer = styled.div`
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
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
    filter: blur(30px);
    opacity: 0.3;
  }
`;

const WelcomeTitle = styled(motion.h1)`
  font-size: 3em;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: var(--surface);
  border-radius: 20px;
  padding: 2rem;
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
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;

  svg {
    font-size: 1.5rem;
    color: var(--background);
  }
`;

const StatValue = styled.div`
  font-size: 2.5em;
  font-weight: bold;
  color: var(--text);
  margin: 0.5rem 0;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const ChartCard = styled(motion.div)`
  background: var(--surface);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 245, 255, 0.05),
      rgba(255, 46, 99, 0.05)
    );
  }
`;

const ChartHeading = styled.h2`
  font-size: 1.5em;
  margin-bottom: 2rem;
  color: var(--text);
`;

const WorkoutHistory = styled(motion.div)`
  display: grid;
  gap: 1rem;
`;

const WorkoutCard = styled(motion.div)`
  background: var(--surface);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  cursor: pointer;

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
`;

const WorkoutHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const WorkoutTitle = styled.h3`
  font-size: 1.2em;
  color: var(--text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: var(--primary);
  }
`;

const WorkoutScore = styled.div`
  text-align: right;

  .score {
    font-size: 1.2em;
    font-weight: bold;
    color: var(--success);
  }

  .reps {
    font-size: 0.9em;
    color: var(--text-secondary);
  }
`;

const WorkoutDate = styled.p`
  font-size: 0.9em;
  color: var(--text-secondary);
  margin: 0.5rem 0;
`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalReps: 0,
    averageScore: 0,
    streak: 0
  });
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const fetchWorkoutHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/auth/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const workoutData = response.data.user.workout_data;
      const workouts = [];
      let totalReps = 0;
      let totalScore = 0;
      let workoutCount = 0;

      // Process workout data
      Object.entries(workoutData).forEach(([exercise, sessions]) => {
        sessions.forEach(session => {
          workouts.push({
            exercise_type: exercise,
            date: new Date(session.date).getTime() / 1000,
            total_reps: session.reps,
            score: session.accuracy,
            errors: session.errors
          });
          totalReps += session.reps;
          totalScore += session.accuracy;
          workoutCount++;
        });
      });

      // Sort workouts by date (newest first)
      workouts.sort((a, b) => b.date - a.date);

      // Calculate streak
      const today = new Date().setHours(0, 0, 0, 0);
      const dates = [...new Set(workouts.map(w => 
        new Date(w.date * 1000).setHours(0, 0, 0, 0)
      ))].sort((a, b) => b - a);
      
      let streak = 0;
      let currentDate = today;
      
      for (let date of dates) {
        if (currentDate - date <= 86400000) { // Within 24 hours
          streak++;
          currentDate = date;
        } else {
          break;
        }
      }

      // Update stats
      setStats({
        totalWorkouts: workoutCount,
        totalReps: totalReps,
        averageScore: workoutCount > 0 ? Math.round(totalScore / workoutCount) : 0,
        streak: streak
      });

      // Update workout history
      setWorkoutHistory(workouts);

      // Update chart data
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.setHours(0, 0, 0, 0);
      }).reverse();

      const chartLabels = last7Days.map(d => 
        new Date(d).toLocaleDateString('en-US', { weekday: 'short' })
      );

      const chartScores = last7Days.map(day => {
        const dayWorkouts = workouts.filter(w => 
          new Date(w.date * 1000).setHours(0, 0, 0, 0) === day
        );
        if (dayWorkouts.length === 0) return 0;
        return Math.round(dayWorkouts.reduce((acc, w) => acc + w.score, 0) / dayWorkouts.length);
      });

      setChartData({
        labels: chartLabels,
        datasets: [
          {
            label: 'Form Score',
            data: chartScores,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
          },
        ],
      });

    } catch (error) {
      console.error('Error fetching workout history:', error);
    }
  };

  useEffect(() => {
    fetchWorkoutHistory();

    // Set up an interval to refresh data every minute
    const interval = setInterval(fetchWorkoutHistory, 60000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  };

  return (
    <DashboardContainer>
      <Header>
        <WelcomeTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome back, {/* user?.username */}!
        </WelcomeTitle>
      </Header>
      
      <StatsGrid
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <StatIcon>
            <FaDumbbell />
          </StatIcon>
          <StatValue>{stats.totalWorkouts}</StatValue>
          <StatLabel>Total Workouts</StatLabel>
        </StatCard>

        <StatCard
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <StatIcon>
            <FaFire />
          </StatIcon>
          <StatValue>{stats.totalReps}</StatValue>
          <StatLabel>Total Reps</StatLabel>
        </StatCard>

        <StatCard
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <StatIcon>
            <FaTrophy />
          </StatIcon>
          <StatValue>{stats.averageScore}%</StatValue>
          <StatLabel>Average Form Score</StatLabel>
        </StatCard>

        <StatCard
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <StatIcon>
            <FaBolt />
          </StatIcon>
          <StatValue>{stats.streak}</StatValue>
          <StatLabel>Day Streak</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ChartHeading>Weekly Progress</ChartHeading>
        <div style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </ChartCard>

      <WorkoutHistory
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {workoutHistory.length === 0 ? (
          <motion.p
            variants={itemVariants}
            style={{ color: 'var(--text-secondary)' }}
          >
            No workouts recorded yet.
          </motion.p>
        ) : (
          workoutHistory.map((workout, index) => (
            <WorkoutCard
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <WorkoutHeader>
                <WorkoutTitle>
                  <FaDumbbell />
                  {workout.exercise_type.charAt(0).toUpperCase() +
                    workout.exercise_type.slice(1).replace('_', ' ')}
                </WorkoutTitle>
                <WorkoutScore>
                  <div className="score">{workout.score}%</div>
                  <div className="reps">{workout.total_reps} reps</div>
                </WorkoutScore>
              </WorkoutHeader>
              <WorkoutDate>
                {new Date(workout.date * 1000).toLocaleString()}
              </WorkoutDate>
            </WorkoutCard>
          ))
        )}
      </WorkoutHistory>
    </DashboardContainer>
  );
};

export default Dashboard;
