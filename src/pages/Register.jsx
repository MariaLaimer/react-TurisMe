import React, { useState } from "react";
import { Navbar, Logo, Title, Input, Button } from "../components";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../services/authService";

export function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");
        try {
            await signUp(name, email, senha);
            navigate("/login");
        } catch (err) {
            setErro(err.message);
        }
    };

    return (
        <div className="login-bg min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md mx-auto p-0 login-container-overlay rounded-lg shadow-lg">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <div style={{ width: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Logo />
                  </div>
                </div>

                <div className="pt-1 pb-1 text-center">
                  <div className="pt-1 pb-1 text-center">
                      <Title title="Turis.me" />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="login-card">
                    <form onSubmit={handleSubmit}>
                      <div className="pb-2.5">
                        <Input
                          placeholder="Nome:"
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                        />
                      </div>
                      <div className="pb-2.5">
                        <Input
                          placeholder="Email:"
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="pb-2.5">
                        <Input
                          placeholder="Senha:"
                          type="password"
                          required
                          value={senha}
                          onChange={e => setSenha(e.target.value)}
                        />
                      </div>
                      <div className="pb-2.5">
                        <Input
                          placeholder="Confirmar senha:"
                          type="password"
                          required
                          value={senha}
                          onChange={e => setSenha(e.target.value)}
                        />
                      </div>
                      <div className="pb-2.5">
                        <Input
                          placeholder="Número de telefone:"
                          type="telephone"
                          required
                          onChange={e => setNumero(e.target.value)}
                        />
                      </div>
                      <div className="pb-2.5">
                        <Input
                          placeholder="Data de nascimento:"
                          type="text"
                          required
                          onChange={e => (e.target.value)}
                        />
                      </div>

                      {erro && <p style={{ color: "#ffdede" }}>{erro}</p>}

                      <div className="text-center pt-3">
                        <Button type="submit">Criar Conta</Button>
                      </div>
                    </form>

                    <div className="text-center pt-3">
                      <Link to="/login" className="text-white hover:underline">
                        Já tem cadastro? <strong>Faça Login</strong>
                      </Link>
                    </div>
                  </div>
                </div>
            </div>
        </div>
    );
}