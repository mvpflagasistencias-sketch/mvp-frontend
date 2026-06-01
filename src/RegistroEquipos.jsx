import { useState, useEffect } from 'react';
// IMPORTANTE: Cambiamos axios por nuestra instancia personalizada
import api from './api';

const RegistroEquipos = ({ onBack }) => {
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);

  // NUEVO: Estado para el buscador
  const [busqueda, setBusqueda] = useState('');

  const cargarEquipos = async () => {
    try {
      // Usamos api.get y la ruta relativa del servidor
      const res = await api.get('/api/equipos');
      setEquipos(res.data);
    } catch (err) {
      console.error("Error al cargar equipos:", err);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, []);

  // Lógica de filtrado dinámico
  const equiposFiltrados = equipos.filter((eq) => {
    const term = busqueda.toLowerCase();
    return (
      eq.nombre_equipo.toLowerCase().includes(term) ||
      eq.id.toString().includes(term)
    );
  });

  // --- FUNCIÓN PARA ELIMINAR ---
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        await api.delete(`/api/equipos/${id}`);
        cargarEquipos();
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar');
      }
    }
  };

  // --- FUNCIÓN PARA ACTUALIZAR ---
  const handleUpdate = async (id, nombreActual) => {
    const nuevoNombre = window.prompt('Editar nombre del equipo:', nombreActual);
    if (nuevoNombre && nuevoNombre !== nombreActual) {
      try {
        await api.put(`/api/equipos/${id}`, { nombre: nuevoNombre });
        cargarEquipos();
      } catch (err) {
        alert('Error al actualizar');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/equipos/registro', { nombre: nombreEquipo });
      setNombreEquipo('');
      cargarEquipos();
    } catch (err) {
      alert('❌ Error al registrar equipo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white uppercase italic tracking-tighter">Gestión de Equipos</h2>
          <p className="text-purple-400 font-bold text-xs uppercase tracking-widest">RF-04 / CRUD de Entidades</p>
        </div>
        <button onClick={onBack} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition-all font-bold text-xs uppercase">
          ← Volver al Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl h-fit">
          <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">Nuevo Registro</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              value={nombreEquipo}
              placeholder="Nombre del equipo"
              className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-purple-500 outline-none font-bold uppercase transition-all"
              onChange={(e) => setNombreEquipo(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg uppercase tracking-widest"
            >
              {loading ? 'GUARDANDO...' : 'REGISTRAR EQUIPO'}
            </button>
          </form>
        </div>

        <div className="bg-[#1e293b] rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-[#0f172a] p-4 border-b border-gray-700 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-blue-400 uppercase tracking-tighter italic">Equipos en la Liga</h3>
            
            <input 
              type="text"
              placeholder="🔍 BUSCAR EQUIPO..."
              className="w-full bg-[#1e293b] border border-gray-700 p-3 rounded-xl text-white text-xs font-bold outline-none focus:border-purple-500 transition-all uppercase"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <tbody className="text-gray-300">
                {equiposFiltrados.length > 0 ? (
                  equiposFiltrados.map((eq) => (
                    <tr key={eq.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-all">
                      <td className="p-4 font-medium italic text-gray-500 text-sm">ID #{eq.id}</td>
                      <td className="p-4 font-bold text-white uppercase">{eq.nombre_equipo}</td>
                      <td className="p-4 text-right space-x-3">
                        <button onClick={() => handleUpdate(eq.id, eq.nombre_equipo)} className="hover:scale-125 transition-transform">✏️</button>
                        <button onClick={() => handleDelete(eq.id)} className="hover:scale-125 transition-transform">🗑️</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-8 text-center text-gray-500 italic">
                      {busqueda ? 'No se encontraron equipos...' : 'No hay equipos registrados'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 bg-[#0f172a] text-right">
             <span className="text-[10px] text-gray-500 font-black uppercase">Total: {equiposFiltrados.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroEquipos;