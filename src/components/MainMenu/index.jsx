import "./mainMenu.css";
import { MdTravelExplore } from "react-icons/md";
import { IoPersonSharp } from "react-icons/io5";
import { RxExit } from "react-icons/rx"; // Importado apenas uma vez
import { MdOutlineSettings, MdOutlineSecurity } from "react-icons/md";
import { FiHelpCircle } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { AiFillAlert } from "react-icons/ai";


export const MainMenu = ({ open, onClose, user }) => {
  const { logout } = useAuth();


  return (
    <>
      <div className={`menu-overlay ${open ? "show" : ""}`} onClick={onClose}></div>
      <div className={`side-menu ${open ? "open" : ""}`}>


        <div className="menu-header">
          <div className="menu-avatar-icon"><IoPersonSharp size={32} /></div>
          <h3>{user?.name || "Nome Usuário"}</h3>
        </div>
        <button className="menu-item" onClick={logout}>
          <RxExit size={28}/>
          Sair
        </button>
        <button className="menu-item"><MdTravelExplore size={28}/> Meu Perfil Viajante</button>
        <button className="menu-item"><MdOutlineSettings size={28}/> Configurações Gerais</button>
        <button className="menu-item"><MdOutlineSecurity size={28}/> Dados e Privacidade</button>
        <button className="menu-item"><FiHelpCircle size={28}/> Sobre e Ajuda</button>
        <button className="menu-emergency"><AiFillAlert size={35}/> Emergência!</button>


      </div>
    </>
  );
};