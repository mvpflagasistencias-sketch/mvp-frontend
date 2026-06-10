// src/PerfilJugador.jsx
import { useState, useEffect } from 'react';
import api from './api';
import AvatarEditor from './AvatarEditor'; 

const PerfilJugador = ({ jugadorId, onLogout }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const idActual = jugadorId || localStorage.getItem('atleta_id');
        const res = await api.get(`/api/jugadores/perfil/${idActual}`);
        if (res.data.avatar_config && typeof res.data.avatar_config === 'string') {
          res.data.avatar_config = JSON.parse(res.data.avatar_config);
        }
        setPerfil(res.data);
      } catch (err) {
        console.error("Error al obtener perfil", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [jugadorId]);

  if (loading) return <div className="text-white">Cargando...</div>;
  if (!perfil) return <div className="text-white">Error al cargar perfil.</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="bg-[#1e293b] rounded-[28px] border border-gray-700 shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
        
        {/* Contenedor de Fotografía o Avatar */}
        <div className="w-32 h-32 mx-auto mb-4 bg-[#0f172a] rounded-full border-2 border-blue-500 overflow-hidden shadow-lg flex items-center justify-center">
          {perfil.foto_perfil ? (
            <img src={perfil.foto_perfil} alt="Foto" className="w-full h-full object-cover" />
          ) : (
            <AvatarEditor config={perfil.avatar_config} />
          )}
        </div>

        <h2 className="text-white text-2xl font-black uppercase">{perfil.nombre}</h2>
        <p className="text-[#4ade80] font-extrabold">{perfil.nombre_equipo?.toUpperCase() || 'AGENTE LIBRE'}</p>
        
        <button onClick={onLogout} className="mt-6 text-red-400 font-bold uppercase text-xs">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default PerfilJugador;