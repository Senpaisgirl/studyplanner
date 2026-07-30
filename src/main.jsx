import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import AuthGate from "./components/AuthGate";

try {
  const raw = localStorage.getItem("studyplanner-app-v1");
  const parsed = raw ? JSON.parse(raw) : null;
  const savedTheme = parsed?.userSettings?.theme;

  const initialTheme =
    savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  document.documentElement.setAttribute("data-theme", initialTheme);
} catch {
  document.documentElement.setAttribute(
    "data-theme",
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate>
      {({ user, logout }) => <App authUser={user} onLogout={logout} />}
    </AuthGate>
  </React.StrictMode>
);