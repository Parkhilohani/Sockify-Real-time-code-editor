//Import React and React hooks for state management and navigation
import React, { use, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./Home.css";

//Utility function: Generates a unique 7-digit room ID when "Create Room" is clicked
const generateRoomId = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

function Home() {
  //Local state to store the username and room ID
  // const [userName, setUserName] = useState("");
  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  //Triggered when user clicks "Create New Room"
  const handleCreateRoom = () => {
    // show an alert
    if (!createName.trim()) {
      alert("Please enter your name.");
      return;
    }

    // Generate a new 7-digit unique room ID
    const newRoomId = generateRoomId();

    // Navigate to the Editor page and pass both userName and newRoomId via state
    navigate("/editor", {
      state: {
        roomId: newRoomId,
        userName: createName,
      },
    });
  };

  //Triggered when user wants to join an already existing room
  const handleJoinRoom = () => {
    //show an alert
    if (!joinName.trim() || !roomId.trim()) {
      alert("Please enter both Room ID and your name.");
      return;
    }

    // Navigate to the Editor page with existing roomId and userName
    navigate("/editor", {
      state: {
        roomId,
        userName: joinName,
      },
    });
  };

  return (
    <div className="page-container">
      <div className="join-container">
        <div className="join-box">
          {/* Left Side - Create Room */}
          <div className="join-section">
            <h2>Create New Room</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
            <button onClick={handleCreateRoom}>Create Room</button>
          </div>

          {/* Right Side - Join Room */}
          <div className="join-section">
            <h2>Join Existing Room</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={handleJoinRoom}>Join Room</button>
          </div>
        </div>
      </div>
      <footer className="footer">
        <h3>Created with ❤️ by Parkhi Lohani</h3>
      </footer>
    </div>
  );
}

export default Home;
