import React, { useState, useEffect, use } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MachineInventory from './pages/MachineInventory';

import NavBar from './components/NavBar/NavBar';
import BackstockInventory from './pages/BackstockInventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#fdb414', // UMBC YELLOW
    },
    secondary: {
      main: '#da2128', // UMBC RED
    }
  }
});

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <div style={{ marginLeft: '250px' }}>
        <Routes>
          <Route path="/" element={<MachineInventory />} />
          <Route path="/backstock" element={<BackstockInventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App