import { useState, useEffect } from 'react';
// IMPORTANTE: Cambiamos axios por nuestra instancia personalizada
import api from './api';
import logoMvp from './assets/logo-mvp.png';
import { QRCodeSVG } from 'qrcode.react';

const GestionJugadores = ({ alRegistro }) => {
  const [jugadores, setJugadores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [jugadorAEditar, setJugadorAEditar] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Usamos api.get en lugar de axios.get y quitamos la URL base
      const [resJugadores, resEquipos] = await Promise.all([
        api.get('/api/jugadores'),
        api.get('/api/equipos')
      ]);
      setJugadores(resJugadores.data);
      setEquipos(resEquipos.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // ESCUCHA EXCLUSIVA: Cerrar modales activos con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsEditModalOpen(false);
        setIsViewModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const jugadoresFiltrados = jugadores.filter((j) => {
    const termino = busqueda.toLowerCase();
    return (
      j.nombre.toLowerCase().includes(termino) ||
      (j.nombre_equipo && j.nombre_equipo.toLowerCase().includes(termino))
    );
  });

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Seguro que deseas eliminar a ${nombre}?`)) {
      await api.delete(`/api/jugadores/${id}`);
      cargarDatos();
    }
  };

  const abrirModal = (jugador) => {
    setJugadorAEditar({ ...jugador });
    setIsEditModalOpen(true);
  };

  const verPerfilCompleto = (jugador) => {
    setJugadorSeleccionado(jugador);
    setIsViewModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/jugadores/${jugadorAEditar.id}`, {
        nombre: jugadorAEditar.nombre,
        correo: jugadorAEditar.correo,
        telefono: jugadorAEditar.telefono,
        equipo: jugadorAEditar.equipo_id,
        categoria: jugadorAEditar.categoria // Se incluye categoría en actualización
      });
      alert("✅ Datos actualizados correctamente");
      setIsEditModalOpen(false);
      cargarDatos();
    } catch (err) {
      alert("❌ Error al actualizar");
    }
  };

  if (loading) return <div className="text-center p-10 text-blue-400 animate-pulse font-bold uppercase tracking-widest">Accediendo a la Bitácora...</div>;

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="bg-[#1e293b] rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
        
        <div className="bg-[#0f172a] p-6 border-b border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left w-full md:w-auto">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Bitácora Digital de Atletas</h3>
            <p className="text-gray-500 text- text-xs font-bold uppercase tracking-widest">Gestión de Credenciales QR</p>
          </div>

          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="BUSCAR ATLETA O EQUIPO..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#1e293b] border border-gray-700 p-3 pl-10 rounded-xl text-white text-xs font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-600 uppercase"
            />
            <span className="absolute left-3 top-3.5 text-gray-600">🔍</span>
          </div>
          
          <div className="flex items-center gap-6 w-full md:w-auto justify-end">
            <button 
              onClick={alRegistro}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40 tracking-widest"
            >
              + Añadir Atleta
            </button>
            <span className="text-blue-400 font-mono text-sm hidden lg:block">VISTA: {jugadoresFiltrados.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0f172a]/50 text-blue-400 text-[10px] uppercase font-black tracking-widest">
              <tr className="text-center">
                <th className="p-5 text-left">Atleta</th>
                <th className="p-5">Equipo / Rama</th>
                <th className="p-5">Contacto</th>
                <th className="p-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {jugadoresFiltrados.map((j) => (
                <tr key={j.id} className="hover:bg-blue-500/5 transition-colors">
                  <td 
                    className="p-5 font-bold text-white uppercase text-sm cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => verPerfilCompleto(j)}
                  >
                    <div className="flex flex-col">
                      <span>{j.nombre} 🔍</span>
                      {j.tutor && j.tutor.trim() !== "" && (
                        <span className="text-gray-500 text-[10px] font-medium lowercase italic tracking-normal mt-0.5">
                          tutor: {j.tutor}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <span className="bg-blue-900/20 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase italic">
                        {j.nombre_equipo || 'Agente Libre'}
                        </span>
                        {j.categoria && (
                            <span className="text-[9px] text-gray-500 font-bold tracking-widest">{j.categoria}</span>
                        )}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <p className="text-xs text-gray-400 font-mono italic">📞 {j.telefono}</p>
                  </td>
                  <td className="p-5 space-x-6 text-center">
                    <button onClick={() => abrirModal(j)} className="text-blue-400 hover:scale-125 transition-transform text-lg">✏️</button>
                    <button onClick={() => handleDelete(j.id, j.nombre)} className="text-red-500 hover:scale-125 transition-transform text-lg">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {jugadoresFiltrados.length === 0 && (
            <div className="p-20 text-center text-gray-600 font-bold uppercase text-xs tracking-widest animate-pulse">
              No se encontraron atletas con ese criterio de búsqueda...
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: EDITAR INFORMACIÓN ================= */}
      {isEditModalOpen && (
        <div 
          onClick={() => setIsEditModalOpen(false)} 
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in duration-300"
          >
            <div className="bg-[#0f172a] p-6 border-b border-gray-700">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Editar Información</h3>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">
              <div className="text-left text-white">
                <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block tracking-widest">Nombre del Atleta</label>
                <input 
                  type="text" 
                  value={jugadorAEditar.nombre}
                  className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-xl text-white outline-none focus:border-blue-500 font-bold uppercase transition-all"
                  onChange={(e) => setJugadorAEditar({...jugadorAEditar, nombre: e.target.value})}
                />
              </div>

              <div className="text-left text-white">
                <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block tracking-widest">Equipo Registrado</label>
                <select 
                  value={jugadorAEditar.equipo_id || ""}
                  className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-xl text-white outline-none focus:border-blue-500 font-bold transition-all"
                  onChange={(e) => setJugadorAEditar({...jugadorAEditar, equipo_id: e.target.value})}
                >
                  <option value="">-- SELECCIONAR EQUIPO --</option>
                  {equipos.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.nombre_equipo}</option>
                  ))}
                </select>
              </div>

              <div className="text-left text-white">
                <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block tracking-widest">Contacto Directo</label>
                <input 
                  type="text" 
                  value={jugadorAEditar.telefono}
                  className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-xl text-white outline-none focus:border-blue-500 font-bold transition-all"
                  onChange={(e) => setJugadorAEditar({...jugadorAEditar, telefono: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-800 text-gray-400 py-4 rounded-xl font-black uppercase text-xs tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/40">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LICENCIA / CREDENCIAL DIGITAL QR ================= */}
      {isViewModalOpen && jugadorSeleccionado && (
        <div 
          onClick={() => setIsViewModalOpen(false)} 
          className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-[#1e293b] w-full max-w-2xl rounded-3xl border border-blue-500/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
          >
            <div className="bg-gradient-to-r from-[#0f172a] to-blue-900 p-10 text-left relative">
              <span className="bg-blue-500 text-[10px] px-2 py-1 rounded font-black uppercase tracking-widest text-white">Atleta Verificado</span>
              <h2 className="text-4xl font-black text-white uppercase mt-2 tracking-tighter italic leading-none">
                {jugadorSeleccionado.nombre}
              </h2>
              <p className="text-blue-300 font-mono text-xs mt-2 uppercase">Licencia Digital MVP FLAG</p>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6 flex flex-col items-center">
                <div className="bg-white p-5 rounded-3xl shadow-2xl flex flex-col items-center">
                  <QRCodeSVG 
                    value={JSON.stringify({id: jugadorSeleccionado.id, n: jugadorSeleccionado.nombre})} 
                    size={200}
                    level={"H"}
                    includeMargin={true}
                    imageSettings={{
                      src: logoMvp,
                      height: 45,
                      width: 45,
                      align: 'center',
                      excavate: true,
                    }}
                  />
                  <p className="text-[10px] text-gray-500 font-black uppercase mt-4 tracking-widest italic">
                    Scannable ID Card
                  </p>
                </div>
              </div>

              <div className="space-y-8 text-left">
                <div>
                  <h4 className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-3 italic underline decoration-blue-500/30">Expediente</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400">🏆</div>
                      <div>
                        <p className="text-gray-500 text-[9px] uppercase font-black">Equipo / Rama</p>
                        <p className="text-white font-black uppercase italic">
                            {jugadorSeleccionado.nombre_equipo || 'Agente Libre'} 
                            {jugadorSeleccionado.categoria && ` - ${jugadorSeleccionado.categoria}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-green-500/10 p-3 rounded-xl text-green-400">📱</div>
                      <div>
                        <p className="text-gray-500 text-[9px] uppercase font-black">Teléfono</p>
                        <p className="text-white font-mono">{jugadorSeleccionado.telefono}</p>
                      </div>
                    </div>
                    {jugadorSeleccionado.tutor && jugadorSeleccionado.tutor.trim() !== "" && (
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400">👤</div>
                        <div>
                          <p className="text-gray-500 text-[9px] uppercase font-black">Tutor responsable</p>
                          <p className="text-white font-black uppercase italic text-xs">{jugadorSeleccionado.tutor}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a]/50 p-8 flex gap-4">
              <button onClick={() => setIsViewModalOpen(false)} className="flex-1 bg-gray-800 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-700 transition-all">Cerrar</button>
              <button onClick={() => window.print()} className="flex-1 bg-cyan-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/30">Imprimir Credencial</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionJugadores;