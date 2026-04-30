import React from 'react'
import { NavLink } from 'react-router-dom';
import './NavBar.css';

import logo from '../../assets/umbc-logo.png';

const NavBar = ({ isLoggedIn, currentUser, onLogout }) => {
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
        {currentUser?.role === "admin" && (
          <li>
            <NavLink to="/backstock" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Backstock Inventory
            </NavLink>
          </li>
        )}
        {currentUser?.role === "admin" && (
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Reports
            </NavLink>
          </li>
        )}
        {currentUser?.role === "admin" && (
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Settings
            </NavLink>
          </li>
        )}
        <li className="login-link">
          {isLoggedIn ? (
            <>
              <div className="nav-user">
                Signed in as <strong>{currentUser?.username}</strong> ({currentUser?.role})
              </div>
              <button type="button" className="nav-button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Login
            </NavLink>
          )}
        </li>
      </ul>
      
    </div>
  )
}

export default NavBar
