import axios from 'axios';

const BASE_URL = 'https://yearling-kakalina-turis-me-169e63c3.koyeb.app/ws/point';


const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export async function getPoints(token) {
  try {
    const response = await axios.get(BASE_URL, getConfig(token));

    
    return response.data.map(point => ({
      id: point.id,
      title: point.description,
      favorite: point.favorite,
      position: {
        lat: point.latitude,
        lng: point.longitude
      }
    }));
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar pontos');
  }
}

export async function postPoint(token, data) {
  try {
    
    const payload = {
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude
    };

    const response = await axios.post(BASE_URL, payload, getConfig(token));
    const p = response.data;

   
    return {
      id: p.id,
      title: p.description,
      favorite: p.favorite,
      position: { lat: p.latitude, lng: p.longitude }
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao cadastrar ponto');
  }
}

export async function deletePoint(token, id) {
  try {
    await axios.delete(`${BASE_URL}/${id}`, getConfig(token));
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao deletar ponto');
  }
}

export async function updatePoint(token, id, data) {
  try {
    const payload = {
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude
    };

    const response = await axios.put(`${BASE_URL}/${id}`, payload, getConfig(token));
    const p = response.data;

    return {
      id: p.id,
      title: p.description,
      favorite: p.favorite,
      position: { lat: p.latitude, lng: p.longitude }
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar ponto');
  }
}

export async function toggleFavorite(token, id, isFavorite) {
  try {
    const action = isFavorite ? 'unfavorite' : 'favorite';
    // POST para favoritar/desfavoritar
    const response = await axios.post(`${BASE_URL}/${id}/${action}`, {}, getConfig(token));
    
   
    const p = response.data; 
    return {
      id: p.id,
      title: p.description,
      favorite: p.favorite,
      position: { lat: p.latitude, lng: p.longitude }
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao mudar favorito');
  }
}