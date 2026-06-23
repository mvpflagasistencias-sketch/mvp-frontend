import { useState } from 'react';

const GestionPromociones = ({ onBack }) => {
  const [promociones, setPromociones] = useState([]); // Tu lista de promos
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para alternar vistas
  
  // Estados para capturar los datos del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigoCupon, setCodigoCupon] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleCrearPromocion = (e) => {
    e.preventDefault();
    
    // Validamos lo básico por ahora
    if (!titulo || !descripcion) return;

    const nuevaPromo = {
      id: Date.now(), // ID temporal local
      titulo,
      descripcion,
      codigo_cupon: codigoCupon || null,
      fecha_fin: fechaFin || null
    };

    // Agregamos la promo localmente (Temporal, luego lo conectamos a tu API de Railway)
    setPromociones([nuevaPromo, ...promociones]);
    
    // Limpiamos el formulario y regresamos a la vista del listado
    setTitulo('');
    setDescripcion('');
    setCodigoCupon('');
    setFechaFin('');
    setMostrarFormulario(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Encabezado Dinámico */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          {mostrarFormulario ? (
            <>Nueva <span className="text-yellow-500">Promoción</span></>
          ) : (
            <>Gestión de <span className="text-yellow-500">Promociones</span></>
          )}
        </h2>
        <button 
          onClick={mostrarFormulario ? () => setMostrarFormulario(false) : onBack}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold uppercase text-xs transition-all shadow-md"
        >
          {mostrarFormulario ? '← Cancelar' : '← Volver'}
        </button>
      </div>

      {/* VISTA A: FORMULARIO DE CREACIÓN */}
      {mostrarFormulario ? (
        <div className="max-w-2xl bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <form onSubmit={handleCrearPromocion} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Título de la Promoción *</label>
              <input 
                type="text" 
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. 20% DE DESCUENTO EN INSCRIPCIÓN"
                className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-yellow-500 transition-all uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Descripción de la Oferta *</label>
              <textarea 
                required
                rows="3"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe los términos, qué incluye la promoción o el beneficio para el atleta..."
                className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-yellow-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Código de Cupón (Opcional)</label>
                <input 
                  type="text" 
                  value={codigoCupon}
                  onChange={(e) => setCodigoCupon(e.target.value)}
                  placeholder="Ej. FLAG20"
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-black focus:outline-none focus:border-yellow-500 transition-all uppercase text-yellow-500 tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Fecha de Vencimiento (Opcional)</label>
                <input 
                  type="date" 
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-yellow-500 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-yellow-900/20 mt-4"
            >
              Publicar Promoción Activa
            </button>
          </form>
        </div>
      ) : (
        /* VISTA B: GRID PRINCIPAL (LISTADO + BOTÓN AGREGAR) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta interactiva para abrir el formulario */}
          <div 
            onClick={() => setMostrarFormulario(true)} // 🚀 AHORA SÍ CAMBIA EL ESTADO AL DARLE CLIC
            className="bg-[#1e293b] p-8 rounded-3xl border border-yellow-500/30 flex flex-col items-center justify-center border-dashed cursor-pointer hover:border-yellow-500 hover:bg-[#243249] transition-all group min-h-[200px]"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">➕</div>
            <p className="text-gray-400 group-hover:text-white font-bold uppercase text-sm transition-colors tracking-wide">
              Crear Nueva Promoción
            </p>
          </div>

          {/* Listado dinámico de promociones creadas */}
          {promociones.length === 0 ? (
            <div className="flex items-center justify-center bg-[#1e293b]/30 border border-gray-800 rounded-3xl text-center p-8 text-gray-500 italic min-h-[200px]">
              No hay promociones activas en este momento.
            </div>
          ) : (
            promociones.map((promo) => (
              <div 
                key={promo.id} 
                className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700 shadow-xl flex flex-col justify-between hover:border-gray-600 transition-all animate-in zoom-in duration-300"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight text-yellow-500 italic">{promo.titulo}</h3>
                    {promo.fecha_fin && (
                      <span className="text-[9px] bg-red-900/40 text-red-400 border border-red-900/60 px-2 py-0.5 rounded-md font-bold uppercase">
                        Expira: {promo.fecha_fin}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">{promo.descripcion}</p>
                </div>
                {promo.codigo_cupon && (
                  <div className="bg-[#0f172a] border border-gray-800 px-4 py-2 rounded-xl flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Código de uso:</span>
                    <span className="text-sm font-black text-white tracking-widest uppercase bg-yellow-600/10 border border-yellow-600/20 px-3 py-1 rounded-lg">{promo.codigo_cupon}</span>
                  </div>
                )}
              </div>
            ))
          )}

        </div>
      )}
    </div>
  );
};

export default GestionPromociones;