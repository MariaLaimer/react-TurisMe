import React, { useState } from "react";
import { Navbar, Logo, Title, Input, Button } from "../components";
import { signIn } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "./Loading";


export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    login("Teste");
    navigate("/map");
    try {
      const token = await signIn(email, senha);
      login(token);
      navigate("/map");
    } catch (err) {
      setErro(err.message);
      setLoading(false);
      
    }
  };

  return (
    loading ? <Loading /> : (
    <div className="login-bg min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-4 login-container-overlay rounded-lg shadow-lg">
        <div className="text-center">
          <Logo />
        </div>

        <div className="pt-6 pb-6 text-center">
          <Title title="Turis.me" />
        </div>

        <div className="flex justify-center">
          <div className="login-card">
            <form onSubmit={handleSubmit}>
              <div className="pb-4">
                <Input
                  placeholder="Usuário:"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="pb-2">
                <Input
                  placeholder="Senha:"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              <div className="pb-2 text-center">
                <Link to="/forgot-password" className="text-white hover:underline text-sm">Esqueci minha senha</Link>
              </div>
              {erro && <p style={{ color: "#ffdede" }}>{erro}</p>}

              <div className="text-center pt-4">
                <Button type="submit">Entrar</Button>
              </div>
            </form>

            <div className="text-center pt-6">
              <span className="muted">Não tem uma conta? </span>
              <Link to="/register" className="link-register">Crie uma!</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  );
}