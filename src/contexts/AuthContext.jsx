import React, { createContext, useContext, useState, useEffect } from "react";
import Loading from "../pages/Loading";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem("token") || null);
  const [isAuthReady, setIsAuthReady] = useState(false); // NOVO ESTADO


  useEffect(() => {
    setIsAuthReady(true); 
  }, []); 

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", token);
    } else {
      sessionStorage.removeItem("token");
    }
  }, [token]);

  function login(newToken) {
    setToken(newToken);
  }

  function logout() {
    setToken(null);
  }

  if (!isAuthReady) {
    return (
      <Loading/>
    );
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}