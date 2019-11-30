import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import History from './components/History';

const Dashboard = () => {
  return (
    <Box my={12}>
      <History />
    </Box>
  );
}

export default Dashboard;
