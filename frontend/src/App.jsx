import { useState, useEffect } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";
import "monaco-editor/esm/vs/basic-languages/java/java.contribution";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
import { useLocation } from "react-router-dom";

const socket = io("http://localhost:5001");

export default function App() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");
  const location = useLocation();
  const [savedCodes, setSavedCodes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [fileName, setFileName] = useState("");

  //components mounts and gets data from Home.js
  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    const savedRoom = localStorage.getItem("roomId");
    if (savedName && savedRoom && !joined) {
      setUserName(savedName);
      setRoomId(savedRoom);
      socket.emit("join", { roomId: savedRoom, userName: savedName });
      setJoined(true);
    }
  }, []);

  //handle navigation from home.jsx
  useEffect(() => {
    if (location.state) {
      const { roomId, userName } = location.state;
      setRoomId(roomId);
      setUserName(userName);
      socket.emit("join", { roomId, userName });
      localStorage.setItem("userName", userName);
      localStorage.setItem("roomId", roomId);
      setJoined(true);
    }
  }, [location.state]);

  //listen to update from server
  useEffect(() => {
    socket.on("userJoined", (users) => setUsers(users));
    socket.on("codeUpdate", (newCode) => setCode(newCode));
    socket.on("userTyping", (userName) => {
      setTyping(`${userName.slice(0, 8)}... is typing`);
      setTimeout(() => setTyping(""), 2000);
    });
    socket.on("languageUpdate", (newLanguage) => setLanguage(newLanguage));
    socket.on("codeResponse", (response) => setOutPut(response.run.output));
    socket.on("loadSavedCodes", (codes) => setSavedCodes(codes));

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
      socket.off("loadSavedCodes");
    };
  }, [roomId, userName]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom",{roomId, userName});
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [roomId, userName]);

  const leaveRoom = () => {
    socket.emit("leaveRoom", { roomId, userName });
    localStorage.removeItem("userName");
    localStorage.removeItem("roomId");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("");
    setLanguage("javascript");
    setUsers([]);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    socket.emit("compileCode", { code, roomId, language, version });
  };

  const exportCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    // Detect file extension based on selected language
    let extension = "txt";
    switch (language) {
      case "javascript":
        extension = "js";
        break;
      case "python":
        extension = "py";
        break;
      case "java":
        extension = "java";
        break;
      case "cpp":
        extension = "cpp";
        break;
      case "html":
        extension = "html";
        break;
      case "css":
        extension = "css";
        break;
    }

    link.download = `spacely_code.${extension}`;
    link.click();
  };

  //save code 
  const saveCodeToDB = () => {
    if (!roomId) {
      alert("Please join a room first!");
      return;
    }
    setShowPopup(true); 
  };

  const confirmSave = () => {
    if (!fileName.trim()) {
      alert("Please enter a file name!");
      return;
    }

    const storedUser = userName || localStorage.getItem("userName"); 
    if (!storedUser) {
      console.log("Saving with:", {
        roomId,
        code,
        userName: storedUser,
        fileName,
      });
      alert("User not found. Please rejoin the room.");
      return;
    }

    socket.emit("saveCode", { roomId, code, userName: storedUser, fileName , userName});
    setShowPopup(false);
    setFileName("");

    socket.off("codeSaved");
    socket.on("codeSaved", (data) => {
      if (data.success) {
        alert("Code saved successfully!");
        socket.emit("getSavedCodes", { roomId });
      } else {
        alert("Failed to save code: " + (data.message || "Unknown error"));
      }
    });
  };

  if (!joined) {
    return (
      <div className="join-container">
        <h2>Join a Room</h2>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button
          onClick={() => {
            if (roomId && userName) {
              // socket.emit("join", { roomId, userName });
              // setJoined(true);
              socket.emit("join", { roomId, userName });
              localStorage.setItem("userName", userName); // ✅ Save to localStorage
              localStorage.setItem("roomId", roomId);
              setJoined(true);
            } else {
              alert("Please enter both Room ID and Name");
            }
          }}
        >
          Join Room
        </button>
      </div>
    );
  }



  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <h2>Code Room: {roomId}</h2>
          <button className="copy-button " onClick={copyRoomId}>
            Copy Id
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <h3>Users in Room:</h3>
        <ul>
          {users &&
            users.map((user, index) => (
              <li key={index}>
                {typeof user === "string"
                  ? user.slice(0, 8)
                  : user?.username
                  ? user.username.slice(0, 8)
                  : "Unknown"}
              </li>
            ))}
        </ul>
        <p className="typing-indicator">{typing}</p>
        {/* to chng environment */}
        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
        <button className="leave-button" onClick={leaveRoom}>
          Leave Room
        </button>
        <div className="saved-codes-panel">
          <h3>Saved Codes</h3>
          <ul>
            {savedCodes.map((item, index) => (
              <li key={index}>
                <div>
                  <strong>{item.savedBy}</strong> - <em>{item.fileName}</em>
                  {/* {new Date(item.savedAt).toLocaleString()} */}
                </div>
                <button
                  onClick={() => {
                    setCode(item.code);
                    socket.emit("codeChange", { roomId, code: item.code });
                  }}
                >
                  Get code
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="editor-wrapper">
        <Editor
          height={"70%"}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
        {/* <button className="run-btn" onClick={runCode}>
          Execute
        </button> */}
        <div className="button-row">
          <button className="run-btn" onClick={runCode}>
            Execute
          </button>
          <button className="save-btn" onClick={saveCodeToDB}>
            Save
          </button>
          <button className="export-btn" onClick={exportCode}>
            Export
          </button>
        </div>
        <textarea
          className="output-console"
          value={outPut}
          readOnly
          placeholder="Output ..."
        />
      </div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Save Code As...</h3>
            <input
              type="text"
              placeholder="Enter file name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
            <div className="popup-buttons">
              <button
                onClick={() => setShowPopup(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={confirmSave} className="confirm-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
