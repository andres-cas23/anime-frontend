import axios from 'axios';

const BASE_URL = 'https://anime-backend-pnf2.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Token para peticiones autenticadas
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Auth
export const login = (usuario, password) =>
  api.post('/auth/login', { usuario, password });

export const registro = (usuario, password) =>
  api.post('/auth/registro', { usuario, password });

// Animes
export const getAnimes = () =>
  api.get('/animes');

export const crearAnime = (nombre, descripcion) =>
  api.post('/animes', { nombre, descripcion });

// Personajes
export const getPersonajeByNombre = (nombre, anime) =>
  api.get(`/personajes/${encodeURIComponent(nombre)}`, {
    params: { anime },
  });

export const getPersonajesByAnime = (anime) =>
  api.get(`/personajes/anime/${encodeURIComponent(anime)}`);

export const getImagenesByPersonaje = (id) =>
  api.get(`/personajes/${id}/imagenes`);

export const crearPersonaje = (nombre, edad, poder, anime_id, imagenes) =>
  api.post('/personajes', { nombre, edad, poder, anime_id, imagenes });

export const eliminarAnime = (id) =>
  api.delete(`/animes/${id}`);

export const eliminarPersonaje = (id) =>
  api.delete(`/personajes/${id}`);