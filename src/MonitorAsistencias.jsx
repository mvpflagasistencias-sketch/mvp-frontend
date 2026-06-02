import { useState, useEffect } from 'react';
import api from './api';

const MonitorAsistencias = ({ onBack }) => {
  const [asistencias, setAsistencias] = useState([]);
  const [filtro, setFiltro] = useState('');
  
  // NUEVO: Estado para el modal de detalles
  const [asistenciaSeleccionada, setAsistenciaSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // MODIFICACIÓN: Función de texto plano para evitar el truco visual del navegador
  const formatearFechaLimpia = (fechaStr) => {
    if (!fechaStr) return '';
    const partes = fechaStr.split('-'); 
    if (partes.length !== 3) return fechaStr; 
    const anyo = partes[0];
    const mes = partes[1];
    const dia = partes[2];
    return `${dia}/${mes}/${anyo}`;
  };

  const cargarAsistencias = async () => {
    try {
      const res = await api.get('/api/asistencias/recientes');
      setAsistencias(res.data);
    } catch (err) {
      console.error("Error al cargar asistencias", err);
    }
  };

  useEffect(() => {
    cargarAsistencias();
    const intervalo = setInterval(cargarAsistencias, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const asistenciasFiltradas = asistencias.filter((a) => {
    const term = filtro.toLowerCase();
    return (
      a.jugador.toLowerCase().includes(term) ||
      (a.nombre_equipo && a.nombre_equipo.toLowerCase().includes(term)) ||
      (a.staff && a.staff.toLowerCase().includes(term))
    );
  });

  // NUEVO: Abrir modal
  const verDetalle = (asistencia) => {
    setAsistenciaSeleccionada(asistencia);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left relative">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Monitor de Campo</h2>
          <p className="text-green-400 font-bold text-xs uppercase tracking-widest">Sincronización en Tiempo Real</p>
        </div>

        <div className="w-full md:w-80">
          <input 
            type="text"
            placeholder="🔎 BUSCAR EN BITÁCORA EN VIVO..."
            className="w-full bg-[#0f172a] border border-green-500/30 p-3 rounded-xl text-green-400 text-xs font-bold outline-none focus:border-green-500 transition-all placeholder:text-gray-700 uppercase"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        <button onClick={onBack} className="text-gray-500 hover:text-white text-xs font-bold uppercase transition-colors">
          ← Volver
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-green-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="p-5">Atleta / Equipo</th>
              <th className="p-5">Registrado por</th>
              <th className="p-5">Hora</th>
              <th className="p-5 text-center">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {asistenciasFiltradas.map((a) => (
              <tr 
                key={a.id_asistencia} 
                onClick={() => verDetalle(a)} // HACER FILA CLICKABLE
                className="hover:bg-green-500/10 cursor-pointer transition-all border-l-4 border-transparent hover:border-green-500"
              >
                <td className="p-5">
                  <p className="font-bold text-white uppercase text-sm">{a.jugador} 🔍</p>
                  <p className="text-[10px] text-gray-500 uppercase">{a.nombre_equipo || 'Independiente'}</p>
                </td>
                <td className="p-5 text-gray-400 text-xs font-bold uppercase italic">
                  {a.staff}
                </td>
                <td className="p-5 text-white font-mono text-sm">
                  {a.hora}
                </td>
                <td className="p-5 text-center">
                  <span className="bg-green-900/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
                    {a.latitud ? '📍 Geocalizado' : 'Check-in OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {asistenciasFiltradas.length === 0 && (
          <div className="p-10 text-center text-gray-500 italic">
            {filtro ? 'No hay coincidencias...' : 'Esperando escaneos...'}
          </div>
        )}
      </div>

      {/* NUEVO: MODAL DE DETALLE DE ASISTENCIA */}
      {isModalOpen && asistenciaSeleccionada && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] w-full max-w-lg rounded-3xl border border-green-500/40 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-[#0f172a] to-green-900 p-8 text-left">
              <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Detalle de Registro</p>
              <h2 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter">
                {asistenciaSeleccionada.jugador}
              </h2>
            </div>

            <div className="p-8 space-y-6 text-left">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Equipo</p>
                  <p className="text-white font-bold uppercase">{asistenciaSeleccionada.nombre_equipo || 'Independiente'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Staff que escaneó</p>
                  <p className="text-green-400 font-bold uppercase italic">{asistenciaSeleccionada.staff}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Fecha</p>
                  {/* CORRECCIÓN APLICADA: Ahora jala el string mapeado directamente sin restar un día */}
                  <p className="text-white font-mono">{formatearFechaLimpia(asistenciaSeleccionada.fecha)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Hora Exacta</p>
                  <p className="text-white font-mono">{asistenciaSeleccionada.hora}</p>
                </div>
              </div>

              {/* SECCIÓN DE MAPA */}
              <div className="pt-4 border-t border-gray-700">
                {asistenciaSeleccionada.latitud ? (
                  <div className="space-y-4">
                    <p className="text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <span className="animate-ping w-2 h-2 rounded-full bg-green-500"></span>
                      Ubicación de escaneo detectada
                    </p>
                    <a 
                      href={`https://www.google.com/maps?q=${asistenciaSeleccionada.latitud},${asistenciaSeleccionada.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-blue-900/40"
                    >
                      📍 Ver en Google Maps
                    </a>
                  </div>
                ) : (
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-dashed border-gray-700 text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest italic">
                      Sin datos de GPS disponibles
                    </p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-gray-800 text-gray-400 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-700 hover:text-white transition-all"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorAsistencias;