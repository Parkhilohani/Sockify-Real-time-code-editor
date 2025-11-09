Real-Time Code Editor

A collaborative real-time code editor built with React, Socket.io, and Monaco Editor.
Multiple users can join the same room, write and edit code together, switch programming languages, and view live updates instantly.

Features
  1.Real-Time Collaboration: Multiple users can join the same room and code together.
  2.Language Support: Supports JavaScript, Python, Java, C++, HTML, and CSS.
  3.Code Synchronization: Code updates reflect live for all users in the same room.
  4.Typing Indicator: Displays when another user is typing.
  5.Language Switching: Changes in selected language are synced across all users.
  6.Code Execution: Run the current code and display the output in a console.
  7.Save & Load Code: Save code files to the server and load previously saved snippets.
  8.Room System: Each session is organized into rooms with unique Room IDs.
  9.Leave & Join Rooms: Join a new session or leave a current one dynamically.

Tech Stack
  1.Frontend
  2.React.js
  3.Monaco Editor
  4.Socket.io Client
  5.React Router
  6.Backend
  7.Node.js
  8.Express.js
  9.Socket.io

Project Structure
real-time-code-editor/
│
├── client/                   
│   ├── src/
│   │   ├── App.js              
│   │   ├── Home.js             
│   │   ├── App.css           
│   │   └── Editor.js
│   │      
│   └── package.json
│
├── server/
│   ├── index.js               
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


<img width="1782" height="878" alt="minor-img1" src="https://github.com/user-attachments/assets/83a1ca2b-677e-4901-9b5e-a2061d05557f" />

<img width="962" height="910" alt="minor-img2" src="https://github.com/user-attachments/assets/26670d4d-b270-41c3-8432-03d2272884bf" />





