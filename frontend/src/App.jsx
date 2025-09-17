import { useState, useEffect } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";
import "monaco-editor/esm/vs/basic-languages/java/java.contribution";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
import { useLocation } from "react-router-dom";
// import HTMLEditor from "./components/HTMLEditor";

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

  //components mounts and gets data from Home.js
  useEffect(() => {
    if(location.state){
        const{ roomId, userName } = location.state;
        setRoomId(roomId);
        setUserName(userName);
        socket.emit("join",{ roomId, userName });
        setJoined(true);
    }
  },[location.state]);

  //listen to update from server
  useEffect(() => {
    socket.on("userJoined", (users) => {
      console.log("user recieved:", users);
      setUsers(users);
    });
    socket.on("codeUpdate", (newCode) => setCode(newCode));

    socket.on("userTyping", (userName) => {
      setTyping(`${userName.slice(0, 8)}... is typing`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => setLanguage(newLanguage));

    socket.on("codeResponse", (response) => {
      setOutPut(response.run.output);
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    };
  }, [roomId, userName]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const leaveRoom = () => {
    socket.emit("leaveRoom", { roomId, userName });
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

  // if(!joined){
  //   return <div className="join-container">Joining room...</div>
  // }

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
      <button onClick={() => {
        if (roomId && userName) {
          socket.emit("join", { roomId, userName });
          setJoined(true);
        }
      }}>
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
          {users.map((user, index) => (
            // <li key={index}>{user.slice(0, 8)}</li>
            <li key={index}>
                {/* {typeof user === "string"
                ? user.slice(0, 8)
                : user?.username?.slice(0, 8) || "Unkown"} */}
                {user.username ? user.username.slice(0, 8) : "Unknown"}
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
        <button className="run-btn" onClick={runCode}>
          Execute
        </button>
        <textarea
          className="output-console"
          value={outPut}
          readOnly
          placeholder="Output ..."
        />
      </div>
    </div>
  );
}
