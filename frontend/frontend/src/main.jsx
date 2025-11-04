import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
// import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx';
import Home from "./Home.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/editor" element={<App/>}/>
    </Routes>
  </BrowserRouter>

  // <StrictMode>
  //   <App />
  // </StrictMode>,
)
