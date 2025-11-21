import React, { createContext, useContext, useState, useEffect } from "react";

// Criação do contexto
const AuthContext = createContext();

// Hook para usar o contexto
export function useAuth() {
  return useContext(AuthContext);
}

// Provider do contexto
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    // Busca token do sessionStorage ao iniciar
    return sessionStorage.getItem("token") || null;
  }); 

  const [user, setUser] = useState({});

  // Salva no sessionStorage sempre que token mudar
  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", token);
    } else {
      sessionStorage.removeItem("token");
    }
  }, [token]);

  // Função para login
  function login(responseUser) {
    setToken(responseUser.token);
    sessionStorage.setItem("user", JSON.stringify(responseUser));
    setUser(responseUser);
  }
  // Salva no user sempre que atualizar a página
  useEffect(() => {
    if (user.token) return;
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

  },[]) 
 
  // Função para logout
  function logout() {
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}