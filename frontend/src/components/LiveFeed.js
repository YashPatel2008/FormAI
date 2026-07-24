import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: #000;
`;

const VideoFeed = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
`;

const FormFeedback = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${props => props.hasErrors ? 'rgba(255, 87, 87, 0.8)' : 'rgba(76, 175, 80, 0.8)'};
  font-weight: 500;
`;

const LiveFeed = ({ exerciseData, exerciseType, showOverlay = true }) => {
  const [feedUrl, setFeedUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeVideoFeed = async () => {
      try {
        setFeedUrl('http://localhost:5000/video_feed?' + new Date().getTime());
      } catch (err) {
        setError('Could not connect to camera feed');
        console.error('Video feed error:', err);
      }
    };

    initializeVideoFeed();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const getFormMessage = (errors) => {
    if (!errors || errors.length === 0) return 'Perfect Form!';
    return errors[errors.length - 1];
  };

  if (error) {
    return (
      <VideoContainer>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
          {error}
        </div>
      </VideoContainer>
    );
  }

  return (
    <VideoContainer>
      {feedUrl && (
        <VideoFeed
          src={feedUrl}
          alt="Exercise Feed"
          onError={() => setError('Could not connect to camera feed')}
        />
      )}
      {showOverlay && (
        <Overlay>
          <FormFeedback hasErrors={exerciseData?.errors?.length > 0}>
            {getFormMessage(exerciseData?.errors)}
          </FormFeedback>
        </Overlay>
      )}
    </VideoContainer>
  );
};

export default LiveFeed;