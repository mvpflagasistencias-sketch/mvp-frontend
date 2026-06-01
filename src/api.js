import axios from 'axios';

const api = axios.create({
  // Dejamos solo la raíz de Railway limpia
  baseURL: 'https://mvp-backend-production-0f36.up.railway.app'
});

export default api;