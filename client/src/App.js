import React, { useEffect, useState } from 'react'
import Main from './Components/MainComponent/Main'
import Side from './Components/SideComponent/Side'
import io from 'socket.io-client';
import '../src/App.css';
import { Route, Routes } from 'react-router-dom';
import Audio from './Components/Audio/AudioFile';

export default function App() {

  const [username, setUsername] = useState('');
    const [connectedUsers, setConnectedUsers] = useState([]);

    useEffect(() => {
        const socket = io();

        // Receive username from server
        socket.on('username', (username) => {
            setUsername(username);
        });

        // Receive list of connected users from server
        socket.on('all users', (users) => {
            setConnectedUsers(users);
        });

        // Clean up the effect
        return () => {
            socket.disconnect();
        };
    }, []);


  
  return (
    <>
      <main id='AppContainer'>
        <div id='leftSide'>
          <Side connectedUsers={connectedUsers} />
        </div>
        <div id='rightSide'>
          <Main />
        </div>
      </main>

      <Routes>
        <Route path='/audio' element={<Audio />} />
      </Routes>
    </>
  )
}
