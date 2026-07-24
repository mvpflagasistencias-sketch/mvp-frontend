import { useState, useEffect } from "react";
// IMPORTANTE: Cambiamos axios por nuestra instancia personalizada
import api from "./api";

const GestionStaff = ({ onBack }) => {
  const [staff, setStaff] = useState([]);
  const [nuevoMiembro, setNuevoMiembro] = useState({
    nombre: "",
    usuario: "",
    password: "",
    rol: "Staff",
  });

  const [busqueda, setBusqueda] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [staffSeleccionado, setStaffSeleccionado] = useState(null);

  // 🛠️ NUEVO ESTADO: Para controlar el modo de edición y los datos del formulario de actualización
  const [isEditando, setIsEditando] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState({
    nombre: "",
    usuario: "",
    password: "",
  });

  const cargarStaff = async () => {
    try {
      // Usamos la instancia api y la ruta relativa
      const res = await api.get("/api/staff");
      setStaff(res.data);
    } catch (err) {
      console.error("Error al cargar staff", err);
    }
  };

  useEffect(() => {
    cargarStaff();
  }, []);

  const staffFiltrado = staff.filter((s) => {
    const term = busqueda.toLowerCase();
    return (
      s.nombre.toLowerCase().includes(term) ||
      s.rol.toLowerCase().includes(term)
    );
  });

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      // Usamos api.post
      await api.post("/api/staff/registro", nuevoMiembro);
      alert("✅ Usuario de Staff creado exitosamente");
      setNuevoMiembro({ nombre: "", usuario: "", password: "", rol: "Staff" });
      cargarStaff();
    } catch (err) {
      alert("❌ Error: El usuario ya existe o hubo un problema en el servidor");
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    // Usamos api.put
    await api.put(`/api/staff/estado/${id}`, { estado: nuevoEstado });
    cargarStaff();
  };

  const verPerfilStaff = (miembro) => {
    setStaffSeleccionado(miembro);
    // Inicializamos los datos de edición con la información actual del miembro
    setDatosEdicion({
      nombre: miembro.nombre || "",
      usuario: miembro.usuario || "",
      password: "", // La dejamos vacía por seguridad; si la llenan, se actualiza
    });
    setIsEditando(false);
    setIsViewModalOpen(true);
  };

  // 🛠️ NUEVA FUNCIÓN: Manejar la actualización del miembro del staff
  const handleActualizarStaff = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...datosEdicion };
      // Si no escribieron contraseña nueva, la eliminamos para no sobrescribirla con vacíos
      if (!payload.password) {
        delete payload.password;
      }

      await api.put(`/api/staff/actualizar/${staffSeleccionado.id}`, payload);
      alert("✅ Datos de Staff actualizados con éxito");
      
      // Actualizamos el modal y la lista local
      setIsEditando(false);
      cargarStaff();
      setIsViewModalOpen(false);
    } catch (err) {
      console.error("Error al actualizar staff", err);
      alert("❌ No se pudieron guardar los cambios.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            Panel de Control Staff
          </h2>
          <p className="text-orange-400 font-medium text-xs uppercase tracking-widest">
            Gestión de Accesos y Seguridad
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase"
        >
          ← Volver al Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl h-fit text-left">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-orange-500">✚</span> Nuevo Registro
          </h3>
          <form onSubmit={handleRegistro} className="space-y-4">
            <div>
              <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block">
                Nombre del Staff
              </label>
              <input
                type="text"
                placeholder="Ej. Coach Carlos"
                className="w-full bg-[#0f172a] p-4 rounded-2xl border border-gray-700 text-white outline-none focus:border-orange-500 transition-all font-bold"
                onChange={(e) =>
                  setNuevoMiembro({ ...nuevoMiembro, nombre: e.target.value })
                }
                required
                value={nuevoMiembro.nombre}
              />
            </div>
            <div>
              <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block">
                ID de Usuario
              </label>
              <input
                type="text"
                placeholder="UsuarioApp"
                className="w-full bg-[#0f172a] p-4 rounded-2xl border border-gray-700 text-white outline-none focus:border-orange-500 transition-all font-bold"
                onChange={(e) =>
                  setNuevoMiembro({ ...nuevoMiembro, usuario: e.target.value })
                }
                required
                value={nuevoMiembro.usuario}
              />
            </div>
            <div>
              <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block">
                Contraseña Provisional
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0f172a] p-4 rounded-2xl border border-gray-700 text-white outline-none focus:border-orange-500 transition-all font-bold"
                onChange={(e) =>
                  setNuevoMiembro({ ...nuevoMiembro, password: e.target.value })
                }
                required
                value={nuevoMiembro.password}
              />
            </div>

            <div>
              <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block tracking-widest">
                Rol / Cargo
              </label>
              <select
                value={nuevoMiembro.rol}
                onChange={(e) =>
                  setNuevoMiembro({ ...nuevoMiembro, rol: e.target.value })
                }
                className="w-full bg-[#0f172a] border border-gray-700 rounded-2xl p-4 text-white font-bold focus:border-orange-500 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="Staff">Staff (App Móvil)</option>
                <option value="Admin">Admin (Panel Web)</option>
              </select>
            </div>

            <button className="w-full bg-orange-600 py-4 rounded-2xl font-black text-white hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/20 mt-4 uppercase tracking-widest">
              Autorizar Acceso
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 BUSCAR POR NOMBRE O ROL..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#1e293b] border border-gray-700 p-4 rounded-2xl text-white text-xs font-bold focus:border-orange-500 outline-none transition-all placeholder:text-gray-600 uppercase tracking-widest"
            />
          </div>

          <div className="bg-[#1e293b] rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
            <div
              style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
            >
              <table className="w-full text-left border-collapse min-w-[350px]">
                <thead className="bg-[#0f172a] text-orange-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="p-5">Personal Autorizado</th>
                    <th className="p-5">Rol / Cargo</th>
                    <th className="p-5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {staffFiltrado.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-orange-500/5 transition-colors"
                    >
                      <td className="p-5 text-left">
                        <p
                          className="font-bold text-white uppercase text-sm cursor-pointer hover:text-orange-400 transition-colors inline-block"
                          onClick={() => verPerfilStaff(s)}
                        >
                          {s.nombre} 🔍
                        </p>
                        <p
                          className={`text-[9px] font-black uppercase mt-1 ${s.estado === "activo" ? "text-green-500" : "text-red-500"}`}
                        >
                          • {s.estado}
                        </p>
                      </td>
                      <td className="p-5 text-left">
                        <span className="text-[10px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-lg font-black uppercase">
                          {s.rol}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => cambiarEstado(s.id, s.estado)}
                          className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all ${s.estado === "activo" ? "text-red-500 hover:bg-red-500/10" : "text-green-500 hover:bg-green-500/10"}`}
                        >
                          {s.estado === "activo" ? "Revocar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {staffFiltrado.length === 0 && (
              <div className="p-10 text-center text-gray-600 font-bold uppercase text-xs tracking-widest italic">
                No se encontraron coincidencias...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL DE EXPEDIENTE / FOTO / EDICIÓN --- */}
      {isViewModalOpen && staffSeleccionado && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-orange-500/30 shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#0f172a] to-orange-900 p-8 text-left flex justify-between items-start">
              <div>
                <span className="bg-orange-500 text-[9px] px-2 py-1 rounded font-black uppercase tracking-widest text-white">
                  Personal Autorizado
                </span>
                <h2 className="text-3xl font-black text-white uppercase mt-2 tracking-tighter italic leading-none">
                  {staffSeleccionado.nombre}
                </h2>
                <p className="text-orange-300 font-mono text-sm mt-1">
                  {staffSeleccionado.rol}
                </p>
              </div>
              <button
                onClick={() => setIsEditando(!isEditando)}
                className="bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-all shadow-md"
              >
                {isEditando ? "❌ Cancelar Edición" : "✏️ Modificar Datos"}
              </button>
            </div>

            <div className="p-8 space-y-6 flex flex-col items-center">
              {!isEditando ? (
                <>
                  {/* 🟢 FOTO DE PERFIL DEL STAFF EN LUGAR DEL QR */}
                  <div className="w-36 h-36 rounded-full border-4 border-orange-500/40 bg-[#0f172a] overflow-hidden flex items-center justify-center shadow-inner mb-2">
                    {staffSeleccionado.foto_perfil ? (
                      <img
                        src={staffSeleccionado.foto_perfil}
                        alt="Foto de Perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-[#0f172a] p-4 rounded-2xl border border-gray-700 text-left">
                      <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">
                        ID Acceso
                      </p>
                      <p className="text-white font-mono text-lg">
                        {staffSeleccionado.usuario}
                      </p>
                    </div>
                    <div className="bg-[#0f172a] p-4 rounded-2xl border border-gray-700 text-left">
                      <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">
                        Estatus
                      </p>
                      <p
                        className={`font-black uppercase ${staffSeleccionado.estado === "activo" ? "text-green-400" : "text-red-400"}`}
                      >
                        {staffSeleccionado.estado}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* FORMULARIO DE EDICIÓN */
                <form onSubmit={handleActualizarStaff} className="w-full space-y-4 text-left">
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] p-3 rounded-xl border border-gray-700 text-white outline-none focus:border-orange-500 font-bold text-sm"
                      value={datosEdicion.nombre}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, nombre: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block">
                      ID de Usuario
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#0f172a] p-3 rounded-xl border border-gray-700 text-white outline-none focus:border-orange-500 font-bold text-sm"
                      value={datosEdicion.usuario}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, usuario: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block">
                      Nueva Contraseña (Opcional)
                    </label>
                    <input
                      type="password"
                      placeholder="Dejar en blanco para mantener la actual"
                      className="w-full bg-[#0f172a] p-3 rounded-xl border border-gray-700 text-white outline-none focus:border-orange-500 font-bold text-sm placeholder:text-gray-600"
                      value={datosEdicion.password}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, password: e.target.value })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg mt-2"
                  >
                    💾 Guardar Cambios
                  </button>
                </form>
              )}
            </div>

            <div className="p-6 bg-[#0f172a]/50">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setIsEditando(false);
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionStaff;