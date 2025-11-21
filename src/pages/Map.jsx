import { useEffect, useState } from "react";
import { Navbar } from "../components";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { getPoints, postPoint, deletePoint, updatePoint, toggleFavorite } from '../services/mapService'; 
import { useAuth } from "../contexts/AuthContext";

const containerStyle = {
  width: "100%",
  height: "100mv",
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
  zIndex: 9999, // Z-Index bem alto para garantir que fique por cima do mapa
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
  margin: '0 5px'
};

export const Map = () => {
  const { token } = useAuth();
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState(defaultCenter);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempPoint, setTempPoint] = useState(null); 
  const [descriptionInput, setDescriptionInput] = useState("");

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // 1. Pegar localização
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

  // 2. Carregar pontos
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

  // --- CLIQUE NO MAPA (Abre Modal) ---
  const handleMapClick = (event) => {
    setSelectedMarker(null); // Fecha info window
    
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setTempPoint({ lat, lng });
    setDescriptionInput(""); 
    setIsModalOpen(true); // ABRE O MODAL
  };

  // --- CONFIRMAR CRIAÇÃO ---
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
      // O postPoint agora retorna { id, title, position: {lat, lng}, favorite }
      const savedPoint = await postPoint(token, newPointPayload);
      
      setMarkers((prev) => [...prev, savedPoint]);
      
      // Fecha e limpa
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

  // --- DELETAR ---
  const handleDelete = async () => {
    if (!selectedMarker) return;
    if (!window.confirm(`Excluir "${selectedMarker.title}"?`)) return;

    try {
      await deletePoint(token, selectedMarker.id);
      setMarkers((prev) => prev.filter(m => m.id !== selectedMarker.id));
      setSelectedMarker(null);
    } catch (error) {
      alert("Erro ao deletar: " + error.message);
    }
  };

  // --- FAVORITAR ---
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

  // --- EDITAR ---
  const handleEdit = async () => {
    if (!selectedMarker) return;
    const novoNome = window.prompt("Novo nome:", selectedMarker.title);
    if (!novoNome || novoNome === selectedMarker.title) return;

    try {
        const payload = {
            description: novoNome,
            latitude: selectedMarker.position.lat,
            longitude: selectedMarker.position.lng
        };
        await updatePoint(token, selectedMarker.id, payload);
        
        setMarkers((prev) => prev.map(m => {
            if (m.id === selectedMarker.id) return { ...m, title: novoNome };
            return m;
        }));
        setSelectedMarker(prev => ({ ...prev, title: novoNome }));
    } catch (error) {
        alert("Erro ao editar: " + error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onClick={handleMapClick}
            options={{
                disableDefaultUI: false, // Garante controles padrão
                clickableIcons: false // Evita clicar em ícones do Google
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
                <div style={{ minWidth: '150px', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                    {selectedMarker.title} {selectedMarker.favorite && "⭐"}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                    <button onClick={handleEdit} title="Editar">✏️</button>
                    <button onClick={handleFavorite} title="Favoritar">
                        {selectedMarker.favorite ? "💔" : "❤️"}
                    </button>
                    <button onClick={handleDelete} title="Deletar">🗑️</button>
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

        {/* --- MODAL CORRIGIDO --- */}
        {isModalOpen && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h3 style={{ margin: 0, color: '#333' }}>Novo Local</h3>
              
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>
                    Nome do Ponto:
                </label>
                
                {/* INPUT BEM VISÍVEL AQUI */}
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
                <button 
                  onClick={handleCancelCreate} 
                  style={{ ...buttonStyle, backgroundColor: '#e0e0e0', color: '#333' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmCreate} 
                  style={{ ...buttonStyle, backgroundColor: '#4285F4', color: 'white' }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};