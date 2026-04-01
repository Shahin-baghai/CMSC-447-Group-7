import React from 'react'
import { NavLink } from 'react-router-dom';
import './NavBar.css';

import logo from '../../assets/umbc-logo.png';

const NavBar = ( { isLoggedIn, setIsLoggedIn } ) => {
  const handleLogin = () => {
    setIsLoggedIn(true);
    // gonna have to be more stuff here, but this is it for now
  }

  return (
    <div className="navbar">
      <img src={logo} alt="UMBC Logo" className="logo" />
      <h2 className="nav-title">Vending Machine Inventory Manager</h2>
      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Machine Inventory
          </NavLink>
        </li>
        <li>
          <NavLink to="/backstock" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Backstock Inventory
          </NavLink>
        </li>
        <li>
          <NavLink to="/reports" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Reports
          </NavLink>
        </li>
        <li className="login-link">
          {isLoggedIn ? (
            <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Settings
            </NavLink>
          ) : (
            <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleLogin}>
              Login
            </NavLink>
          )}
        </li>
      </ul>
      
    </div>
  )
}

export default NavBar