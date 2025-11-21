import { createContext, useContext, useState, useEffect } from "react";
import Loading from "../pages/Loading";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {

  const [user, setUser] = useState({});
  const [token, setToken] = useState(sessionStorage.getItem("token") || null);
  const [isAuthReady, setIsAuthReady] = useState(false);


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


  // Função para login
  function login(jwtString) {
    setToken(jwtString);
    sessionStorage.setItem("token", jwtString);

    // Criamos um user básico só para manter compatibilidade
    const userObj = { token: jwtString };
    sessionStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);

  }

  useEffect(() => {
    if (user.token) return;
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

  },[]) 

  function logout() {
    setToken(null);
  }

  if (!isAuthReady) {
    return (
      <Loading/>
    );
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}