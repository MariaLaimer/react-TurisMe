import axios from 'axios';

const API_URL = 'https://yearling-kakalina-turis-me-169e63c3.koyeb.app';

const getDetailedError = (error, defaultMessage) => {
  const apiError = error.response.data.message || error.response.data.error;

  if (Array.isArray(apiError) && apiError.length > 0) {
    return apiError[0];
  }

  return apiError || defaultMessage;
};

export async function signIn(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/signin`, { email, password });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error(getDetailedError(error, 'Requisição inválida. Verifique os campos.'));
      }
      if (error.response.status === 401) {
        throw new Error('Usuário ou senha incorretos.');
      }
      // Trata outros erros de status (ex: 500)
      throw new Error(`Erro do servidor (${error.response.status}).`);
    } else if (error.request) {
      // CORRIGIDO: Trata a falha de conexão (API offline, CORS, ou rede do cliente)
      throw new Error('Falha na conexão. O servidor pode estar offline ou inacessível.');
    }
    throw new Error('Erro desconhecido ao autenticar.');
  }
}

export async function signUp(name, email, password, phoneNumber, birthDate) {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password, phoneNumber, birthDate });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error(getDetailedError(error, 'Requisição inválida. Verifique se todos os campos estão corretos.'));
      }
      if (error.response.status === 409) {
        throw new Error('Usuário já cadastrado.');
      }
      throw new Error(`Erro do servidor (${error.response.status}).`);
    } else if (error.request) {
      throw new Error('Falha na conexão. O servidor pode estar offline ou inacessível.');
    }
    throw new Error('Erro desconhecido ao cadastrar usuário.');
  }
}