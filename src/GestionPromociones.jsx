import { useState } from 'react';

const GestionPromociones = ({ onBack }) => {
  const [promociones] = useState([]); // Aquí cargarás tus promos desde la BD

  return (
    <div className="animate-in fade-in duration-500">
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
        <div className="bg-[#1e293b] p-8 rounded-3xl border border-yellow-500/30 flex flex-col items-center justify-center border-dashed">
          <div className="text-4xl mb-4">➕</div>
          <p className="text-gray-400 font-bold uppercase text-sm">Crear Nueva Promoción</p>
        </div>

        {promociones.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-20 text-gray-500 italic">
            No hay promociones activas en este momento.
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionPromociones;