import { useState, useEffect } from 'react';
import api from './api';
// IMPORTAMOS EL EDITOR DE AVATAR QUE CREAMOS
import AvatarEditor from './AvatarEditor'; 

const PerfilJugador = ({ jugadorId, onLogout }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const idActual = jugadorId || localStorage.getItem('atleta_id');
        const res = await api.get(`/api/jugadores/perfil/${idActual}`);
        // IMPORTANTE: Si avatar_config llega como string, lo parseamos a objeto
        if (res.data.avatar_config && typeof res.data.avatar_config === 'string') {
          res.data.avatar_config = JSON.parse(res.data.avatar_config);
        }
        setPerfil(res.data);
      } catch (err) {
        console.error("Error al obtener perfil del atleta", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [jugadorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-bold">
        Cargando Licencia Digital...
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-bold">
        ⚠️ No se encontró la información del perfil.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      {/* Tarjeta Tipo Licencia Digital */}
      <div className="bg-[#1e293b] rounded-[28px] border border-gray-700 shadow-2xl w-full max-w-sm overflow-hidden text-center">
        
        {/* Cabecera de la Licencia */}
        <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] py-5">
          <span className="text-[#60a5fa] text-[10px] font-black tracking-widest block mb-1">LICENCIA DIGITAL MVP</span>
          <h3 className="text-white text-xl font-black">ATLETA VERIFICADO</h3>
        </div>

        {/* Cuerpo de la Licencia */}
        <div className="p-6 flex flex-col items-center gap-4">
          
          {/* Contenedor de Fotografía Biométrica o Avatar */}
          <div className="w-32 h-32 bg-[#0f172a] rounded-full border-2 border-blue-500 overflow-hidden shrink-0 shadow-lg flex items-center justify-center">
            {perfil.foto_perfil ? (
              <img src={perfil.foto_perfil} alt="Foto Credencial" className="w-full h-full object-cover" />
            ) : (
              /* AQUI ENTRA EL AVATAR AUTOMÁTICAMENTE SI NO HAY FOTO */
              <AvatarEditor config={perfil.avatar_config} />
            )}
          </div>

          {/* Datos del Jugador */}
          <div className="space-y-1">
            <h2 className="text-white text-2xl font-black uppercase tracking-tight">{perfil.nombre}</h2>
            <p className="text-[#4ade80] text-base font-extrabold">{perfil.nombre_equipo?.toUpperCase() || 'AGENTE LIBRE'}</p>
            <div className="flex gap-4 justify-center text-xs font-semibold text-gray-400 pt-1">
              <span>RAMA: {perfil.categoria?.toUpperCase()}</span>
              <span>•</span>
              <span className="text-blue-400">JERSEY: #{perfil.numero_jersey || 'S/N'}</span>
            </div>
          </div>

          {/* Contenedor del Código QR Autónomo */}
          <div className="bg-white p-4 rounded-2xl shadow-inner mt-2">
            <div className="text-black font-bold text-xs p-2 bg-gray-100 rounded-lg">
              <p className="font-black text-[10px] text-gray-500 uppercase tracking-wider mb-2">Escanear Asistencia</p>
              <span className="text-xs font-mono select-all block mt-1">[ {perfil.qr_token} ]</span>
            </div>
          </div>

          {/* Botón de Salida */}
          <button 
            onClick={() => {
              localStorage.removeItem('atleta_token');
              localStorage.removeItem('atleta_id');
              onLogout();
            }}
            className="mt-4 text-xs font-bold text-red-400 hover:text-red-500 uppercase tracking-wider transition-all"
          >
            Cerrar Sesión de Jugador
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfilJugador;