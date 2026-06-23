import { useState } from 'react';

const GestionPromociones = ({ onBack }) => {
  const [promociones] = useState([]); // Aquí cargarás tus promos desde la BD

  return (
    <div className="animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Gestión de <span className="text-yellow-500">Promociones</span>
        </h2>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold uppercase text-xs transition-all"
        >
          ← Volver
        </button>
      </div>

      {/* Grid de Promociones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tarjeta interactiva para Crear Nueva Promoción */}
        <div className="bg-[#1e293b] p-8 rounded-3xl border border-yellow-500/30 flex flex-col items-center justify-center border-dashed cursor-pointer hover:border-yellow-500 hover:bg-[#243249] transition-all group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">➕</div>
          <p className="text-gray-400 group-hover:text-white font-bold uppercase text-sm transition-colors">
            Crear Nueva Promoción
          </p>
        </div>

        {/* Listado dinámico o Mensaje de lista vacía optimizado */}
        {promociones.length === 0 ? (
          <div className="flex items-center justify-center bg-[#1e293b]/30 border border-gray-800 rounded-3xl text-center p-8 text-gray-500 italic">
            No hay promociones activas en este momento.
          </div>
        ) : (
          promociones.map((promo) => (
            <div key={promo.id}>
              {/* Aquí mapearás el diseño de tus tarjetas de promoción reales */}
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default GestionPromociones;