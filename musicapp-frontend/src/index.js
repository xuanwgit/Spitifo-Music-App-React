import React from "react";
import ReactDOM from "react-dom/client";
// import "./index.css";
import App from "./App";
import { SongsContextProvider } from "./context/SongsContext";
import { AuthContextProvider } from "./context/AuthContext";
import { AlbumsContextProvider } from "./context/AlbumsContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <AlbumsContextProvider>
        <SongsContextProvider>
          <App />
        </SongsContextProvider>
      </AlbumsContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
