import React from "react";
import ReactDOM from "react-dom/client";  // for React 18+ use 'react-dom/client'
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";

const rootElement = document.getElementById("root");

// For React 18, use createRoot from 'react-dom/client'
const root = ReactDOM.createRoot(rootElement);

root.render(
  <Router>
    <App />
  </Router>
);
