import { useState } from 'react';
import api from './api';

const LoginJugador = ({ onLoginSuccess }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(false);
    
    try {
      setLoading(true);
      // Endpoint exclusivo para autenticación de atletas
      const res = await api.post('/api/jugadores/login', { correo, password });
      
      // Guardamos el token y los datos del jugador en el almacenamiento local
      localStorage.setItem('atleta_token', res.data.token);
      localStorage.setItem('atleta_id', res.data.jugador.id);
      
      alert('¡Bienvenido a tu Licencia Digital!');
      onLoginSuccess(res.data.jugador);
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || 'Credenciales incorrectas'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl w-full max-w-md text-center">
        <h2 className="text-3xl font-black text-white mb-2">MVP FLAG</h2>
        <p className="text-blue-400 font-semibold mb-6 uppercase text-xs tracking-wider">Portal del Jugador</p>
        
        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              required
              placeholder="atleta@correo.com"
              className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none transition-all"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2">Contraseña</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-lg transition-all shadow-lg"
          >
            {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginJugador;