import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ─────────────────────────────────────────────
// This is the React equivalent of main.dart
//
// Flutter:                    React:
// ─────────────────────────────────────────────
// WidgetsFlutterBinding       ReactDOM.createRoot()
//   .ensureInitialized()
//
// Firebase.initializeApp()    (removed — using MongoDB via backend API)
//
// runApp(const MyApp())       root.render(<App />)
// ─────────────────────────────────────────────

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);