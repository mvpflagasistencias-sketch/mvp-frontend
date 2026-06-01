import axios from 'axios';

const api = axios.create({
  // Usa la variable de entorno en producción (Railway) o la IP del Hotspot en tu local
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.137.138:3001'
});

export default api;