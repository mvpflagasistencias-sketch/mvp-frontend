import { useState } from 'react';

const GestionPromociones = ({ onBack }) => {
  const [promociones, setPromociones] = useState([]); // Tu lista de promos
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para alternar vistas
  
  // Estados para capturar los datos del formulario (Sin código de cupón)
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleCrearPromocion = (e) => {
    e.preventDefault();
    
    if (!titulo.trim() || !descripcion.trim()) return;

    const nuevaPromo = {
      id: Date.now(),
      titulo: titulo.toUpperCase(), // Forzamos mayúsculas dinámicas para el estilo deportivo
      descripcion,
      fecha_fin: fechaFin || null
    };

    setPromociones([nuevaPromo, ...promociones]);
    
    // Limpiamos el formulario y regresamos al listado
    setTitulo('');
    setDescripcion('');
    setFechaFin('');
    setMostrarFormulario(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Encabezado Dinámico con Diseño Consistente */}
      <div className="flex justify-between items-center mb-8 bg-[#1e293b]/40 p-4 rounded-2xl border border-gray-800/60 backdrop-blur-sm">
        <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
          {mostrarFormulario ? (
            <>✍️ Nueva <span className="text-yellow-500">Promoción</span></>
          ) : (
            <>🏷️ Gestión de <span className="text-yellow-500">Promociones</span></>
          )}
        </h2>
        <button 
          onClick={mostrarFormulario ? () => setMostrarFormulario(false) : onBack}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all border border-gray-700 hover:border-gray-600 shadow-md flex items-center gap-2"
        >
          {mostrarFormulario ? '← Cancelar' : '← Volver'}
        </button>
      </div>

      {/* VISTA A: FORMULARIO DE CREACIÓN MEJORADO */}
      {mostrarFormulario ? (
        <div className="max-w-2xl mx-auto bg-[#1e293b] p-6 md:p-8 rounded-3xl border border-gray-700/60 shadow-2xl animate-in slide-in-from-bottom-6 duration-300">
          <form onSubmit={handleCrearPromocion} className="space-y-6">
            
            {/* INPUT: TÍTULO */}
            <div className="group">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 group-focus-within:text-yellow-500 mb-2 transition-colors">
                Título de la Promoción *
              </label>
              <input 
                type="text" 
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="EJ. MEGAPACK: INSCRIPCIÓN GRATIS EN JUNIO"
                className="w-full bg-[#0f172a] border border-gray-700/80 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-all uppercase placeholder-gray-600"
              />
            </div>

            {/* INPUT: DESCRIPCIÓN */}
            <div className="group">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 group-focus-within:text-yellow-500 mb-2 transition-colors">
                Descripción de la Oferta *
              </label>
              <textarea 
                required
                rows="4"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Indica de forma clara los beneficios (ej. Válido para los primeros 10 atletas en registrarse esta semana)..."
                className="w-full bg-[#0f172a] border border-gray-700/80 rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-all placeholder-gray-600 resize-none leading-relaxed"
              />
            </div>

            {/* INPUT: FECHA (Ocupando todo el ancho disponible con mejor diseño) */}
            <div className="group">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 group-focus-within:text-yellow-500 mb-2 transition-colors">
                Fecha de Vencimiento (Opcional)
              </label>
              <input 
                type="date" 
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full bg-[#0f172a] border border-gray-700/80 rounded-xl px-4 py-3.5 text-white text-sm font-semibold focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-all appearance-none cursor-pointer text-gray-300"
              />
            </div>

            {/* BOTÓN SUBMIT DE ALTO IMPACTO */}
            <button 
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-yellow-900/30 mt-4 active:scale-[0.99]"
            >
              🚀 Publicar Promoción Activa
            </button>
          </form>
        </div>
      ) : (
        /* VISTA B: GRID PRINCIPAL OPTIMIZADO */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta interactiva para abrir el formulario */}
          <div 
            onClick={() => setMostrarFormulario(true)}
            className="bg-[#1e293b] p-8 rounded-3xl border border-yellow-500/20 flex flex-col items-center justify-center border-dashed cursor-pointer hover:border-yellow-500 hover:bg-[#202c41] transition-all group min-h-[180px] shadow-md active:scale-[0.99]"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">⚡</div>
            <p className="text-gray-400 group-hover:text-yellow-500 font-black uppercase text-xs tracking-wider transition-colors">
              Crear Nueva Promoción
            </p>
          </div>

          {/* Listado dinámico de promociones creadas */}
          {promociones.length === 0 ? (
            <div className="flex items-center justify-center bg-[#1e293b]/20 border border-gray-800/80 rounded-3xl text-center p-8 text-gray-500 italic font-medium min-h-[180px]">
              No hay promociones activas en este momento.
            </div>
          ) : (
            promociones.map((promo) => (
              <div 
                key={promo.id} 
                className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700/50 shadow-xl flex flex-col justify-between hover:border-gray-600 transition-all animate-in zoom-in-95 duration-300"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-base font-black text-yellow-500 uppercase tracking-tight italic leading-snug">
                      {promo.titulo}
                    </h3>
                    {promo.fecha_fin && (
                      <span className="shrink-0 text-[9px] bg-red-950/60 text-red-400 border border-red-900/50 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                        ⏰ Vence: {promo.fecha_fin}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed font-medium">
                    {promo.descripcion}
                  </p>
                </div>
              </div>
            ))
          )}

        </div>
      )}
    </div>
  );
};

export default GestionPromociones;