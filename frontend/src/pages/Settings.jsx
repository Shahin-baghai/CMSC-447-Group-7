import React from 'react'

const Settings = ({ currentUser }) => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Settings</h1>
      <p>You are logged in as <strong>{currentUser?.username}</strong>.</p>
      <p>This page is now protected and only visible to authenticated users.</p>
    </div>
  )
}

export default Settings
