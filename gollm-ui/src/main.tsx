import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { SessionsProvider } from "./contexts/SessionsContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SessionsProvider>
      <App />
    </SessionsProvider>
  </React.StrictMode>,
);
