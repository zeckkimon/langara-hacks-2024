import React, { useState } from 'react';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, Typography } from '@mui/material';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    age: '',
    location: '',
    language: '',
    responses: []
  });

  const [currentResponse, setCurrentResponse] = useState('');
  const [callEnded, setCallEnded] = useState(false);

  // Handle input change for profile
  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Handle response input change
  const handleResponseChange = (e) => {
    setCurrentResponse(e.target.value);
  };

  // Add response to profile
  const addResponse = () => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      responses: [...prevProfile.responses, currentResponse],
    }));
    setCurrentResponse(''); // Clear the current response input
  };

  // End call and clear profile
  const endCall = () => {
    console.log('Profile data:', profile);
    setCallEnded(true);
    setProfile({
      age: '',
      location: '',
      language: '',
      responses: []
    });
  };

  return (
    <Box sx={{ width: '400px', margin: 'auto', padding: '20px'}}>
      <Typography variant="h4" gutterBottom>User Profile</Typography>
      {!callEnded ? (
        <form>
          <TextField
            label="Age"
            name="age"
            type="number"
            value={profile.age}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Location"
            name="location"
            value={profile.location}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Preferred Language</InputLabel>
            <Select
              name="language"
              value={profile.language}
              onChange={handleChange}
              required
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="h6" gutterBottom>Responses</Typography>
          <TextField
            label="Enter response"
            value={currentResponse}
            onChange={handleResponseChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={addResponse}>
            Add Response
          </Button>

          {/* Display responses */}
          <ul>
            {profile.responses.map((response, index) => (
              <li key={index}>{response}</li>
            ))}
          </ul>

          <Button
            variant="contained"
            color="secondary"
            onClick={endCall}
            sx={{ marginTop: '20px' }}
          >
            End Call
          </Button>
        </form>
      ) : (
        <Box>
          <Typography variant="h5" gutterBottom>Call Ended</Typography>
          <Typography variant="body1">The user profile and responses have been cleared.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;
