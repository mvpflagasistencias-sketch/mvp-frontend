import { useState, useEffect } from 'react';
// IMPORTANTE: Cambiamos axios por nuestra instancia personalizada
import api from './api';

const RegistroJugadores = ({ onBack }) => {
  const [equipos, setEquipos] = useState([]); // Lista de equipos desde la DB
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    equipo: '', // ID del equipo seleccionado
    telefono: '',
    nombre_tutor: '',
    numero_jersey: '',
    correo: '',
    categoria: '' // <--- SE AGREGA AL ESTADO INICIAL
  });

  const [loading, setLoading] = useState(false);

  // Cargar equipos de la base de datos al iniciar usando la instancia 'api'
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await api.get('/api/equipos');
        setEquipos(res.data);
      } catch (err) {
        console.error("Error al cargar equipos", err);
      }
    };
    fetchEquipos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.equipo) return alert("Por favor selecciona un equipo"); 
    if (!formData.categoria) return alert("Por favor selecciona una categoría"); 

    setLoading(true);
    try {
      const datosLimpios = {
        nombre: formData.nombre,
        correo: formData.correo || '',
        telefono: formData.telefono,
        equipo: formData.equipo, // ID seleccionado
        tutor: formData.nombre_tutor,
        categoria: formData.categoria // <--- SE AGREGA AL ENVÍO
      };

      // Petición a través de la instancia centralizada
      await api.post('/api/jugadores/registro', datosLimpios);
      alert('✅ ¡Jugador guardado en la base de datos!');
      onBack();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || 'Error interno'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl">
        
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-5">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Registro de Atleta</h2>
            <p className="text-blue-400 font-medium">RF-01: Gestión de Perfiles</p>
          </div>
          <button 
            onClick={onBack}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-all"
          >
            ← Volver al Panel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="md:col-span-2 text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Nombre del Jugador</label>
            <input 
              type="text" 
              placeholder="Ej. Juan Pérez"
              className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
          </div>

          <div className="md:col-span-2 text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="ejemplo@correo.com"
              className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, correo: e.target.value})}
              required
            />
          </div>

          <div className="text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Edad</label>
            <input 
              type="number" 
              placeholder="00"
              className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, edad: e.target.value})}
              required
            />
          </div>

          <div className="text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Categoría</label>
            <select 
              className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              required
              value={formData.categoria}
            >
              <option value="">-- Elige rama --</option>
              <option value="VARONIL">VARONIL</option>
              <option value="FEMENIL">FEMENIL</option>
              <option value="MIXTO">MIXTO</option>
              <option value="JUVENIL">JUVENIL</option>
            </select>
          </div>

          <div className="text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Equipo</label>
            <select 
                className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none"
                onChange={(e) => setFormData({...formData, equipo: e.target.value})}
                required
                value={formData.equipo}
                >
                <option value="">-- Elige un equipo --</option>
                {equipos.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                    {eq.nombre_equipo}
                    </option>
                ))}
            </select>
          </div>

          <div className="text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Teléfono de Contacto</label>
            <input 
              type="tel" 
              placeholder="10 dígitos"
              className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              required
            />
          </div>

          <div className="text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Número de Jersey (#)</label>
            <input 
              type="number" 
              placeholder="Ej. 07"
              className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, numero_jersey: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Nombre del Tutor (Opcional)</label>
            <input 
              type="text" 
              placeholder="En caso de ser menor de edad"
              className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, nombre_tutor: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${
                loading 
                ? 'bg-gray-600 cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 text-white'
              }`}
            >
              {loading ? 'REGISTRANDO...' : 'CONFIRMAR REGISTRO DE JUGADOR'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegistroJugadores;