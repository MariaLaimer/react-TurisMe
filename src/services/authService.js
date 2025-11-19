import axios from 'axios';

const API_URL = 'https://yearling-kakalina-turis-me-169e63c3.koyeb.app';

export async function signIn(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/signin`, { email, password });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error('Requisição inválida.');
      }
      if (error.response.status === 401) {
        throw new Error('Usuário ou senha incorretos.');
      }
    }
    throw new Error('Erro ao autenticar.');
  }
}

export async function signUp(name, email, password, phoneNumber, birthDate) {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password, phoneNumber, birthDate });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error('Requisição inválida.');
      }
      if (error.response.status === 409) {
        throw new Error('Usuário já cadastrado.');
      }
    }
    throw new Error('Erro ao cadastrar usuário.');
  }
}
