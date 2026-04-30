import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import NavBar from './components/NavBar/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import MachineInventory from './pages/MachineInventory';
import BackstockInventory from './pages/BackstockInventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';

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
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!authToken) {
      setCurrentUser(null);
      setAuthChecked(true);
      return;
    }

    fetch('http://localhost:3001/auth/me', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Session expired');
        }
        return data;
      })
      .then((data) => {
        setCurrentUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        setAuthToken('');
        setCurrentUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, [authToken]);

  const handleLogin = ({ token, user }) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setCurrentUser(user);
    setAuthChecked(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken('');
    setCurrentUser(null);
    setAuthChecked(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <NavBar isLoggedIn={Boolean(currentUser)} currentUser={currentUser} onLogout={handleLogout} />
      <div style={{ marginLeft: '250px' }}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute
                isAuthenticated={Boolean(currentUser)}
                authChecked={authChecked}
                currentUser={currentUser}
                allowedRoles={["admin", "employee"]}
              >
                <MachineInventory authToken={authToken} currentUser={currentUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/backstock"
            element={
              <ProtectedRoute
                isAuthenticated={Boolean(currentUser)}
                authChecked={authChecked}
                currentUser={currentUser}
                allowedRoles={["admin"]}
              >
                <BackstockInventory authToken={authToken} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute
                isAuthenticated={Boolean(currentUser)}
                authChecked={authChecked}
                currentUser={currentUser}
                allowedRoles={["admin"]}
              >
                <Reports authToken={authToken} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute
                isAuthenticated={Boolean(currentUser)}
                authChecked={authChecked}
                currentUser={currentUser}
                allowedRoles={["admin"]}
              >
                <Settings currentUser={currentUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={<Login isAuthenticated={Boolean(currentUser)} onLogin={handleLogin} />}
          />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
