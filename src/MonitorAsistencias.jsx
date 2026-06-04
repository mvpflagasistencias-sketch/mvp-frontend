import { useState, useEffect } from 'react';
import api from './api';

const MonitorAsistencias = ({ onBack }) => {
  // PESTAÑA ACTIVA: 'partidos', 'historial', 'metricas'
  const [activeTab, setActiveTab] = useState('partidos');

  // ESTADOS DE DATOS
  const [partidosAgrupados, setPartidosAgrupados] = useState([]);
  const [historialCompleto, setHistorialCompleto] = useState([]);
  const [asistenciasRecientes, setAsistenciasRecientes] = useState([]);

  // Historial completo acumulado del jugador seleccionado
  const [acumuladasJugador, setAcumuladasJugador] = useState([]);

  // ESTADOS DE FILTROS
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroJornada, setFiltroJornada] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // ESTADO DE SELECCIÓN PARA EXPANDIR UN PARTIDO
  const [partidoExpandido, setPartidoExpandido] = useState(null);
    
  // CONTROL DEL MODAL DETALLADO ORIGINAL
  const [asistenciaSeleccionada, setAsistenciaSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal de la Foto sin abrir otra página
  const [fotoModalUrl, setFotoModalUrl] = useState(null);

  // FUNCIÓN DE FORMATEO EXCLUSIVA ORIGINAL
  const formatearFechaLimpia = (fechaStr) => {
    if (!fechaStr) return '';
    const partes = fechaStr.split('-'); 
    if (partes.length !== 3) return fechaStr; 
    const anyo = partes[0];
    const mes = partes[1];
    const dia = partes[2];
    return `${dia}/${mes}/${anyo}`;
  };

  // CARGA DE DATOS BASADA EN LA PESTAÑA SELECCIONADA
  const cargarDatosSincronizados = async () => {
    try {
      if (activeTab === 'partidos') {
        let url = '/api/asistencias/agrupadas';
        const params = [];
        if (filtroJornada) params.push(`jornada=${filtroJornada}`);
        if (filtroCategoria) params.push(`categoria=${filtroCategoria}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const res = await api.get(url);
        setPartidosAgrupados(res.data);
      } else if (activeTab === 'historial') {
        let url = '/api/asistencias/historial';
        const params = [];
        if (filtroJornada) params.push(`jornada=${filtroJornada}`);
        if (filtroTexto) params.push(`buscar=${filtroTexto}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const res = await api.get(url);
        setHistorialCompleto(res.data);
      } else if (activeTab === 'metricas') {
        const res = await api.get('/api/asistencias/historial');
        setAsistenciasRecientes(res.data);
      }
    } catch (err) {
      console.error("❌ Error en la sincronización web:", err);
    }
  };

  // Polling automático en tiempo real cada 5 segundos
  useEffect(() => {
    cargarDatosSincronizados();
    const intervalo = setInterval(cargarDatosSincronizados, 5000);
    return () => clearInterval(intervalo);
  }, [activeTab, filtroJornada, filtroCategoria, filtroTexto]);

  // Hook secundario para el historial acumulado
  useEffect(() => {
    const consultarAcumuladas = async () => {
      if (isModalOpen && asistenciaSeleccionada?.id_jugador) {
        try {
          const res = await api.get(`/api/jugadores/${asistenciaSeleccionada.id_jugador}/asistencias-acumuladas`);
          setAcumuladasJugador(res.data || []);
        } catch (err) {
          console.error("Error al cargar acumuladas del atleta:", err);
        }
      } else {
        setAcumuladasJugador([]);
      }
    };
    consultarAcumuladas();
  }, [isModalOpen, asistenciaSeleccionada]);

  // MODIFICACIÓN EXCLUSIVA: Escucha global para cerrar cualquier modal abierto con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setFotoModalUrl(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ABRIR MODAL ORIGINAL (UNIFICA ID JUGADOR PARA AMBAS PESTAÑAS)
  const verDetalle = (asistencia) => {
    const idRealAtleta = asistencia.id_jugador || asistencia.jugador_id;
    setAsistenciaSeleccionada({
      ...asistencia,
      id_jugador: idRealAtleta
    });
    setIsModalOpen(true);
  };

  // CONTADORES MATEMÁTICOS PARA LA PESTAÑA DE MÉTRICAS (MERN)
  const totalPasesRegistrados = asistenciasRecientes.length;
  const pasesConGps = asistenciasRecientes.filter(a => a.latitud).length;
  const jornadasUnicas = [...new Set(asistenciasRecientes.map(a => a.jornada).filter(Boolean))].sort((a,b)=>a-b);
  const categoriesUnicas = [...new Set(asistenciasRecientes.map(a => a.categoria).filter(Boolean))];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left relative">
      
      {/* ENCABEZADO ORIGINAL */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Monitor de Campo</h2>
          <p className="text-green-400 font-bold text-xs uppercase tracking-widest">Sincronización en Tiempo Real</p>
        </div>
        <button onClick={onBack} className="text-gray-500 hover:text-white text-xs font-bold uppercase transition-colors">
          ← Volver
        </button>
      </div>

      {/* SYSTEM TABS */}
      <div className="flex border-b border-gray-800 gap-2 pt-2">
        <button  
          onClick={() => { setActiveTab('partidos'); setPartidoExpandido(null); }}
          className={`pb-4 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === 'partidos' ? 'text-green-400 border-green-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
        >
          🏈 Por Partidos
        </button>
        <button  
          onClick={() => setActiveTab('historial')}
          className={`pb-4 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === 'historial' ? 'text-green-400 border-green-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
        >
          📋 Historial General
        </button>
        <button  
          onClick={() => setActiveTab('metricas')}
          className={`pb-4 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === 'metricas' ? 'text-green-400 border-green-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
        >
          📊 Métricas y Reportes
        </button>
      </div>

      {/* --- PANEL DE FILTROS DINÁMICOS ADAPTABLES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#141b2e] p-4 rounded-2xl border border-gray-800">
        {(activeTab === 'partidos' || activeTab === 'historial') && (
          <div>
            <label className="text-[10px] text-gray-500 font-black uppercase block mb-1">Filtrar Jornada</label>
            <select  
              value={filtroJornada}  
              onChange={(e) => { setFiltroJornada(e.target.value); setPartidoExpandido(null); }}
              className="w-full bg-[#0f172a] border border-gray-700 p-3 rounded-xl text-white text-xs font-bold outline-none focus:border-green-500 transition-all uppercase"
            >
              <option value="">Todas las Jornadas</option>
              {[...Array(12).keys()].map(n => (
                <option key={n+1} value={n+1}>Jornada {n+1}</option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'partidos' && (
          <div>
            <label className="text-[10px] text-gray-500 font-black uppercase block mb-1">Filtrar Categoría</label>
            <select  
              value={filtroCategoria}  
              onChange={(e) => { setFiltroCategoria(e.target.value); setPartidoExpandido(null); }}
              className="w-full bg-[#0f172a] border border-gray-700 p-3 rounded-xl text-white text-xs font-bold outline-none focus:border-green-500 transition-all"
            >
              <option value="">Todas las Categorías</option>
              <option value="Femenil">Femenil</option>
              <option value="Varonil">Varonil</option>
              <option value="Mixto (Coed)">Mixto (Coed)</option>
              <option value="Golden (Mayores)">Golden (Mayores)</option>
            </select>
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="md:col-span-2">
            <label className="text-[10px] text-gray-500 font-black uppercase block mb-1">Búsqueda rápida</label>
            <input  
              type="text"
              placeholder="🔎 BUSCAR POR ATLETA O EQUIPO..."
              className="w-full bg-[#0f172a] border border-gray-700 p-3 rounded-xl text-green-400 text-xs font-bold outline-none focus:border-green-500 transition-all placeholder:text-gray-700 uppercase"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'metricas' && (
          <div className="col-span-3 py-2 text-center text-gray-400 text-xs font-bold uppercase tracking-wider italic">
            📈 Resumen Estadístico de Operations en Campo
          </div>
        )}
      </div>

      {/* ================= PESTAÑA 1: POR PARTIDOS ================= */}
      {activeTab === 'partidos' && (
        <div className="grid grid-cols-1 gap-4">
          {partidosAgrupados.map((p) => {
            const matchKey = `${p.jornada}-${p.categoria}-${p.equipo_local}-${p.equipo_visitante}`;
            const isSelected = partidoExpandido === matchKey;

            return (
              <div  
                key={matchKey}  
                className={`bg-[#1e293b] rounded-3xl border transition-all overflow-hidden shadow-xl ${isSelected ? 'border-green-500 ring-1 ring-green-500/30' : 'border-gray-800 hover:border-gray-700'}`}
              >
                <div  
                  onClick={() => setPartidoExpandido(isSelected ? null : matchKey)}
                  className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none bg-[#131b2e]/60"
                >
                  <div>
                    <div className="flex gap-2 mb-1 items-center">
                      <span className="bg-blue-900/40 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase">Jornada {p.jornada}</span>
                      <span className="bg-purple-900/40 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase">{p.categoria || 'Sin Categoría'}</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">
                      {p.equipo_local} <span className="text-green-500 font-black text-sm lowercase px-1">vs</span> {p.equipo_visitante}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Roster Asistente</p>
                      <p className="text-lg font-black text-white font-mono">{p.total_asistencias} <span className="text-xs text-green-400 font-bold">JUGS</span></p>
                    </div>
                    {p.foto_partido && (
                      <div className="w-12 h-12 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                        <img src={p.foto_partido} alt="Roster" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-gray-500 font-bold text-sm">{isSelected ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Sub-Tabla Desplegable de Jugadores */}
                {isSelected && (
                  <div className="border-t border-gray-800 bg-[#0f172a]/50 p-4 animate-in slide-in-from-top-4 duration-300">
                    {p.foto_partido && (
                      <div className="mb-4 p-4 bg-[#141b2e] border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-green-400 text-xs font-black uppercase tracking-wider">📸 Evidencia Fotográfica Colectiva</p>
                          <p className="text-gray-500 text-[10px] uppercase">Planilla firmada registrada por el oficial de campo</p>
                        </div>
                        <button  
                          onClick={() => setFotoModalUrl(p.foto_partido)}
                          className="bg-green-600 text-white text-[10px] px-5 py-3 rounded-xl font-black uppercase tracking-wider hover:bg-green-500 transition-all shadow-lg shadow-green-900/20"
                        >
                          👁️ Ver Imagen Completa
                        </button>
                      </div>
                    )}

                    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#141b2e]/40">
                      <table className="w-full text-left">
                        <thead className="bg-[#0f172a] text-gray-500 text-[9px] uppercase font-black tracking-widest">
                          <tr>
                            <th className="p-4">Nombre del Atleta</th>
                            <th className="p-4">Oficial Monitor</th>
                            <th className="p-4">Hora Check-in</th>
                            <th className="p-4 text-center">Estatus</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-xs">
                          {p.jugadores.map((j, subIdx) => (
                            <tr  
                              key={j.id_jugador || subIdx}
                              onClick={() => verDetalle({
                                id_jugador: j.id_jugador,
                                jugador: j.jugador_nombre,
                                nombre_equipo: j.equipo_nombre,
                                staff: j.staff_nombre,
                                fecha: j.fecha,
                                hora: j.hora,
                                latitud: j.latitud,
                                longitud: j.longitud
                              })}
                              className="hover:bg-green-500/5 cursor-pointer transition-all"
                            >
                              <td className="p-4 font-bold text-white uppercase">{j.jugador_nombre}</td>
                              <td className="p-4 text-gray-400 italic uppercase">{j.staff_nombre}</td>
                              <td className="p-4 font-mono text-white">{j.hora}</td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${j.latitud ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-gray-800 text-gray-400'}`}>
                                  {j.latitud ? '📍 GPS OK' : 'OK'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {partidosAgrupados.length === 0 && (
            <div className="bg-[#1e293b] p-12 text-center rounded-3xl border border-gray-800 text-gray-500 italic">
              No hay partidos registrados bajo los criterios de filtrado seleccionados.
            </div>
          )}
        </div>
      )}

      {/* ================= PESTAÑA 2: HISTORIAL GENERAL ================= */}
      {activeTab === 'historial' && (
        <div className="bg-[#1e293b] rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-[#0f172a] text-green-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-5">Atleta / Enfrentamiento</th>
                <th className="p-5">Registrado por</th>
                <th className="p-5">Fecha / Hora</th>
                <th className="p-5 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {historialCompleto.map((a) => (
                <tr  
                  key={a.id_asistencia}  
                  onClick={() => verDetalle({
                    id_jugador: a.id_jugador || a.jugador_id,
                    jugador: a.jugador_nombre,
                    nombre_equipo: a.jugador_equipo_original,
                    staff: a.staff_nombre,
                    fecha: a.fecha,
                    hora: a.hora,
                    latitud: a.latitud,
                    longitud: a.longitud
                  })}
                  className="hover:bg-green-500/10 cursor-pointer transition-all border-l-4 border-transparent hover:border-green-500"
                >
                  <td className="p-5">
                    <p className="font-bold text-white uppercase text-sm">{a.jugador_nombre} 🔍</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">
                      J{a.jornada} - {a.equipo_local} <span className="text-green-500 font-bold">vs</span> {a.equipo_visitante}
                    </p>
                  </td>
                  <td className="p-5 text-gray-400 text-xs font-bold uppercase italic">
                    {a.staff_nombre}
                  </td>
                  <td className="p-5 text-xs">
                    <p className="text-white font-mono">{a.hora}</p>
                    <p className="text-gray-500 font-mono text-[10px]">{formatearFechaLimpia(a.fecha)}</p>
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-green-900/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
                      {a.latitud ? '📍 Geolocalizado' : 'Check-in OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {historialCompleto.length === 0 && (
            <div className="p-10 text-center text-gray-500 italic">
              No hay coincidencias en el historial de pases...
            </div>
          )}
        </div>
      )}

      {/* ================= PESTAÑA 3: MÉTRICAS Y REPORTES ================= */}
      {activeTab === 'metricas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-800 space-y-4">
            <h3 className="text-white font-black uppercase tracking-tight text-lg">Resumen Operativo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f172a] p-4 rounded-2xl border border-gray-800 text-left">
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-wider">Escaneos Totales</p>
                <p className="text-3xl font-mono font-black text-green-400">{totalPasesRegistrados}</p>
              </div>
              <div className="bg-[#0f172a] p-4 rounded-2xl border border-gray-800 text-left">
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-wider">Auditorías GPS</p>
                <p className="text-3xl font-mono font-black text-blue-400">{pasesConGps}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-800 space-y-3">
            <h3 className="text-white font-black uppercase tracking-tight text-lg">Alcance de la Liga</h3>
            <div className="space-y-2 text-xs text-gray-400 uppercase font-bold">
              <p>📌 Jornadas con Actividad Real: <span className="text-white font-mono">{jornadasUnicas.length === 0 ? 0 : jornadasUnicas.join(', ')}</span></p>
              <p>🏆 Categorías en Operación Móvil: <span className="text-white font-mono">{categoriesUnicas.length === 0 ? 'Esperando...' : categoriesUnicas.join(', ')}</span></p>
              <p>⚡ Tasa de Cobertura de Geolocalización: <span className="text-green-400 font-mono">
                {totalPasesRegistrados > 0 ? `${((pasesConGps / totalPasesRegistrados) * 100).toFixed(1)}%` : '0%'}
              </span></p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DETALLE DE PERFIL DE ATLETA ================= */}
      {isModalOpen && asistenciaSeleccionada && (
        // MODIFICACIÓN EXCLUSIVA: Al hacer clic en este fondo negro flotante, se cierra el modal
        <div 
          onClick={() => setIsModalOpen(false)} 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          {/* PreventPropagation evita que el modal se cierre si le picas adentro al panel de contenido */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-[#1e293b] w-full max-w-lg rounded-3xl border border-green-500/40 shadow-2xl overflow-hidden animate-in zoom-in duration-300"
          >
            <div className="bg-gradient-to-r from-[#0f172a] to-green-900 p-8 text-left">
              <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Tarjeta de Perfil de Atleta</p>
              <h2 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter">
                {asistenciaSeleccionada.jugador}
              </h2>
            </div>

            <div className="p-8 space-y-6 text-left max-h-[75vh] overflow-y-auto">
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
                  <p className="text-white font-mono">{formatearFechaLimpia(asistenciaSeleccionada.fecha)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Hora Exacta</p>
                  <p className="text-white font-mono">{asistenciaSeleccionada.hora}</p>
                </div>
              </div>

              {/* SECCIÓN HISTÓRICA ACUMULADA UNIFICADA */}
              <div className="pt-4 border-t border-gray-800 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-green-400 text-[10px] font-black uppercase tracking-widest">📊 Historial de Torneo Acumulado</p>
                  <span className="bg-green-950 text-green-400 text-[9px] border border-green-800 px-2 py-0.5 rounded font-black font-mono">
                    {acumuladasJugador.length} ASISTENCIAS
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 rounded-2xl custom-scrollbar">
                  {acumuladasJugador.map((ac, acIdx) => (
                    <div 
                      key={ac.id_asistencia || acIdx} 
                      className="bg-[#0f172a]/70 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-gray-700 transition-all shadow-inner"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="bg-blue-950 text-blue-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-blue-900/40">
                            J{ac.jornada}
                          </span>
                          <span className="text-gray-400 font-black tracking-tight text-[10px] uppercase truncate">
                            {ac.categoria}
                          </span>
                        </div>
                        <p className="text-white font-extrabold text-xs uppercase tracking-tight truncate">
                          {ac.equipo_local} <span className="text-green-500 font-medium text-[10px]">vs</span> {ac.equipo_visitante}
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end justify-center gap-1 shrink-0">
                        <span className="text-white font-mono text-[10px] font-bold bg-[#1e293b] px-2 py-0.5 rounded-md border border-gray-800">
                          {ac.hora}
                        </span>
                        <p className="text-gray-500 font-mono text-[9px] font-semibold">
                          {formatearFechaLimpia(ac.fecha)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {acumuladasJugador.length === 0 && (
                    <div className="bg-[#0f172a]/40 border border-dashed border-gray-800 p-8 text-center rounded-2xl text-gray-600 text-xs italic uppercase font-bold tracking-wider">
                      Sin récord histórico de pases para este torneo.
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN DE MAPA ORIGINAL */}
              <div className="pt-4 border-t border-gray-700">
                {asistenciaSeleccionada.latitud ? (
                  <div className="space-y-4">
                    <p className="text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <span className="animate-ping w-2 h-2 rounded-full bg-green-500"></span>
                      Ubicación de escaneo detectada
                    </p>
                    <a  
                      href={`https://maps.google.com/?q=${asistenciaSeleccionada.latitud},${asistenciaSeleccionada.longitud}`}
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
                Cerrar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL EXCLUSIVO: VISOR INLINE DE FOTO ================= */}
      {fotoModalUrl && (
        // MODIFICACIÓN EXCLUSIVA: Al hacer clic en este fondo negro flotante, se cierra el visor
        <div 
          onClick={() => setFotoModalUrl(null)} 
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative bg-[#1e293b] w-full max-w-3xl rounded-3xl border border-green-500/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
          >
            <div className="bg-[#0f172a] p-5 flex justify-between items-center border-b border-gray-800">
              <div>
                <p className="text-green-400 text-[9px] font-black uppercase tracking-widest italic">Visor de Evidencia Real</p>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Planilla del Encuentro</h3>
              </div>
              <button  
                onClick={() => setFotoModalUrl(null)}
                className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-wider bg-gray-900 px-3 py-2 rounded-xl border border-gray-800 transition-all"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="p-6 bg-[#0f172a]/40 flex items-center justify-center max-h-[70vh] overflow-y-auto">
              <img  
                src={fotoModalUrl}  
                alt="Planilla Evidencia Roster"  
                className="w-full h-auto max-h-[65vh] object-contain rounded-xl border border-gray-800 shadow-inner"
              />
            </div>

            <div className="bg-[#0f172a] p-4 text-center border-t border-gray-800">
              <button  
                onClick={() => setFotoModalUrl(null)}
                className="bg-gray-800 text-gray-400 text-xs font-black uppercase tracking-widest py-3 px-8 rounded-xl hover:bg-gray-700 hover:text-white transition-all w-full sm:w-auto"
              >
                Volver al Monitor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MonitorAsistencias;