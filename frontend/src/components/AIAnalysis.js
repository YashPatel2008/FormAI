import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AnalysisContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  margin-top: 15px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const InsightCard = styled.div`
  background: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196F3;
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
`;

const AIAnalysis = () => {
  const [insights, setInsights] = useState([]);

  // Message variations for different scenarios
  const messageTemplates = {
    form: {
      low: [
        "Your form accuracy is at {score}%. Try counting to 2 on each rep to maintain control.",
        "Focus on quality over speed - your current form score is {score}%.",
        "Take a quick break between sets to reset your form. Current accuracy: {score}%.",
        "Consider recording yourself to check your form. Current score: {score}%."
      ],
      improving: [
        "Nice progress! Form accuracy up by {improvement}% from last session.",
        "Keep it up! Your form is getting more consistent.",
        "You're finding your rhythm - form improved by {improvement}%.",
      ],
      high: [
        "Excellent form control at {score}%! Try maintaining this with higher rep counts.",
        "Great form! Challenge yourself with slightly faster reps while maintaining this accuracy.",
        "Perfect! Now try mixing up your rep patterns while keeping this form quality."
      ]
    },
    progression: {
      steady: [
        "You've maintained {avgReps} reps consistently. Ready to push to {nextGoal}?",
        "Steady performance at {avgReps} reps. Let's aim for {nextGoal} next time!",
        "You're comfortable at {avgReps} reps - time to level up?"
      ],
      improving: [
        "Great progress! You've increased your reps by {improvement} since last week.",
        "You're getting stronger! {improvement} more reps than your previous average.",
        "Keep pushing! You've added {improvement} reps to your routine."
      ],
      declining: [
        "Taking it easier lately? Let's get back to your peak of {maxReps} reps.",
        "Everyone has off days. Your best is {maxReps} reps - you'll get there again!",
        "Focus on form first, then work back up to your best of {maxReps} reps."
      ]
    },
    patterns: [
      "I notice you perform better in {timeOfDay} sessions.",
      "Your form scores peak when you do {bestRepRange} reps per set.",
      "You've shown great consistency on {bestDays}.",
      "Your rest periods of {restTime} seconds seem to work well."
    ]
  };

  useEffect(() => {
    analyzeExerciseData();
  }, []);

  const getRandomMessage = (category, subcategory, data) => {
    // Handle patterns category differently since it has no subcategories
    if (category === 'patterns') {
      const messages = messageTemplates[category];
      const message = messages[Math.floor(Math.random() * messages.length)];
      return message.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
    }

    // For other categories, check if subcategory exists
    if (!messageTemplates[category] || !messageTemplates[category][subcategory]) {
      return null;
    }

    const messages = messageTemplates[category][subcategory];
    const message = messages[Math.floor(Math.random() * messages.length)];
    return message.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
  };

  const analyzeExerciseData = () => {
    const history = JSON.parse(localStorage.getItem('exerciseHistory') || '[]');
    if (history.length < 2) {
      setInsights(['Complete more exercises to receive personalized insights!']);
      return;
    }

    const newInsights = [];
    
    // Get recent and previous data for comparison
    const recent = history.slice(-7);
    const previous = history.slice(-14, -7);

    // Analyze form trends
    const recentFormScores = recent.map(entry => {
      const totalErrors = entry.summary.rep_feedback.filter(f => !f.includes('Perfect form!')).length;
      return Math.max(0, Math.round(100 - (totalErrors / entry.summary.total_reps * 100)));
    });

    const avgRecentForm = Math.round(recentFormScores.reduce((a, b) => a + b, 0) / recentFormScores.length);
    const avgPreviousForm = previous.length ? 
      Math.round(previous.map(entry => {
        const totalErrors = entry.summary.rep_feedback.filter(f => !f.includes('Perfect form!')).length;
        return Math.max(0, Math.round(100 - (totalErrors / entry.summary.total_reps * 100)));
      }).reduce((a, b) => a + b, 0) / previous.length) : 0;

    const formImprovement = avgRecentForm - avgPreviousForm;

    // Add form insight
    const formMessage = avgRecentForm < 70 
      ? getRandomMessage('form', 'low', { score: avgRecentForm })
      : formImprovement > 0 
      ? getRandomMessage('form', 'improving', { improvement: formImprovement })
      : avgRecentForm > 85 
      ? getRandomMessage('form', 'high', { score: avgRecentForm })
      : null;

    if (formMessage) newInsights.push(formMessage);

    // Analyze rep patterns
    const recentReps = recent.map(entry => entry.summary.total_reps);
    const avgRecentReps = Math.round(recentReps.reduce((a, b) => a + b, 0) / recentReps.length);
    const maxReps = Math.max(...recentReps);
    const nextGoal = Math.round(maxReps * 1.1);

    // Add progression insight
    const progressMessage = Math.max(...recentReps) > Math.max(...previous.map(e => e.summary.total_reps))
      ? getRandomMessage('progression', 'improving', { 
          improvement: Math.max(...recentReps) - Math.max(...previous.map(e => e.summary.total_reps))
        })
      : avgRecentReps < Math.max(...previous.map(e => e.summary.total_reps))
      ? getRandomMessage('progression', 'declining', { maxReps })
      : getRandomMessage('progression', 'steady', { avgReps: avgRecentReps, nextGoal });

    if (progressMessage) newInsights.push(progressMessage);

    // Add pattern insight if we have enough data
    if (recent.length >= 3) {
      const timePattern = analyzeTimePatterns(recent);
      const patternMessage = getRandomMessage('patterns', null, timePattern);
      if (patternMessage) newInsights.push(patternMessage);
    }

    setInsights(newInsights.filter(Boolean));
  };

  const analyzeTimePatterns = (data) => {
    // Analyze when user performs best
    const sessions = data.map(entry => ({
      time: new Date(entry.date).getHours(),
      score: entry.summary.rep_feedback.filter(f => f.includes('Perfect form!')).length / entry.summary.total_reps
    }));

    const timeGroups = sessions.reduce((acc, session) => {
      const timeOfDay = session.time < 12 ? 'morning' : session.time < 17 ? 'afternoon' : 'evening';
      if (!acc[timeOfDay]) acc[timeOfDay] = [];
      acc[timeOfDay].push(session.score);
      return acc;
    }, {});

    const bestTime = Object.entries(timeGroups).reduce((best, [time, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return avg > best.avg ? { time, avg } : best;
    }, { time: '', avg: 0 });

    return { timeOfDay: bestTime.time };
  };

  return (
    <AnalysisContainer>
      <h3>AI Training Insights</h3>
      {insights.length > 0 ? (
        insights.map((insight, index) => (
          <InsightCard key={index}>
            {insight}
          </InsightCard>
        ))
      ) : (
        <p>Complete more exercises to receive personalized insights!</p>
      )}
    </AnalysisContainer>
  );
};

export default AIAnalysis; 