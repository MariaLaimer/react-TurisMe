import { useEffect, useState } from "react";
import { Navbar } from "../components";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { getPoints, postPoint, deletePoint, updatePoint, toggleFavorite } from '../services/mapService'; 
import { useAuth } from "../contexts/AuthContext";
import { MainMenu } from "../components/MainMenu";
// Importando ícones para InfoWindow
import { IoIosHeart, IoIosHeartEmpty } from 'react-icons/io'; 
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

// --- ESTILOS ---
const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: -23.55052,
  lng: -46.633308,
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '12px',
  boxShadow: '0 4px 25px rgba(0,0,0,0.3)',
  width: '320px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '16px',
  backgroundColor: '#f9f9f9',
  boxSizing: 'border-box'
};

const textareaStyle = {
  ...inputStyle,
  height: '80px',
  resize: 'vertical',
  fontFamily: 'inherit'
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '10px'
};

const actionBtnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '8px 10px',
  borderRadius: '8px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'transform 0.08s ease, box-shadow 0.12s ease',
};

const btnLightBlue = { background: 'linear-gradient(180deg, #A4D9D9 0%, #7FD6E6 100%)', color: '#04293A', boxShadow: '0 4px 12px rgba(124,208,214,0.18)' };
const btnDarkBlue = { background: 'linear-gradient(180deg, #0B293C 0%, #0F144E 100%)', color: '#ffffff', boxShadow: '0 4px 18px rgba(11,41,60,0.28)' };
const btnGreen = { background: 'linear-gradient(180deg, #92ED69 0%, #58C24A 100%)', color: '#04293A', boxShadow: '0 4px 14px rgba(82,197,97,0.18)' };
const btnRed = { background: '#DC3545', color: 'white', boxShadow: '0 4px 14px rgba(220, 53, 69, 0.25)' };
const iconBtnStyle = { padding: '6px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

// --- COMPONENTE PRINCIPAL ---
export const Map = () => {
  const { token, user, logout } = useAuth();
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState(defaultCenter);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(v => !v);

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [tempPoint, setTempPoint] = useState(null); 
  
  const [createTitle, setCreateTitle] = useState(""); 
  const [createDesc, setCreateDesc] = useState(""); 

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [editTitle, setEditTitle] = useState(""); 
  const [editDesc, setEditDesc] = useState("");

  // Carrega a API do Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // 1. Efeito para pegar a localização atual do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log("Erro GPS:", error)
      );
    }
  }, []);

  // 2. Efeito para carregar os marcadores do servidor
  useEffect(() => {
    async function fetchMarkers() {
      if (!token) return;
      try {
        const data = await getPoints(token);
        // CORREÇÃO ESSENCIAL: Mapear os dados para o formato { lat, lng } para o componente Marker
        const formattedData = data.map(point => ({
          ...point, 
          // Cria a chave 'position' no formato esperado pelo GoogleMap Marker
          position: { lat: point.latitude, lng: point.longitude }
        }));
        setMarkers(formattedData);
      } catch (error) {
        console.log("Erro ao carregar:", error.message);
      }
    }
    fetchMarkers();
  }, [token]);

  // --- HANDLERS ---

  const handleMapClick = (event) => {
    setSelectedMarker(null);
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setTempPoint({ lat, lng });
    setCreateTitle(""); 
    setCreateDesc("");
    setIsModalOpen(true);
  };
  
  // NOVO HANDLER: Cancelar criação de ponto
  const handleCancelCreate = () => {
    setIsModalOpen(false);
    setTempPoint(null);
    setCreateTitle("");
    setCreateDesc("");
  };

  const handleConfirmCreate = async () => {
    if (!createTitle.trim() || !tempPoint) {
      alert("O nome do local é obrigatório.");
      return;
    }

    const newPointPayload = {
      latitude: tempPoint.lat,
      longitude: tempPoint.lng,
      title: createTitle, 
      description: createDesc, 
    };

    try {
      const savedPoint = await postPoint(token, newPointPayload);
      
      const pointToDisplay = {
        ...savedPoint, 
        title: createTitle, 
        description: createDesc, 
        // Cria a posição no formato correto para a renderização imediata
        position: { lat: tempPoint.lat, lng: tempPoint.lng }
      };

      setMarkers((prev) => [...prev, pointToDisplay]);
      
      setIsModalOpen(false);
      setTempPoint(null);
      setCreateTitle("");
      setCreateDesc("");

    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const handleFavorite = async () => {
    if (!selectedMarker) return;
    try {
      // O 'favorite' aqui é o estado atual do marcador
      await toggleFavorite(token, selectedMarker.id, selectedMarker.favorite);
      
      setMarkers((prev) => prev.map(m => {
        if (m.id === selectedMarker.id) return { ...m, favorite: !m.favorite };
        return m;
      }));
      
      setSelectedMarker(prev => ({ ...prev, favorite: !prev.favorite }));
    } catch (error) {
      alert("Erro ao favoritar: " + error.message);
    }
  };

  const openEditModal = () => {
    if (!selectedMarker) return;
    setEditTitle(selectedMarker.title || "");
    setEditDesc(selectedMarker.description || "");
    setIsEditModalOpen(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditTitle("");
    setEditDesc("");
  };

  const handleConfirmEdit = async () => {
    if (!selectedMarker || !editTitle.trim()) {
      alert("O nome não pode estar vazio.");
      return;
    }

    try {
        const payload = {
            title: editTitle,
            description: editDesc,
            // Envia para o backend nos nomes esperados: latitude/longitude
            latitude: selectedMarker.position.lat,
            longitude: selectedMarker.position.lng
        };

        await updatePoint(token, selectedMarker.id, payload);
        
        // Atualiza a lista de marcadores com os novos dados
        setMarkers((prev) => prev.map(m => {
            if (m.id === selectedMarker.id) {
                return { ...m, title: editTitle, description: editDesc };
            }
            return m;
        }));

        // Atualiza o InfoWindow aberto, se houver
        setSelectedMarker(prev => ({ ...prev, title: editTitle, description: editDesc }));

        setIsEditModalOpen(false);
        setEditTitle("");
        setEditDesc("");
    } catch (error) {
        alert("Erro ao editar: " + error.message);
        setIsEditModalOpen(false);
    }
  };
  
  // NOVO HANDLER: Abrir modal de deleção
  const openDeleteModal = () => {
      if (!selectedMarker) return;
      setIsDeleteModalOpen(true);
  };
  
  // NOVO HANDLER: Confirmar deleção
  const handleConfirmDelete = async () => {
      if (!selectedMarker) return;
      try {
          await deletePoint(token, selectedMarker.id);
          
          // Remove o marcador da lista
          setMarkers((prev) => prev.filter(m => m.id !== selectedMarker.id));
          
          // Fecha o InfoWindow e o Modal
          setSelectedMarker(null);
          setIsDeleteModalOpen(false);
      } catch (error) {
          alert("Erro ao excluir: " + error.message);
          setIsDeleteModalOpen(false);
      }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <>
      <Navbar onMenuClick={toggleMenu} />
      <MainMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        // As funções de navegação do menu podem ser completadas aqui:
        onLogout={logout}
        onProfile={() => alert("Ir para Meu Perfil Viajante")}
        onConfig={() => alert("Ir para Configurações")}
        onPrivacy={() => alert("Ir para Dados e Privacidade")}
        onHelp={() => alert("Ir para Sobre e Ajuda")}
        onEmergency={() => alert("Chamando emergência...")}
      />

      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onClick={handleMapClick}
            options={{ disableDefaultUI: false, clickableIcons: false }}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                // Agora marker.position existe e está no formato { lat, lng }
                position={marker.position} 
                title={marker.title}
                // Ao clicar, o marker tem o formato completo { id, title, description, position: {lat, lng}, favorite }
                onClick={() => setSelectedMarker(marker)}
              />
            ))}

            {/* Info Window (Visualização do Ponto) */}
            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                  <div style={{ minWidth: '200px', maxWidth:'250px', textAlign: 'center' }}>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 700 }}>
                          {selectedMarker.title} {selectedMarker.favorite && "⭐"}
                      </h3>
                      
                      {selectedMarker.description && (
                          <p style={{ fontSize: '13px', color: '#555', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                              {selectedMarker.description}
                          </p>
                      )}
                      
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                          <button onClick={openEditModal} title="Editar" style={{ ...actionBtnBase, ...btnLightBlue, ...iconBtnStyle }}>
                              <FaEdit size={16} color="#04293A"/>
                          </button>
                          <button onClick={handleFavorite} title="Favoritar" style={{ ...actionBtnBase, ...iconBtnStyle, ...(selectedMarker.favorite ? btnDarkBlue : btnGreen) }}>
                              {selectedMarker.favorite ? <IoIosHeart size={18} color="white"/> : <IoIosHeartEmpty size={18} color="white"/>}
                          </button>
                          <button onClick={openDeleteModal} title="Deletar" style={{ ...actionBtnBase, ...iconBtnStyle, ...btnRed }}>
                              <FaTrashAlt size={16} color="white"/>
                          </button>
                      </div>
                  </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
            <h3>Carregando mapa...</h3>
          </div>
        )}

        {/* --- MODAL DE CRIAÇÃO --- */}
        {isModalOpen && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h3 style={{ margin: 0, color: '#333' }}>Novo Local</h3>
              
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
                    Nome do Ponto:
                </label>
                <input 
                    type="text" 
                    placeholder="Ex: Restaurante da Maria"
                    style={inputStyle}
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    autoFocus
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
                    Descrição (Opcional):
                </label>
                <textarea 
                    placeholder="O que tem de bom aqui?"
                    style={textareaStyle}
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                />
              </div>

              <div style={buttonContainerStyle}>
                  {/* Utilizando handleCancelCreate */}
                  <button onClick={handleCancelCreate} style={{ ...actionBtnBase, backgroundColor: '#e6e6e6', color: '#333' }}>
                      Cancelar
                  </button>
                  <button onClick={handleConfirmCreate} style={{ ...actionBtnBase, ...btnDarkBlue }}>
                      Salvar
                  </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL DE EDIÇÃO --- */}
        {isEditModalOpen && selectedMarker && (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <h3 style={{ margin: 0, color: '#333' }}>Editar Ponto</h3>
                    
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
                            Nome:
                        </label>
                        <input 
                            type="text" 
                            style={inputStyle}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
                            Descrição:
                        </label>
                        <textarea 
                            style={textareaStyle}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                        />
                    </div>
                    
                    <div style={buttonContainerStyle}>
                        <button onClick={handleCancelEdit} style={{ ...actionBtnBase, backgroundColor: '#e6e6e6', color: '#333' }}>
                            Cancelar
                        </button>
                        <button onClick={handleConfirmEdit} style={{ ...actionBtnBase, ...btnDarkBlue }}>
                            Salvar Alteração
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL DE DELEÇÃO --- */}
        {isDeleteModalOpen && selectedMarker && (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <h3 style={{ margin: 0, color: '#DC3545' }}>Confirmar Exclusão</h3>
                    <p style={{ margin: '5px 0', color: '#555' }}>
                        Tem certeza que deseja excluir <strong>{selectedMarker.title}</strong>?
                    </p>
                    
                    <div style={buttonContainerStyle}>
                        <button onClick={() => setIsDeleteModalOpen(false)} style={{ ...actionBtnBase, backgroundColor: '#e6e6e6', color: '#333' }}>
                            Manter
                        </button>
                        {/* Utilizando handleConfirmDelete */}
                        <button onClick={handleConfirmDelete} style={{ ...actionBtnBase, ...btnRed }}>
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </>
  );
};