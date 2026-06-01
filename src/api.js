import axios from 'axios';

const api = axios.create({
  // Forzamos la URL de producción de Railway directamente en internet
  baseURL: 'https://mvp-backend-production-0f36.up.railway.app'
});

export default api;