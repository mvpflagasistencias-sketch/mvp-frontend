import { useState } from 'react';

const GestionPromociones = ({ onBack }) => {
  const [promociones, setPromociones] = useState([]); // Tu lista de promos
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para alternar vistas
  
  // Estados para capturar los datos del formulario (Cargador de Banner Real)
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenArchivo, setImagenArchivo] = useState(null); // 🚀 Almacena el archivo físico seleccionado
  const [imagenPreview, setImagenPreview] = useState(''); // 🚀 Almacena la URL en memoria para pintar la vista previa
  const [fechaFin, setFechaFin] = useState('');

  const handleCambiarImagen = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setImagenArchivo(archivo); // Guardamos el archivo para cuando lo mandes al backend vía FormData
      setImagenPreview(URL.createObjectURL(archivo)); // Genera un enlace temporal local para previsualizarlo
    }
  };

  const handleCrearPromocion = (e) => {
    e.preventDefault();
    
    if (!titulo.trim() || !descripcion.trim()) return;

    const nuevaPromo = {
      id: Date.now(),
      titulo: titulo.toUpperCase(),
      descripcion,
      // Usamos la preview local por ahora para el render dinámico del front
      imagen_url: imagenPreview || null, 
      fecha_fin: fechaFin || null
    };

    setPromociones([nuevaPromo, ...promociones]);
    
    // Limpiamos el formulario y regresamos al listado
    setTitulo('');
    setDescripcion('');
    setImagenArchivo(null);
    setImagenPreview('');
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

      {/* VISTA A: FORMULARIO DE CREACIÓN */}
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
                placeholder="Indica de forma clara los beneficios (ej. Válido para los primeros 10 atletas)..."
                className="w-full bg-[#0f172a] border border-gray-700/80 rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-all placeholder-gray-600 resize-none leading-relaxed"
              />
            </div>

            {/* INPUT REAL: CARGAR BANNER / FOTO (🚀 MODIFICADO CON FORMATO DE ARCHIVO FÍSICO) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                Banner de la Promoción (Opcional)
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0f172a] border border-gray-700/80 rounded-xl p-4">
                <label className="shrink-0 cursor-pointer bg-slate-800 hover:bg-slate-700 border border-gray-700 text-white font-bold uppercase text-[10px] tracking-wider px-4 py-2.5 rounded-lg transition-all active:scale-95">
                  📁 Seleccionar Archivo
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleCambiarImagen}
                    className="hidden" // Escondemos el input feo nativo de HTML
                  />
                </label>
                
                <span className="text-xs text-gray-500 truncate max-w-xs font-medium">
                  {imagenArchivo ? imagenArchivo.name : "Ningún banner seleccionado"}
                </span>
              </div>

              {/* Muestra miniatura del banner dentro del formulario antes de guardar */}
              {imagenPreview && (
                <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-700/50 max-h-[140px]">
                  <img src={imagenPreview} alt="Preview Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 p-2 flex items-start justify-end">
                    <button 
                      type="button"
                      onClick={() => { setImagenArchivo(null); setImagenPreview(''); }}
                      className="bg-red-600 hover:bg-red-500 text-white p-1 rounded-md text-[10px] font-black uppercase tracking-wider px-2"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT: FECHA */}
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

            {/* BOTÓN SUBMIT */}
            <button 
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-yellow-900/30 mt-4 active:scale-[0.99]"
            >
              🚀 Publicar Promoción Activa
            </button>
          </form>
        </div>
      ) : (
        /* VISTA B: GRID PRINCIPAL */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div 
            onClick={() => setMostrarFormulario(true)}
            className="bg-[#1e293b] p-8 rounded-3xl border border-yellow-500/20 flex flex-col items-center justify-center border-dashed cursor-pointer hover:border-yellow-500 hover:bg-[#202c41] transition-all group min-h-[180px] shadow-md active:scale-[0.99]"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">⚡</div>
            <p className="text-gray-400 group-hover:text-yellow-500 font-black uppercase text-xs tracking-wider transition-colors">
              Crear Nueva Promoción
            </p>
          </div>

          {promociones.length === 0 ? (
            <div className="flex items-center justify-center bg-[#1e293b]/20 border border-gray-800/80 rounded-3xl text-center p-8 text-gray-500 italic font-medium min-h-[180px]">
              No hay promociones activas en este momento.
            </div>
          ) : (
            promociones.map((promo) => (
              <div 
                key={promo.id} 
                style={promo.imagen_url ? { backgroundImage: `linear-gradient(to bottom, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95)), url(${promo.imagen_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700/50 shadow-xl flex flex-col justify-between hover:border-gray-600 transition-all animate-in zoom-in-95 duration-300 min-h-[180px]"
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