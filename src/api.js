import axios from 'axios';

const api = axios.create({
  // Le agregamos el /api al final de la baseURL para que complete la ruta del backend
  baseURL: 'https://mvp-backend-production-0f36.up.railway.app/api'
});

export default api;