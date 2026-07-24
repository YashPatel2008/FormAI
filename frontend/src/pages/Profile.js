import React, { useState } from 'react';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  padding: 2rem;
  color: var(--text);
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2em;
  margin-bottom: 2rem;
  color: var(--text);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Card = styled.div`
  background: var(--surface);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: var(--text);
  font-size: 0.9em;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 1em;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 1em;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const RadioGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid var(--surface-variant);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text);

  &:hover {
    border-color: var(--primary);
  }

  input {
    width: auto;
  }

  &.selected {
    border-color: var(--primary);
    background: var(--primary-container);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const SaveButton = styled(Button)`
  background: var(--primary);
  color: white;

  &:hover {
    background: var(--primary-dark);
  }
`;

const CancelButton = styled(Button)`
  background: var(--surface-variant);
  color: var(--text);

  &:hover {
    background: var(--surface-dark);
  }
`;

const Message = styled.div`
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  
  &.error {
    background: rgba(255, 87, 87, 0.1);
    border: 1px solid rgba(255, 87, 87, 0.3);
    color: #ff5757;
  }
  
  &.success {
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
    color: #4CAF50;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5em;
  margin: 2rem 0 1rem;
  color: var(--text);
`;

const Profile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fitness_level: 'beginner',
    workout_frequency: 3,
    fitness_goals: 'general_fitness'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('Profile saved (local only, no login).');
  };

  return (
    <ProfileContainer>
      <Title>Profile</Title>
      <Card>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </FormGroup>
          <ButtonGroup>
            <SaveButton type="submit">Save</SaveButton>
          </ButtonGroup>
          {success && <Message className="success">{success}</Message>}
          {error && <Message className="error">{error}</Message>}
        </Form>
      </Card>
    </ProfileContainer>
  );
};

export default Profile;
