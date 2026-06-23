import { useState, useEffect } from 'react';

// RUTA ABSOLUTA CONFIGURADA CON TU SERVIDOR REAL DE RAILWAY
const API_URL = 'https://mvp-backend-production-0f36.up.railway.app'; 

const GestionPromociones = ({ onBack }) => {
  const [promociones, setPromociones] = useState([]); 
  const [mostrarFormulario, setMostrarFormulario] = useState(false); 
  const [promoSeleccionada, setPromoSeleccionada] = useState(null); // 🚀 ALMACENA LA PROMO SELECCIONADA
  const [editando, setEditando] = useState(false); // 🚀 NUEVO ESTADO: CONTROLA MODO LECTURA O EDICIÓN EN EL MODAL
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false); // 🚀 NUEVO ESTADO: CONTROL DEL PROCESO DE DIFUSIÓN MASIVA
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenArchivo, setImagenArchivo] = useState(null); 
  const [imagenPreview, setImagenPreview] = useState(''); 
  const [fechaFin, setFechaFin] = useState('');

  // 🚀 NUEVOS ESTADOS DE CONTROL DE SEGMENTACIÓN (MERN FILTROS)
  const [tipoFiltro, setTipoFiltro] = useState('todos'); 
  const [limite, setLimite] = useState('10');
  const [equipoId, setEquipoId] = useState('');
  const [listaEquipos, setListaEquipos] = useState([]); // Almacena el catálogo de escuadras para el select

  // =========================================================================
  // 🔄 EFECTO: OBTENER LAS PROMOCIONES Y EL CATÁLOGO DE EQUIPOS
  // =========================================================================
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

  const obtenerEquiposCatalogo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/equipos`);
      if (response.ok) {
        const data = await response.json();
        setListaEquipos(data);
      }
    } catch (error) {
      console.error("❌ Error al jalar catálogo de escuadras:", error);
    }
  };

  useEffect(() => {
    obtenerPromociones();
    obtenerEquiposCatalogo();
  }, [mostrarFormulario]); 

  // 🚀 FUNCIÓN: PRECARGA LOS DATOS ACTUALES E INICIA MODO EDICIÓN
  const iniciarEdicion = () => {
    setTitulo(promoSeleccionada.titulo);
    setDescripcion(promoSeleccionada.descripcion);
    setImagenPreview(promoSeleccionada.imagen_url || '');
    setFechaFin(promoSeleccionada.fecha_fin ? promoSeleccionada.fecha_fin.split('T')[0] : '');
    setEditando(true);
  };

  // 🚀 FUNCIÓN: LIMPIA TODO EL CONTROLLER DEL MODAL AL CERRAR
  const cerrarModal = () => {
    setPromoSeleccionada(null);
    setEditando(false);
    setTitulo('');
    setDescripcion('');
    setImagenArchivo(null);
    setImagenPreview('');
    setFechaFin('');
    setTipoFiltro('todos'); // Limpia criterios de segmentación al salir
    setLimite('10');
    setEquipoId('');
  };

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

  // =========================================================================
  // 🚀 ACCIÓN: ENVIAR PROMOCIÓN SELECCIONADA CON CRITERIOS DE SEGMENTACIÓN
  // =========================================================================
  const handleEnviarAJugadores = async (id) => {
    setEnviando(true);
    try {
        const response = await fetch(`${API_URL}/api/promociones/enviar/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipoFiltro, limite, equipoId })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert("¡Éxito! " + data.message);
        } else {
            alert("Error: " + data.error);
        }
    } catch (err) {
        alert("Error de conexión con el servidor");
    } finally {
        setEnviando(false); // ESTO QUITA EL "SEGMENTANDO..."
    }
};

  // =========================================================================
  // 🚀 ACCIÓN UNIFICADA: CREAR (POST) O ACTUALIZAR (PUT) EN LA BASE DE DATOS
  // =========================================================================
  const handleCrearPromocion = async (e) => {
    e.preventDefault();
    
    if (!titulo.trim() || !descripcion.trim()) return;
    setCargando(true);

    try {
      let bannerBase64 = imagenPreview; // En edición mantiene el banner actual si no se sube uno nuevo
      if (imagenArchivo) {
        bannerBase64 = await transformarBase64(imagenArchivo); 
      }

      // Cambiamos dinámicamente la URL y el método HTTP dependiendo del flujo
      const urlDestino = editando 
        ? `${API_URL}/api/promociones/${promoSeleccionada.id}` 
        : `${API_URL}/api/promociones/crear`;
        
      const metodoHttp = editando ? 'PUT' : 'POST';

      const response = await fetch(urlDestino, {
        method: metodoHttp,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.toUpperCase(),
          descripcion,
          imagen_url: bannerBase64 || null, 
          fecha_fin: fechaFin || null
        })
      });

      if (response.ok) {
        if (editando) {
          cerrarModal();
          obtenerPromociones(); // Refresca la parrilla principal de inmediato
        } else {
          setTitulo('');
          setDescripcion('');
          setImagenArchivo(null);
          setImagenPreview('');
          setFechaFin('');
          setMostrarFormulario(false);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || "No se pudo procesar la promoción en el servidor");
      }
    } catch (error) {
      console.error("❌ Error en la petición:", error);
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
                
                <span className="text-xs text-gray-500 truncate max-w-xs font-medium">{imagenArchivo ? imagenArchivo.name : "Ningún banner seleccionado"}</span>
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
            onClick={() => { setEditando(false); setMostrarFormulario(true); }}
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
                onClick={() => setPromoSeleccionada(promo)} 
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
          🚀 VISTA C: MODAL DETALLADO DINÁMICO (LECTURA O FORMULARIO DE EDICIÓN)
         ========================================================================= */}
      {promoSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-gray-700 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* CONDICIONAL INTERNO: FORMULARIO DE EDICIÓN ACTIVO */}
            {editando ? (
              <form onSubmit={handleCrearPromocion} className="flex flex-col h-full overflow-hidden">
                <div className="p-6 bg-[#0f172a]/40 border-b border-gray-800/60 flex justify-between items-center shrink-0">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight">✏️ Editar <span className="text-yellow-500">Promoción</span></h3>
                  <button type="button" onClick={() => setEditando(false)} className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">← Ver Detalle</button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-yellow-500 mb-1.5 transition-colors">Título</label>
                    <input type="text" required disabled={cargando} value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-yellow-500 uppercase disabled:opacity-50" />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-yellow-500 mb-1.5 transition-colors">Descripción</label>
                    <textarea required rows="4" disabled={cargando} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 resize-none disabled:opacity-50" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Reemplazar Banner (Opcional)</label>
                    <div className="flex items-center gap-3 bg-[#0f172a] border border-gray-700 rounded-xl p-3">
                      <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-gray-700 text-white font-bold uppercase text-[9px] tracking-wider px-3 py-2 rounded-lg transition-all">
                        📁 Cambiar Banner
                        <input type="file" accept="image/*" disabled={cargando} onChange={handleCambiarImagen} className="hidden" />
                      </label>
                      <span className="text-xs text-gray-500 truncate max-w-xs font-medium">{imagenArchivo ? imagenArchivo.name : "Manteniendo banner actual"}</span>
                    </div>
                    {imagenPreview && (
                      <div className="mt-2 relative rounded-xl overflow-hidden border border-gray-700 max-h-[100px]">
                        <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" disabled={cargando} onClick={() => { setImagenArchivo(null); setImagenPreview(''); }} className="absolute top-1 right-1 bg-red-600 text-white text-[9px] px-2 py-0.5 font-bold rounded">Quitar</button>
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-yellow-500 mb-1.5 transition-colors">Nueva Fecha de Vencimiento</label>
                    <input type="date" disabled={cargando} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm cursor-pointer text-gray-300 disabled:opacity-50" />
                  </div>
                </div>

                <div className="p-4 bg-[#0f172a]/60 border-t border-gray-800/60 flex justify-end gap-3 shrink-0">
                  <button type="button" disabled={cargando} onClick={cerrarModal} className="px-4 py-2 bg-gray-700 text-gray-300 hover:text-white font-bold text-xs uppercase rounded-xl transition-all">Cancelar</button>
                  <button type="submit" disabled={cargando} className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-black text-xs uppercase rounded-xl tracking-wider shadow-md transition-all">{cargando ? 'Guardando...' : '💾 Guardar Cambios'}</button>
                </div>
              </form>
            ) : (
              /* SUB-VISTA DETALLE (MODO LECTURA ORIGINAL) */
              <>
                {promoSeleccionada.imagen_url ? (
                  <div className="h-48 relative w-full shrink-0">
                    <img src={promoSeleccionada.imagen_url} alt="Promo Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-[#1e293b]/40 to-black/30" />
                  </div>
                ) : (
                  <div className="p-3 bg-gradient-to-r from-yellow-600/20 to-transparent border-b border-gray-800 shrink-0" />
                )}

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

                  {/* 🚀 NUEVA SECCIÓN DE SEGMENTACIÓN E INTELIGENCIA DE DIFUSIÓN */}
                  <div className="bg-[#0f172a]/40 border border-gray-800 p-4 rounded-2xl space-y-3 mt-2">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-yellow-500">🎯 Segmentación de Envío</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Criterio de Filtro</label>
                        <select 
                          value={tipoFiltro} 
                          onChange={(e) => setTipoFiltro(e.target.value)}
                          className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs font-bold outline-none focus:border-yellow-500 cursor-pointer"
                        >
                          <option value="todos">👥 ENVIAR A TODOS</option>
                          <option value="top_asistencias">🏆 TOP ASISTENCIAS (PREMIO)</option>
                          <option value="por_equipo">🏈 POR SQUAD ESPECÍFICO</option>
                        </select>
                      </div>

                      {/* Render condicional: Input para límite de asistencias */}
                      {tipoFiltro === 'top_asistencias' && (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                          <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Cantidad de Atletas</label>
                          <input 
                            type="number" 
                            min="1"
                            value={limite}
                            onChange={(e) => setLimite(e.target.value)}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs font-bold outline-none focus:border-yellow-500"
                            placeholder="Ej. 10"
                          />
                        </div>
                      )}

                      {/* Render condicional: Select para filtrar por escuadras reales de la BD */}
                      {tipoFiltro === 'por_equipo' && (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                          <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Seleccionar Escuadra</label>
                          <select 
                            value={equipoId} 
                            onChange={(e) => setEquipoId(e.target.value)}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs font-bold outline-none focus:border-yellow-500 cursor-pointer"
                          >
                            <option value="">Selecciona equipo...</option>
                            {listaEquipos.map(e => (
                              <option key={e.id} value={e.id}>{e.nombre_equipo.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* FOOTER DEL MODAL INTERACTIVO CON BOTÓN DE ENVÍO MASIVO INTEGRADO */}
                <div className="p-4 bg-[#0f172a]/40 border-t border-gray-800/60 flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={iniciarEdicion}
                      disabled={enviando}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 border border-gray-700 hover:border-gray-600 font-black uppercase text-xs rounded-xl tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      ✏️ Editar Info
                    </button>
                    <button 
                      onClick={() => handleEnviarAJugadores(promoSeleccionada.id)}
                      disabled={enviando || (tipoFiltro === 'por_equipo' && !equipoId)}
                      className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:border-blue-600/50 font-black uppercase text-xs rounded-xl tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {enviando ? '⏳ Segmentando...' : '📢 Enviar a Jugadores'}
                    </button>
                  </div>
                  <button
                    onClick={cerrarModal}
                    disabled={enviando}
                    className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    Entendido
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default GestionPromociones;