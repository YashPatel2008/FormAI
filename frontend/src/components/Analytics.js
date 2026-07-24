import React, { useState } from 'react';
import styled from 'styled-components';
import AIAnalysis from './AIAnalysis';

const AnalyticsContainer = styled.div`
  margin-left: 80px;
  padding: 30px;
  min-height: 100vh;
  background: #121212;
  color: white;
  overflow-x: hidden;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatValue = styled.div`
  font-size: 2.5em;
  font-weight: bold;
  color: #2196F3;
  margin: 10px 0;
`;

const StatLabel = styled.div`
  color: #888;
  font-size: 1.1em;
`;

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  margin-top: 15px;
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const BarChart = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  padding: 20px 40px 30px;
`;

const GridLines = styled.div`
  position: absolute;
  top: 20px;
  left: 40px;
  right: 20px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const GridLine = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
`;

const DataContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 40px;
  right: 20px;
  bottom: 30px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
`;

const BarGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

const Bar = styled.div`
  width: 8px;
  background: ${props => props.color};
  transition: height 0.3s ease;
  border-radius: 2px;
`;

const DateLabel = styled.div`
  margin-top: 8px;
  font-size: 10px;
  color: #666;
  transform: rotate(-45deg);
  transform-origin: top left;
  white-space: nowrap;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? '#2196F3' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
  font-weight: ${props => props.active ? 'bold' : 'normal'};

  &:hover {
    background: ${props => props.active ? '#1976D2' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const ChartTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 1.2em;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ChartScrollContainer = styled.div`
  overflow-x: ${props => props.scroll ? 'auto' : 'hidden'};
  padding-bottom: 20px;
  
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(33, 150, 243, 0.5);
    border-radius: 4px;
  }
`;

const YAxis = styled.div`
  position: absolute;
  left: 0;
  top: 15px;
  bottom: 25px;
  width: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #666;
  font-size: 10px;
`;

const XAxis = styled.div`
  position: absolute;
  left: 40px;
  right: 20px;
  bottom: 0;
  height: 25px;
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 10px;
`;

const XAxisLabel = styled.div`
  position: absolute;
  transform: rotate(-45deg) translateX(-50%);
  transform-origin: top left;
  white-space: nowrap;
`;

const DataLine = styled.svg`
  position: absolute;
  top: 15px;
  left: 40px;
  right: 20px;
  bottom: 25px;
  width: calc(100% - 60px);
  height: calc(100% - 40px);
`;

const DataPoint = styled.circle`
  r: 2.5;
  transition: r 0.2s ease;
  
  &:hover {
    r: 4;
  }
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const Analytics = () => {
  const history = JSON.parse(localStorage.getItem('exerciseHistory') || '[]');
  const [timeView, setTimeView] = useState('week');
  const [tooltip, setTooltip] = useState(null);
  
  // Calculate statistics
  const totalWorkouts = history.length;
  const totalReps = history.reduce((sum, entry) => sum + entry.summary.total_reps, 0);
  
  // Calculate average score while filtering out NaN values
  const validScores = history
    .map(entry => {
      const totalErrors = entry.summary.rep_feedback.filter(f => !f.includes('Perfect form!')).length;
      const score = Math.max(0, Math.round(100 - (totalErrors / entry.summary.total_reps * 100)));
      return isNaN(score) ? null : score;
    })
    .filter(score => score !== null);

  const averageScore = validScores.length > 0
    ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
    : 0;

  // Get performance data based on selected view
  const getPerformanceData = () => {
    if (timeView === 'week') {
      return [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - i));
        const dayData = history.filter(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === date.getTime();
        });
        return {
          date: date.toISOString().split('T')[0],
          reps: dayData.reduce((sum, entry) => sum + entry.summary.total_reps, 0)
        };
      });
    } else {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      
      return [...Array(daysInMonth)].map((_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
        date.setHours(0, 0, 0, 0);
        const dayData = history.filter(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === date.getTime();
        });
        return {
          date: date.toISOString().split('T')[0],
          reps: dayData.reduce((sum, entry) => sum + entry.summary.total_reps, 0)
        };
      });
    }
  };

  // Get form scores over time
  const getFormScores = () => {
    if (timeView === 'week') {
      return [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - i));
        const dayData = history.filter(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === date.getTime();
        });
        
        const dayScores = dayData.map(entry => {
          const totalErrors = entry.summary.rep_feedback.filter(f => !f.includes('Perfect form!')).length;
          return Math.max(0, Math.round(100 - (totalErrors / entry.summary.total_reps * 100)));
        }).filter(score => !isNaN(score));

        return {
          date: date.toISOString().split('T')[0],
          score: dayScores.length > 0
            ? Math.round(dayScores.reduce((sum, score) => sum + score, 0) / dayScores.length)
            : 0
        };
      });
    } else {
      // Monthly view
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      
      return [...Array(daysInMonth)].map((_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
        date.setHours(0, 0, 0, 0);
        const dayData = history.filter(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === date.getTime();
        });
        
        const dayScores = dayData.map(entry => {
          const totalErrors = entry.summary.rep_feedback.filter(f => !f.includes('Perfect form!')).length;
          return Math.max(0, Math.round(100 - (totalErrors / entry.summary.total_reps * 100)));
        }).filter(score => !isNaN(score));

        return {
          date: date.toISOString().split('T')[0],
          score: dayScores.length > 0
            ? Math.round(dayScores.reduce((sum, score) => sum + score, 0) / dayScores.length)
            : 0
        };
      });
    }
  };

  const performanceData = getPerformanceData();
  const formScores = getFormScores();

  const renderChart = (data, valueKey, color) => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d[valueKey]);
    const maxValue = valueKey === 'score' ? 100 : Math.max(...values);

    return (
      <BarChart>
        <GridLines>
          {[...Array(5)].map((_, i) => (
            <GridLine key={i} />
          ))}
        </GridLines>

        <YAxis>
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              {valueKey === 'score' 
                ? `${25 * (4 - i)}%`
                : Math.round((maxValue / 4) * (4 - i))
              }
            </div>
          ))}
        </YAxis>

        <DataContainer>
          {data.map((d, i) => (
            <BarGroup key={i}>
              <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Bar
                  color={color}
                  style={{
                    height: `${(d[valueKey] / maxValue) * 100}%`,
                    minHeight: d[valueKey] > 0 ? '2px' : '0'
                  }}
                  onMouseEnter={() => setTooltip({
                    x: (i / (data.length - 1)) * 100,
                    y: 100 - ((d[valueKey] / maxValue) * 100),
                    value: d[valueKey],
                    date: formatDate(d.date)
                  })}
                  onMouseLeave={() => setTooltip(null)}
                />
              </div>
              <DateLabel>
                {formatDate(d.date)}
              </DateLabel>
            </BarGroup>
          ))}
        </DataContainer>

        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: `${tooltip.x}%`,
              top: `${tooltip.y}%`,
              transform: 'translate(-50%, -100%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {tooltip.date}: {valueKey === 'score' ? `${data[Math.floor(tooltip.x / (100 / (data.length - 1)))][valueKey]}%` : `${data[Math.floor(tooltip.x / (100 / (data.length - 1)))][valueKey]} reps`}
          </div>
        )}
      </BarChart>
    );
  };

  return (
    <AnalyticsContainer>
      <h2>Workout Analytics</h2>
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Workouts</StatLabel>
          <StatValue>{totalWorkouts}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total Reps</StatLabel>
          <StatValue>{totalReps}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Average Form Score</StatLabel>
          <StatValue>{averageScore}%</StatValue>
        </StatCard>
      </StatsGrid>

      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Reps {timeView === 'week' ? 'Last 7 Days' : 'This Month'}</ChartTitle>
          <ViewToggle>
            <ToggleButton 
              active={timeView === 'week'} 
              onClick={() => setTimeView('week')}
            >
              7 Days
            </ToggleButton>
            <ToggleButton 
              active={timeView === 'month'} 
              onClick={() => setTimeView('month')}
            >
              Month
            </ToggleButton>
          </ViewToggle>
        </ChartHeader>
        {renderChart(performanceData, 'reps', '#2196F3')}
      </ChartContainer>

      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Form Score {timeView === 'week' ? 'Last 7 Days' : 'This Month'}</ChartTitle>
        </ChartHeader>
        {renderChart(formScores, 'score', '#4CAF50')}
      </ChartContainer>

      <AIAnalysis />
    </AnalyticsContainer>
  );
};

export default Analytics; 