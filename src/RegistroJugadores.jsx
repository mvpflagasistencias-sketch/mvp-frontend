import { useState, useEffect } from "react";
// IMPORTANTE: Usamos nuestra instancia personalizada
import api from "./api";

const RegistroJugadores = ({ onBack }) => {
  const [equipos, setEquipos] = useState([]); // Lista de equipos desde la DB
  const [loading, setLoading] = useState(false);

  // 🟢 ESTADO UNIFICADO Y EXTENDIDO (COPIADO DEL REGISTRO DE ATLETA)
  const [formData, setFormData] = useState({
    nombre: "",
    edad: "",
    telefono: "",
    nombre_tutor: "",
    numero_jersey: "",
    correo: "",
    password: "", // 👈 Agregado aquí
    equiposSeleccionados: [""],
    equiposManuales: [{}],
    genero: "Masculino",
    foto_perfil: null,
  });

  // Cargar equipos de la base de datos al iniciar
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await api.get("/api/equipos");
        console.log("📦 Equipos recibidos de la API:", res.data);
        setEquipos(res.data);
      } catch (err) {
        console.error("Error al cargar equipos", err);
      }
    };
    fetchEquipos();
  }, []);

  // Procesador de archivo para conversión Base64 en caliente
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, foto_perfil: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 🟢 FUNCIONES DE MANEJO DE EQUIPOS DINÁMICOS
  const agregarEquipo = () => {
    if (formData.equiposSeleccionados.length < 4) {
      setFormData((prev) => ({
        ...prev,
        equiposSeleccionados: [...prev.equiposSeleccionados, ""],
        equiposManuales: [...prev.equiposManuales, {}],
      }));
    }
  };

  const eliminarEquipo = (index) => {
    const nuevosSeleccionados = formData.equiposSeleccionados.filter(
      (_, i) => i !== index,
    );
    const nuevosManuales = formData.equiposManuales.filter(
      (_, i) => i !== index,
    );
    setFormData((prev) => ({
      ...prev,
      equiposSeleccionados: nuevosSeleccionados,
      equiposManuales: nuevosManuales,
    }));
  };

  const handleEquipoSelect = (index, value) => {
    const nuevos = [...formData.equiposSeleccionados];
    nuevos[index] = value;
    setFormData((prev) => ({ ...prev, equiposSeleccionados: nuevos }));
  };

  // 🟢 handleSubmit UNIFICADO Y BLINDADO (Con la regla de 2 de rama + 2 mixtos)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validacion de correo
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.correo && !regexCorreo.test(formData.correo)) {
      alert(
        "⚠️ Por favor, introduce un correo electrónico válido (ej. usuario@gmail.com).",
      );
      return;
    }

    // 🟢 VALIDACIÓN ESTRICTA: Máximo 2 de su rama principal y 2 mixtos ESTRICTA DE GÉNERO VS CATEGORÍA Y LÍMITES
    let contadorRamaPrincipal = 0;
    let contadorMixtos = 0;
    let idsFinales = [];
    let manualesFinales = [];

    const generoJugador = (formData.genero || "MASCULINO").toUpperCase();

    for (let i = 0; i < formData.equiposSeleccionados.length; i++) {
      const val = formData.equiposSeleccionados[i];
      let nombreEquipoStr = "";
      let categoriaEquipo = "";

      if (val === "OTRO_EQUIPO") {
        const manualObj = formData.equiposManuales?.[i];
        if (!manualObj || !manualObj.nombre) {
          alert(
            `⚠️ Por favor completa el nombre del equipo manual #${i + 1} o elimínalo.`,
          );
          return;
        }
        nombreEquipoStr = manualObj.nombre;
        categoriaEquipo = manualObj.categoria || "";
        manualesFinales.push(manualObj);
      } else if (val) {
        const encontrado = equipos.find(
          (eq) =>
            eq?.nombre_equipo &&
            eq.nombre_equipo.toUpperCase() === val.toUpperCase(),
        );
        if (encontrado) {
          nombreEquipoStr = encontrado.nombre_equipo;
          categoriaEquipo = encontrado.categoria || "";
          idsFinales.push(encontrado.id);
        }
      }

      if (!categoriaEquipo) continue;

      const catUpper = categoriaEquipo.toUpperCase();

      // 🚨 REGLA DE ORO: Un jugador Femenil NO puede ir a Varonil, ni Masculino a Femenil
      const esHombre =
        generoJugador.includes("MASC") || generoJugador.includes("VARONIL");
      const esMujer = generoJugador.includes("FEM");

      if (esHombre && catUpper.includes("FEMENIL")) {
        alert(
          `⚠️ Error de inscripción: El atleta es de género Masculino y no puede inscribirse al equipo "${nombreEquipoStr}" que es de categoría FEMENIL.`,
        );
        return;
      }

      if (esMujer && catUpper.includes("VARONIL")) {
        alert(
          `⚠️ Error de inscripción: La atleta es de género Femenil y no puede inscribirse al equipo "${nombreEquipoStr}" que es de categoría VARONIL.`,
        );
        return;
      }

      // Conteo para los límites (máximo 2 de su rama y 2 mixtos)
      const esRamaPrincipal =
        (esHombre && catUpper.includes("VARONIL")) ||
        (esMujer && catUpper.includes("FEMENIL"));

      if (esRamaPrincipal) {
        contadorRamaPrincipal++;
      } else if (catUpper.includes("MIXTO")) {
        contadorMixtos++;
      }
    }

    if (contadorRamaPrincipal > 2) {
      alert(
        `⚠️ Solo puedes pertenecer a un máximo de 2 equipos de tu misma rama. Tienes ${contadorRamaPrincipal}.`,
      );
      return;
    }

    if (contadorMixtos > 2) {
      alert(
        `⚠️ Solo puedes pertenecer a un máximo de 2 equipos MIXTOS. Tienes ${contadorMixtos}.`,
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        equipos_ids: idsFinales,
        equipos_manuales: manualesFinales,
      };

      delete payload.equiposSeleccionados;
      delete payload.equiposManuales;
      delete payload.genero;

      await api.post("/api/jugadores/registro", payload);
      alert("✅ ¡Jugador guardado con éxito y equipos enlazados!");
      if (onBack) onBack();
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || "Error al registrar"));
    } finally {
      setLoading(false);
    }
  };

  // ESTILOS DE TAILWIND
  const inputBaseClass =
    "w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all";
  const inputErrorClass =
    "w-full bg-[#0f172a] border-2 border-blue-600 p-4 rounded-2xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-5">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Registro de Atleta (Panel Central)
            </h2>
          </div>
          <button
            onClick={onBack}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-all"
          >
            ← Volver al Panel
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Foto de perfil */}
          <div className="md:col-span-2 bg-[#141b2e] p-6 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center gap-6 text-left">
            <div className="w-24 h-24 bg-[#0f172a] rounded-full border-2 border-dashed border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
              {formData.foto_perfil ? (
                <img
                  src={formData.foto_perfil}
                  alt="Previsualización"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-gray-600 font-bold uppercase text-center p-2">
                  Sin Foto
                </span>
              )}
            </div>
            <div className="space-y-2 w-full">
              <label className="block text-white text-sm font-bold">
                Foto Oficial de Credencial
              </label>
              <p className="text-gray-500 text-[10px] uppercase font-semibold">
                Carga la imagen del rostro para la verificación contra
                "Cachirules" en el campo móvil
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 file:cursor-pointer transition-all"
              />
            </div>
          </div>

          {/* Nombre */}
          <div className="md:col-span-2 text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Nombre del Jugador
            </label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              className={inputBaseClass}
              value={formData.nombre}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nombre: e.target.value.toUpperCase(),
                })
              }
              required
            />
          </div>

          {/* Correo */}
          <div className="md:col-span-2 text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              className={inputBaseClass}
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
            />
          </div>

          {/* Edad */}
          <div className="text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Edad
            </label>
            <input
              type="number"
              placeholder="00"
              className={inputBaseClass}
              value={formData.edad}
              onChange={(e) =>
                setFormData({ ...formData, edad: e.target.value })
              }
              required
            />
          </div>

          {/* Género (Importante para la validación de rama) */}
          <div className="text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Género
            </label>
            <select
              className={inputBaseClass}
              value={formData.genero}
              onChange={(e) =>
                setFormData({ ...formData, genero: e.target.value })
              }
              required
            >
              <option value="Masculino" className="bg-[#0f172a]">
                Masculino
              </option>
              <option value="Femenil" className="bg-[#0f172a]">
                Femenil
              </option>
            </select>
          </div>

          {/* 🟢 SECCIÓN DE EQUIPOS MÚLTIPLES (MÁXIMO 4: 2 DE RAMA + 2 MIXTOS) */}
          <div className="md:col-span-2 text-left">
            <label className="block text-gray-400 text-sm font-bold mb-3 ml-1">
              Equipos (Máximo 4: Dos de tu rama y dos mixtos)
            </label>

            {formData.equiposSeleccionados.map((equipoActual, index) => (
              <div
                key={index}
                className="mb-4 p-4 bg-[#0f172a] rounded-2xl border border-gray-800"
              >
                <div className="flex gap-4 items-center">
                  <select
                    className={`${inputBaseClass} !p-3 !m-0 flex-1`}
                    value={equipoActual}
                    onChange={(e) => handleEquipoSelect(index, e.target.value)}
                    required
                  >
                    <option value="">-- Elige un equipo --</option>
                    {Array.isArray(equipos) &&
                      equipos.map((eq) => {
                        if (!eq || !eq.nombre_equipo) return null;
                        const nombreConCategoria = eq.categoria
                          ? `${eq.nombre_equipo} (${eq.categoria})`
                          : eq.nombre_equipo;
                        return (
                          <option
                            key={eq.id}
                            value={eq.nombre_equipo.toUpperCase()}
                          >
                            {nombreConCategoria.toUpperCase()}
                          </option>
                        );
                      })}
                    <option value="OTRO_EQUIPO">
                      + OTRO (Escribir manualmente)
                    </option>
                  </select>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => eliminarEquipo(index)}
                      className="bg-red-600 text-white p-3 rounded-xl font-bold hover:bg-red-500 transition-all"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Si selecciona OTRO_EQUIPO */}
                {equipoActual === "OTRO_EQUIPO" && (
                  <div className="mt-4 space-y-4">
                    {/* Validación visual de duplicados */}
                    {Array.isArray(equipos) &&
                      formData.equiposManuales?.[index]?.nombre &&
                      equipos.some(
                        (eq) =>
                          eq &&
                          typeof eq.nombre_equipo === "string" &&
                          eq.nombre_equipo.trim().toUpperCase() ===
                            (formData.equiposManuales[index]?.nombre || "")
                              .trim()
                              .toUpperCase(),
                      ) && (
                        <p className="text-red-500 text-xs m-0 p-0">
                          ⚠️ ¡Este equipo ya existe! Selecciónalo en la lista
                          superior para ahorrar tiempo.
                        </p>
                      )}

                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        className={`${inputErrorClass} flex-2 !m-0`}
                        placeholder={`NOMBRE DEL EQUIPO MANUAL #${index + 1}`}
                        value={formData.equiposManuales?.[index]?.nombre || ""}
                        onChange={(e) => {
                          const manualesCopy = [
                            ...(formData.equiposManuales || []),
                          ];
                          manualesCopy[index] = {
                            ...(manualesCopy[index] || {}),
                            nombre: e.target.value
                              ? e.target.value.toUpperCase()
                              : "",
                          };
                          setFormData({
                            ...formData,
                            equiposManuales: manualesCopy,
                          });
                        }}
                        autoComplete="off"
                        required
                      />

                      <select
                        className={`${inputErrorClass} flex-1 !m-0`}
                        value={
                          formData.equiposManuales?.[index]?.categoria || ""
                        }
                        onChange={(e) => {
                          const manualesCopy = [
                            ...(formData.equiposManuales || []),
                          ];
                          manualesCopy[index] = {
                            ...(manualesCopy[index] || {}),
                            categoria: e.target.value,
                          };
                          setFormData({
                            ...formData,
                            equiposManuales: manualesCopy,
                          });
                        }}
                      >
                        <option value="" className="bg-[#0f172a]">
                          -- Categoría --
                        </option>
                        <option value="VARONIL" className="bg-[#0f172a]">
                          VARONIL
                        </option>
                        <option value="FEMENIL" className="bg-[#0f172a]">
                          FEMENIL
                        </option>
                        <option value="MIXTO" className="bg-[#0f172a]">
                          MIXTO
                        </option>
                        <option value="JUVENIL" className="bg-[#0f172a]">
                          JUVENIL
                        </option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Botón para agregar más equipos */}
            {formData.equiposSeleccionados.length < 4 && (
              <button
                type="button"
                onClick={agregarEquipo}
                className="text-blue-400 font-bold text-sm mt-2 hover:underline p-0 bg-transparent border-none cursor-pointer"
              >
                + Agregar otro equipo (Máximo 4)
              </button>
            )}
          </div>

          {/* Teléfono */}
          <div className="text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              placeholder="10 dígitos"
              className={inputBaseClass}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              required
            />
          </div>

          {/* Número de Jersey */}
          <div className="text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Número de Jersey (#)
            </label>
            <input
              type="number"
              placeholder="Ej. 07"
              className={inputBaseClass}
              onChange={(e) =>
                setFormData({ ...formData, numero_jersey: e.target.value })
              }
            />
          </div>

          {/* Contraseña */}
          <div className="text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Contraseña de Acceso
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              className={inputBaseClass}
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          {/* Tutor */}
          <div className="md:col-span-2 text-left">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Nombre del Tutor (Opcional)
            </label>
            <input
              type="text"
              placeholder="En caso de ser menor de edad"
              className={inputBaseClass}
              onChange={(e) =>
                setFormData({ ...formData, nombre_tutor: e.target.value })
              }
            />
          </div>

          {/* Botón de Enviar */}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${
                loading
                  ? "bg-gray-600 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 text-white cursor-pointer"
              }`}
            >
              {loading ? "REGISTRANDO..." : "CONFIRMAR REGISTRO DE JUGADOR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroJugadores;
