# Sockify-Real-time-code-editor
real time coding platform using websocket

Real-Time Code Editor

A collaborative real-time code editor built with React, Socket.io, and Monaco Editor.
Multiple users can join the same room, write and edit code together, switch programming languages, and view live updates instantly.

Features

Real-Time Collaboration: Multiple users can join the same room and code together.

Language Support: Supports JavaScript, Python, Java, C++, HTML, and CSS.

Code Synchronization: Code updates reflect live for all users in the same room.

Typing Indicator: Displays when another user is typing.

Language Switching: Changes in selected language are synced across all users.

Code Execution: Run the current code and display the output in a console.

Save & Load Code: Save code files to the server and load previously saved snippets.

Room System: Each session is organized into rooms with unique Room IDs.

Clipboard Copy: Copy Room ID for sharing.

Leave & Join Rooms: Join a new session or leave a current one dynamically.

Tech Stack
Frontend

React.js

Monaco Editor

Socket.io Client

React Router

Backend

Node.js

Express.js

Socket.io

(Optional) MongoDB for saving user code files

Project Structure
real-time-code-editor/
│
├── client/                     # React frontend
│   ├── src/
│   │   ├── App.js              # Main application logic
│   │   ├── Home.js             # Room join/create UI
│   │   ├── App.css             # Styling
│   │   └── components/
│   │       └── Editor.js       # Monaco editor configuration
│   └── package.json
│
├── server/
│   ├── index.js                # Express + Socket.io server
│   └── package.json
│
└── README.md

Setup Instructions
1. Clone the Repository
git clone https://github.com/your-username/real-time-code-editor.git
cd real-time-code-editor

2. Install Dependencies
For the backend
cd server
npm install

For the frontend
cd ../client
npm install

Running the Project
Step 1: Start the Backend Server
cd server
node index.js


This runs the server at http://localhost:5001.

Step 2: Start the Frontend
cd ../client
npm start


This runs the React frontend at http://localhost:3000.

Usage

Open the app in your browser.

Enter a Room ID and Username to join or create a session.

Share the Room ID with others to collaborate.

All connected users can view each other's edits in real time.

You can switch programming languages, save code, export it, or leave the room anytime.

Environment Variables

You can create a .env file in the server directory to configure environment variables such as:

PORT=5001
MONGO_URI=your_mongodb_connection_string

Future Enhancements

Add user authentication.

Enable multiple tabs or files per session.

Integrate more programming languages.

Improve execution support with container-based environments.

Add version history and diff comparison.

<img width="1782" height="878" alt="minor-img1" src="https://github.com/user-attachments/assets/83a1ca2b-677e-4901-9b5e-a2061d05557f" />


<img width="1782" height="878" alt="minor-img1" src="https://github.com/user-attachments/assets/fc1dd374-d31f-493e-86b2-9587cacbbee6" />



