// src/CardPromociones.jsx
import React from "react";

const CardPromociones = ({ alGestionar = () => {} }) => {
  return (
    // Añadimos min-w-0 para asegurar que la tarjeta no fuerce su ancho más de lo permitido
    <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700 shadow-xl flex flex-col justify-between hover:border-yellow-600/50 transition-all min-w-0">
      <div className="mb-4 min-w-0">
        <div className="text-3xl mb-2">🏷️</div>
        {/* Usamos break-words y block para asegurar que el texto se acomode */}
        <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter italic break-words block">
          Gestión de Promociones
        </h3>
        <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 truncate">
          Gestiona cupones y ofertas.
        </p>
      </div>
      <button
        onClick={alGestionar}
        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-xl font-black text-xs uppercase transition-all shadow-lg shadow-yellow-900/40 tracking-widest"
      >
        Gestionar
      </button>
    </div>
  );
};

export default CardPromociones;
