import { useState, useEffect } from 'react';
import api from './api';

export default function GestionTorneos({ onBack }) {
  const [torneos, setTorneos] = useState([]);
  const [nombreTorneo, setNombreTorneo] = useState('');
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  const [equiposTorneo, setEquiposTorneo] = useState([]);
  
  // Estados para el formulario de añadir equipo
  const [mostrarModal, setMostrarModal] = useState(false);
  const [todosLosEquipos, setTodosLosEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Varonil');

  useEffect(() => {
    cargarTorneos();
  }, []);

  const cargarTorneos = async () => {
    try {
      const response = await api.get('/api/torneos');
      setTorneos(response.data);
    } catch (error) {
      console.error("Error al cargar torneos:", error);
    }
  };

  const crearTorneo = async (e) => {
    e.preventDefault();
    if (!nombreTorneo.trim()) return;
    try {
      await api.post('/api/torneos', { nombre_torneo: nombreTorneo });
      setNombreTorneo('');
      cargarTorneos(); // Recarga la lista automáticamente para que aparezca el nuevo torneo
    } catch (error) {
      console.error("Error al crear torneo:", error);
    }
  };

  const abrirTorneo = async (torneo) => {
    setTorneoSeleccionado(torneo);
    cargarEquiposDelTorneo(torneo.id);
  };

  const cargarEquiposDelTorneo = async (torneoId) => {
    try {
      const response = await api.get(`/api/torneos/${torneoId}/equipos`);
      setEquiposTorneo(response.data);
    } catch (error) {
      console.error("Error al cargar equipos:", error);
    }
  };

  const abrirModalAsignar = async () => {
    setMostrarModal(true);
    try {
      const response = await api.get('/api/equipos-todos');
      setTodosLosEquipos(response.data);
    } catch (error) {
      console.error("Error al obtener la lista general de equipos:", error);
    }
  };

  const guardarEquipoEnTorneo = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/torneos/${torneoSeleccionado.id}/equipos`, {
        equipo_id: equipoSeleccionado,
        nuevo_nombre: nuevoNombre,
        categoria: nuevaCategoria
      });
      setMostrarModal(false);
      setEquipoSeleccionado('');
      setNuevoNombre('');
      setNuevaCategoria('Varonil');
      cargarEquiposDelTorneo(torneoSeleccionado.id);
    } catch (error) {
      console.error("Error al guardar el equipo:", error);
    }
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700 shadow-lg text-left max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-500 uppercase italic">
          {torneoSeleccionado ? `Torneo: ${torneoSeleccionado.nombre_torneo}` : "Gestión de Torneos"}
        </h2>
        <button 
          onClick={torneoSeleccionado ? () => setTorneoSeleccionado(null) : onBack} 
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-sm font-bold transition-all"
        >
          ← {torneoSeleccionado ? "Regresar a lista" : "Volver"}
        </button>
      </div>

      {!torneoSeleccionado ? (
        <>
          <form onSubmit={crearTorneo} className="flex gap-4 mb-8">
            <input 
              type="text" 
              placeholder="Nombre del nuevo torneo (Ej. Torneo Dominical 2026)" 
              value={nombreTorneo}
              onChange={(e) => setNombreTorneo(e.target.value)}
              className="flex-1 bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
            />
            <button type="submit" className="bg-pink-600 hover:bg-pink-500 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all">
              Crear Torneo
            </button>
          </form>

          <div className="space-y-3">
            {torneos.map((t) => (
              <div 
                key={t.id} 
                onClick={() => abrirTorneo(t)}
                className="bg-[#0f172a] p-4 rounded-2xl border border-gray-800 flex justify-between items-center cursor-pointer hover:border-pink-500 transition-all"
              >
                <span className="font-bold text-lg">🏆 {t.nombre_torneo}</span>
                <span className="text-xs bg-pink-500/10 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-lg uppercase font-black">ID: {t.id}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-300">Equipos Inscritos</h3>
            <button 
              onClick={abrirModalAsignar}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            >
              + Añadir Equipo
            </button>
          </div>

          {/* MODAL / FORMULARIO PARA AÑADIR EQUIPO */}
          {mostrarModal && (
            <div className="bg-[#0f172a] p-6 rounded-2xl border border-blue-500/50 mb-6 animate-in fade-in">
              <h4 className="font-bold text-blue-400 mb-4 uppercase text-sm">Asignar o Registrar Equipo al Torneo</h4>
              <form onSubmit={guardarEquipoEnTorneo} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Seleccionar de la Base de Datos o Crear Nuevo:</label>
                  <select 
                    value={equipoSeleccionado} 
                    onChange={(e) => setEquipoSeleccionado(e.target.value)}
                    className="w-full bg-[#1e293b] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">-- Selecciona una opción --</option>
                    <option value="nuevo">➕ [ CREAR EQUIPO NUEVO ]</option>
                    {todosLosEquipos.map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.nombre_equipo} ({eq.categoria})</option>
                    ))}
                  </select>
                </div>

                {equipoSeleccionado === 'nuevo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Nombre del Nuevo Equipo:</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Linces FC" 
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        className="w-full bg-[#1e293b] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        required={equipoSeleccionado === 'nuevo'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Categoría:</label>
                      <select 
                        value={nuevaCategoria} 
                        onChange={(e) => setNuevaCategoria(e.target.value)}
                        className="w-full bg-[#1e293b] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Varonil">Varonil</option>
                        <option value="Femenil">Femenil</option>
                        <option value="Mixto">Mixto</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setMostrarModal(false)}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LISTA DE EQUIPOS DEL TORNEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equiposTorneo.length > 0 ? (
              equiposTorneo.map((e) => (
                <div key={e.id} className="bg-[#0f172a] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white text-base">{e.nombre_equipo}</p>
                    <p className="text-xs text-gray-400">Categoría: {e.categoria}</p>
                  </div>
                  <span className="text-xs bg-pink-500/10 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-lg uppercase font-black">ID: {e.id}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic col-span-2 py-8 text-center">No hay equipos registrados en este torneo todavía.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}