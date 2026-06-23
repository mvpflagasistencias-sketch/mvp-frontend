import { useState, useEffect } from 'react';

// RUTA ABSOLUTA CONFIGURADA CON TU SERVIDOR REAL DE RAILWAY
const API_URL = 'https://mvp-backend-production-0f36.up.railway.app'; 

const GestionPromociones = ({ onBack }) => {
  const [promociones, setPromociones] = useState([]); 
  const [mostrarFormulario, setMostrarFormulario] = useState(false); 
  const [promoSeleccionada, setPromoSeleccionada] = useState(null); // 🚀 NUEVO ESTADO: Almacena la promo cliqueada para ver el detalle
  const [cargando, setCargando] = useState(false);
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenArchivo, setImagenArchivo] = useState(null); 
  const [imagenPreview, setImagenPreview] = useState(''); 
  const [fechaFin, setFechaFin] = useState('');

  // =========================================================================
  // 🔄 EFECTO: OBTENER LAS PROMOCIONES REALES DESDE LA BASE DE DATOS
  // =========================================================================
  useEffect(() => {
    const obtenerPromociones = async () => {
      try {
        const response = await fetch(`${API_URL}/api/promociones`);
        if (response.ok) {
          const data = await response.json();
          setPromociones(data);
        } else {
          console.error("❌ El servidor no respondió un JSON válido.");
        }
      } catch (error) {
        console.error("❌ Error al conectar con la API de promociones:", error);
      }
    };
    obtenerPromociones();
  }, [mostrarFormulario]); 

  const transformarBase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCambiarImagen = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setImagenArchivo(archivo); 
      setImagenPreview(URL.createObjectURL(archivo)); 
    }
  };

  const handleCrearPromocion = async (e) => {
    e.preventDefault();
    
    if (!titulo.trim() || !descripcion.trim()) return;
    setCargando(true);

    try {
      let bannerBase64 = null;
      if (imagenArchivo) {
        bannerBase64 = await transformarBase64(imagenArchivo); 
      }

      const response = await fetch(`${API_URL}/api/promociones/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.toUpperCase(),
          descripcion,
          imagen_url: bannerBase64, 
          fecha_fin: fechaFin || null
        })
      });

      if (response.ok) {
        setTitulo('');
        setDescripcion('');
        setImagenArchivo(null);
        setImagenPreview('');
        setFechaFin('');
        setMostrarFormulario(false);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || "No se pudo guardar la promoción en el servidor");
      }
    } catch (error) {
      console.error("❌ Error en la petición de guardado:", error);
      alert("Error de red al intentar conectar con el servidor backend");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      
      {/* HEADER PRINCIPAL */}
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
          disabled={cargando}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all border border-gray-700 hover:border-gray-600 shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          {mostrarFormulario ? '← Cancelar' : '← Volver'}
        </button>
      </div>

      {/* VISTA A: FORMULARIO DE CREACIÓN */}
      {mostrarFormulario ? (
        <div className="max-w-2xl mx-auto bg-[#1e293b] p-6 md:p-8 rounded-3xl border border-gray-700/60 shadow-2xl animate-in slide-in-from-bottom-6 duration-300">
          <form onSubmit={handleCrearPromocion} className="space-y-6">
            
            <div className="group">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 group-focus-within:text-yellow-500 mb-2 transition-colors">
                Título de la Promoción *
              </label>
              <input 
                type="text" 
                required
                disabled={cargando}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="EJ. MEGAPACK: INSCRIPCIÓN GRATIS EN JUNIO"
                className="w-full bg-[#0f172a] border border-gray-700/80 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-all uppercase placeholder-gray-600 disabled:opacity-50"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 group-focus-within:text-yellow-500 mb-2 transition-colors">
                Descripción de la Oferta *
              </label>
              <textarea 
                required
                rows="4"
                disabled={cargando}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Indica de forma clara los benefits..."
                className="w-full bg-[#0f172a] border border-gray-700/80 rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-all placeholder-gray-600 resize-none leading-relaxed disabled:opacity-50"
              />
            </div>

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
                    disabled={cargando}
                    onChange={handleCambiarImagen}
                    className="hidden" 
                  />
                </label>
                
                <span className="text-xs text-gray-500 truncate max-w-xs font-medium">
                  {imagenArchivo ? imagenArchivo.name : "Ningún banner seleccionado"}
                </span>
              </div>

              {imagenPreview && (
                <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-700/50 max-h-[140px]">
                  <img src={imagenPreview} alt="Preview Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 p-2 flex items-start justify-end">
                    <button 
                      type="button"
                      disabled={cargando}
                      onClick={() => { setImagenArchivo(null); setImagenPreview(''); }}
                      className="bg-red-600 hover:bg-red-500 text-white p-1 rounded-md text-[10px] font-black uppercase tracking-wider px-2"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="group">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 group-focus-within:text-yellow-500 mb-2 transition-colors">
                Fecha de Vencimiento (Opcional)
              </label>
              <input 
                type="date" 
                disabled={cargando}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full bg-[#0f172a] border border-gray-700/80 rounded-xl px-4 py-3.5 text-white text-sm font-semibold focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-all appearance-none cursor-pointer text-gray-300 disabled:opacity-50"
              />
            </div>

            <button 
              type="submit"
              disabled={cargando}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-yellow-900/30 mt-4 active:scale-[0.99] disabled:opacity-50"
            >
              {cargando ? '⏳ Publicando en base de datos...' : '🚀 Publicar Promoción Activa'}
            </button>
          </form>
        </div>
      ) : (
        /* VISTA B: GRID DE TARJETAS CLIQUEABLES */
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
                onClick={() => setPromoSeleccionada(promo)} // 🚀 HACE CLIQUEABLE LA TARJETA
                style={promo.imagen_url ? { backgroundImage: `linear-gradient(to bottom, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95)), url(${promo.imagen_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700/50 shadow-xl flex flex-col justify-between hover:border-yellow-500/60 cursor-pointer hover:scale-[1.01] transition-all duration-200 min-h-[180px]"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-base font-black text-yellow-500 uppercase tracking-tight italic leading-snug">
                      {promo.titulo}
                    </h3>
                    {promo.fecha_fin && (
                      <span className="shrink-0 text-[9px] bg-red-950/60 text-red-400 border border-red-900/50 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                        ⏰ Vence: {promo.fecha_fin.split('T')[0]} 
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed font-medium line-clamp-3">
                    {promo.descripcion}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          🚀 VISTA C: MODAL DETALLADO DE INFORMACIÓN COMPLETA
         ========================================================================= */}
      {promoSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-gray-700 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Banner superior expandido si cuenta con imagen */}
            {promoSeleccionada.imagen_url ? (
              <div className="h-48 relative w-full shrink-0">
                <img src={promoSeleccionada.imagen_url} alt="Promo Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-[#1e293b]/40 to-black/30" />
              </div>
            ) : (
              <div className="p-3 bg-gradient-to-r from-yellow-600/20 to-transparent border-b border-gray-800 shrink-0" />
            )}

            {/* Cuerpo del Modal */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xl font-black text-yellow-500 uppercase italic tracking-tight leading-tight">
                  {promoSeleccionada.titulo}
                </h3>
                {promoSeleccionada.fecha_fin && (
                  <span className="self-start sm:self-center shrink-0 text-[10px] bg-red-950 text-red-400 border border-red-900/60 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    ⏰ EXPIRA: {promoSeleccionada.fecha_fin.split('T')[0]}
                  </span>
                )}
              </div>

              <div className="border-t border-gray-800 my-2" />

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Términos y Detalles de la Oferta:</h4>
                <p className="text-gray-200 text-sm leading-relaxed font-medium bg-[#0f172a]/50 p-4 rounded-xl border border-gray-800 whitespace-pre-line">
                  {promoSeleccionada.descripcion}
                </p>
              </div>
            </div>

            {/* Footer con Botón de Cierre */}
            <div className="p-4 bg-[#0f172a]/40 border-t border-gray-800/60 flex justify-end shrink-0">
              <button
                onClick={() => setPromoSeleccionada(null)}
                className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-md active:scale-95"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default GestionPromociones;