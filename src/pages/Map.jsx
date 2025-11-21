import { useEffect, useState } from "react";
import { Navbar } from "../components";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { getPoints, postPoint, deletePoint, updatePoint, toggleFavorite } from '../services/mapService'; 
import { useAuth } from "../contexts/AuthContext";
import { MainMenu } from "../components/MainMenu";

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
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
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
  backgroundColor: '#f9f9f9'
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '10px'
};

const buttonStyle = {
  padding: '10px 20px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  flex: 1,
  margin: '0 5px',
  transition: 'background-color 0.2s'
};

// Inline styles for action buttons (keeps changes local to this file)
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

const btnLightBlue = {
    background: 'linear-gradient(180deg, #A4D9D9 0%, #7FD6E6 100%)',
    color: '#04293A',
    boxShadow: '0 4px 12px rgba(124,208,214,0.18)'
};

const btnDarkBlue = {
    background: 'linear-gradient(180deg, #0B293C 0%, #0F144E 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 18px rgba(11,41,60,0.28)'
};

const btnGreen = {
    background: 'linear-gradient(180deg, #92ED69 0%, #58C24A 100%)',
    color: '#04293A',
    boxShadow: '0 4px 14px rgba(82,197,97,0.18)'
};

const iconBtnStyle = {
    padding: '6px 8px',
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
};

export const Map = () => {
  const { token, user, logout } = useAuth();
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState(defaultCenter);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(v => !v);

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de CRIAÇÃO
  const [tempPoint, setTempPoint] = useState(null); 
  const [descriptionInput, setDescriptionInput] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInput, setEditInput] = useState("");

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

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

  useEffect(() => {
    async function fetchMarkers() {
      if (!token) return;
      try {
        const data = await getPoints(token);
        setMarkers(data);
      } catch (error) {
        console.log("Erro ao carregar:", error.message);
      }
    }
    fetchMarkers();
  }, [token]);

  const handleMapClick = (event) => {
    setSelectedMarker(null);
    
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setTempPoint({ lat, lng });
    setDescriptionInput(""); 
    setIsModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!descriptionInput.trim()) {
      alert("Digite um nome para o local.");
      return;
    }

    const newPointPayload = {
      latitude: tempPoint.lat,
      longitude: tempPoint.lng,
      description: descriptionInput,
    };

    try {
      const savedPoint = await postPoint(token, newPointPayload);
      
      setMarkers((prev) => [...prev, savedPoint]);
      setIsModalOpen(false);
      setTempPoint(null);

    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const handleCancelCreate = () => {
    setIsModalOpen(false);
    setTempPoint(null);
  };

  const openDeleteModal = () => {
    if (!selectedMarker) return;
    setSelectedMarker(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMarker) return;

    try {
      await deletePoint(token, selectedMarker.id);
      setMarkers((prev) => prev.filter(m => m.id !== selectedMarker.id));
      setIsDeleteModalOpen(false);
      setSelectedMarker(null);
    } catch (error) {
      alert("Erro ao deletar: " + error.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFavorite = async () => {
    if (!selectedMarker) return;
    try {
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
    setEditInput(selectedMarker.title);
    setSelectedMarker(null);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!selectedMarker || !editInput.trim()) {
      alert("O nome não pode estar vazio.");
      return;
    }
    if (editInput === selectedMarker.title) {
      handleCancelEdit();
      return;
    }

    try {
        const payload = {
            description: editInput,
            latitude: selectedMarker.position.lat,
            longitude: selectedMarker.position.lng
        };
        await updatePoint(token, selectedMarker.id, payload);
        
        setMarkers((prev) => prev.map(m => {
            if (m.id === selectedMarker.id) return { ...m, title: editInput };
            return m;
        }));

        setIsEditModalOpen(false);
        setEditInput("");
    } catch (error) {
        alert("Erro ao editar: " + error.message);
        setIsEditModalOpen(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditInput("");
  };

  return (
    <>
      <Navbar onMenuClick={toggleMenu} />
            <MainMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
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
            options={{
                disableDefaultUI: false,
                clickableIcons: false
            }}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                title={marker.title}
                onClick={() => setSelectedMarker(marker)}
              />
            ))}

            {/* Info Window (Opções) */}
            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                    <div style={{ minWidth: '170px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 700 }}>
                            {selectedMarker.title} {selectedMarker.favorite && "⭐"}
                        </h3>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {/* Editar */}
                            <button
                                onClick={openEditModal}
                                title="Editar"
                                aria-label="Editar"
                                style={{ ...actionBtnBase, ...btnLightBlue }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                ✏️ Editar
                            </button>

                            {/* Favoritar */}
                            <button
                                onClick={handleFavorite}
                                title="Favoritar"
                                aria-label="Favoritar"
                                style={{ ...actionBtnBase, ...iconBtnStyle, ...(selectedMarker.favorite ? btnDarkBlue : btnGreen) }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {selectedMarker.favorite ? '💚 Favorito' : '🤍 Favoritar'}
                            </button>

                            {/* Deletar */}
                            <button
                                onClick={openDeleteModal}
                                title="Deletar"
                                aria-label="Deletar"
                                style={{ ...actionBtnBase, ...btnDarkBlue }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                🗑️ Excluir
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

        {isModalOpen && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h3 style={{ margin: 0, color: '#333' }}>Novo Local</h3>
              
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>
                    Nome do Ponto:
                </label>
                
                <input 
                    type="text" 
                    placeholder="Digite o nome aqui..."
                    style={inputStyle}
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    autoFocus
                />
              </div>

                                <div style={buttonContainerStyle}>
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

        {isEditModalOpen && selectedMarker && (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <h3 style={{ margin: 0, color: '#333' }}>Editar Ponto</h3>
                    
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>
                            Novo Nome para "{selectedMarker.title}":
                        </label>
                        <input 
                            type="text" 
                            placeholder="Digite o novo nome aqui..."
                            style={inputStyle}
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            autoFocus
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

        {/* --- 3. NOVO MODAL DE DELEÇÃO --- */}
        {isDeleteModalOpen && selectedMarker && (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <h3 style={{ margin: 0, color: '#DC3545' }}>Confirmar Exclusão</h3>
                    <p style={{ margin: '5px 0', color: '#555' }}>
                        Tem certeza que deseja excluir o ponto: 
                        <strong>{selectedMarker.title}</strong>? Esta ação é irreversível.
                    </p>
                    
                    <div style={buttonContainerStyle}>
                        <button onClick={() => setIsDeleteModalOpen(false)} style={{ ...actionBtnBase, backgroundColor: '#e6e6e6', color: '#333' }}>
                            Manter
                        </button>
                        <button onClick={handleConfirmDelete} style={{ ...actionBtnBase, backgroundColor: '#DC3545', color: 'white' }}>
                            Excluir Permanentemente
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </>
  );
};