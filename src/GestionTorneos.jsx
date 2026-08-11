import { useState, useEffect } from 'react';
import api from './api';

export default function GestionTorneos({ onBack }) {
  const [torneos, setTorneos] = useState([]);
  const [nombreTorneo, setNombreTorneo] = useState('');

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
      cargarTorneos();
    } catch (error) {
      console.error("Error al crear torneo:", error);
    }
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700 shadow-lg text-left max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-500 uppercase italic">Gestión de Torneos</h2>
        <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-sm font-bold">← Volver</button>
      </div>

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
          <div key={t.id} className="bg-[#0f172a] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
            <span className="font-bold text-lg">🏆 {t.nombre_torneo}</span>
            <span className="text-xs bg-pink-500/10 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-lg uppercase font-black">ID: {t.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}