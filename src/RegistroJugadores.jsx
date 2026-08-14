import { useState, useEffect } from "react";
import api from "./api";

const RegistroJugadores = ({ onBack }) => {
  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    genero: "Masculino",
    categoria: "",
    numero_jersey: "",
    password: "",
    edad: "",
    nombre_tutor: "",
    foto_perfil: null,
    acepta_privacidad: false,
    inscripciones: [
      {
        torneo_id: "",
        equiposSeleccionados: [""],
        equiposManuales: [{}],
        equiposDisponibles: [],
        colapsado: false,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEquipos, resTorneos] = await Promise.all([
          api.get("/api/equipos"),
          api.get("/api/torneos"),
        ]);
        setEquipos(resEquipos.data);
        setTorneos(resTorneos.data);
      } catch (err) {
        console.error("Error cargando datos iniciales", err);
      }
    };
    fetchData();
  }, []);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, foto_perfil: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gen = (formData.genero || "").trim().toUpperCase();
    const catGlobal = (formData.categoria || "").trim().toUpperCase();

    if (gen.includes("MASC") && catGlobal === "FEMENIL") {
      alert("⚠️ Un jugador con género Masculino no puede registrarse con categoría general Femenil.");
      return;
    }
    if (gen.includes("FEM") && catGlobal === "VARONIL") {
      alert("⚠️ Un jugador con género Femenil no puede registrarse con categoría general Varonil.");
      return;
    }

    if (!formData.inscripciones || formData.inscripciones.length === 0) {
      alert("⚠️ Por favor, añade al menos un torneo.");
      return;
    }

    for (let indexTorneo = 0; indexTorneo < formData.inscripciones.length; indexTorneo++) {
      const insc = formData.inscripciones[indexTorneo];
      const numTorneo = indexTorneo + 1;

      if (!insc.torneo_id) {
        alert(`⚠️ El Torneo #${numTorneo} no ha sido seleccionado.`);
        return;
      }

      const equiposSeleccionadosValidos = (insc.equiposSeleccionados || []).filter((el) => el && el.trim() !== "");
      if (equiposSeleccionadosValidos.length === 0) {
        alert(`⚠️ El Torneo #${numTorneo} debe tener al menos un equipo seleccionado.`);
        return;
      }

      let contadorRamaPrincipal = 0;
      let contadorMixtos = 0;
      const esMasculino = gen.includes("MASC");
      const esFemenino = gen.includes("FEM");

      for (let i = 0; i < insc.equiposSeleccionados.length; i++) {
        const val = insc.equiposSeleccionados[i];
        if (!val || val === "") continue;

        let categoriaEquipo = "";

        if (val === "OTRO_EQUIPO") {
          categoriaEquipo = insc.equiposManuales?.[i]?.categoria || "";
        } else {
          const encontrado = 
            insc.equiposDisponibles?.find(eq => eq?.nombre_equipo && eq.nombre_equipo.toUpperCase() === val.toUpperCase()) ||
            equipos.find(eq => eq?.nombre_equipo && eq.nombre_equipo.toUpperCase() === val.toUpperCase());
          categoriaEquipo = encontrado?.categoria || "";
        }

        const catUpper = categoriaEquipo.toUpperCase().trim();

        if (esMasculino && catUpper === "FEMENIL") {
          alert(`⚠️ Torneo #${numTorneo}: No puedes registrarte en el equipo "${val}" porque es de categoría FEMENIL y tu género es Masculino.`);
          return;
        }
        if (esFemenino && catUpper === "VARONIL") {
          alert(`⚠️ Torneo #${numTorneo}: No puedes registrarte en el equipo "${val}" porque es de categoría VARONIL y tu género es Femenil.`);
          return;
        }

        const esRamaPrincipal =
          (esMasculino && catUpper === "VARONIL") ||
          (esFemenino && catUpper === "FEMENIL");

        if (esRamaPrincipal) {
          contadorRamaPrincipal++;
        } else if (catUpper === "MIXTO") {
          contadorMixtos++;
        }
      }

      if (contadorRamaPrincipal > 2) {
        alert(`⚠️ En el Torneo #${numTorneo}, máximo 2 equipos de tu rama. Tienes ${contadorRamaPrincipal}.`);
        return;
      }
      if (contadorMixtos > 2) {
        alert(`⚠️ En el Torneo #${numTorneo}, máximo 2 equipos MIXTOS. Tienes ${contadorMixtos}.`);
        return;
      }
    }

    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexCorreo.test(formData.correo)) {
      alert("⚠️ Correo electrónico inválido.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        inscripciones: formData.inscripciones.map((insc) => ({
          torneo_id: insc.torneo_id,
          equipos_seleccionados: (insc.equiposSeleccionados || []).filter(Boolean),
          equipos_manuales: (insc.equiposManuales || []).filter((m) => m && m.nombre),
        })),
      };

      await api.post("/api/jugadores/registro", payload);
      alert("✅ ¡Jugador guardado con éxito y equipos enlazados!");
      if (onBack) onBack();
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || "Error al registrar"));
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClass =
    "w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all";
  const inputErrorClass =
    "w-full bg-[#0f172a] border-2 border-blue-600 p-4 rounded-2xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 text-left">
      <div className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-5">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Registro de Atleta (Panel Central)
            </h2>
          </div>
          <button
            onClick={onBack}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            ← Volver al Panel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Foto de perfil */}
          <div className="md:col-span-2 bg-[#141b2e] p-6 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center gap-6">
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
                Carga la imagen del rostro para la verificación contra "Cachirules" en el campo móvil
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 file:cursor-pointer transition-all"
              />
            </div>
          </div>

          {/* Torneos y Equipos Dinámicos */}
          <div className="md:col-span-2">
            <label className="block text-blue-400 text-base font-bold mb-4">
              Torneos y Equipos en los que participas
            </label>

            {(formData.inscripciones || []).map((inscripcion, indexTorneo) => {
              const torneoObj = torneos.find(
                (t) => String(t.id) === String(inscripcion.torneo_id)
              );
              const nombreTorneoStr = torneoObj
                ? torneoObj.nombre_torneo || torneoObj.nombre
                : "Torneo sin seleccionar";

              return (
                <div
                  key={indexTorneo}
                  className="bg-[#141b2e] p-5 rounded-2xl border border-gray-700 mb-5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm">
                      Torneo #{indexTorneo + 1} {inscripcion.colapsado ? `- (${nombreTorneoStr})` : ""}
                    </span>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const nuevas = [...formData.inscripciones];
                          nuevas[indexTorneo].colapsado = !nuevas[indexTorneo].colapsado;
                          setFormData({ ...formData, inscripciones: nuevas });
                        }}
                        className="bg-gray-700 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-600 transition-all cursor-pointer"
                      >
                        {inscripcion.colapsado ? "Editar ✏️" : "Minimizar 🗕"}
                      </button>

                      {formData.inscripciones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const nuevasInscripciones = formData.inscripciones.filter(
                              (_, i) => i !== indexTorneo
                            );
                            setFormData({ ...formData, inscripciones: nuevasInscripciones });
                          }}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500 transition-all cursor-pointer"
                        >
                          Eliminar ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {!inscripcion.colapsado && (
                    <div className="mt-4 space-y-4">
                      {/* Selector de Torneo */}
                      <select
                        className={inputBaseClass}
                        value={inscripcion.torneo_id}
                        onChange={async (e) => {
                          const torneoIdSeleccionado = e.target.value;
                          const nuevasInscripciones = [...formData.inscripciones];
                          nuevasInscripciones[indexTorneo].torneo_id = torneoIdSeleccionado;
                          nuevasInscripciones[indexTorneo].equiposSeleccionados = [""];
                          nuevasInscripciones[indexTorneo].equiposDisponibles = [];
                          setFormData({ ...formData, inscripciones: nuevasInscripciones });

                          if (torneoIdSeleccionado) {
                            try {
                              const res = await api.get(`/api/torneos/${torneoIdSeleccionado}/equipos`);
                              const actualizadas = [...formData.inscripciones];
                              actualizadas[indexTorneo].equiposDisponibles = res.data;
                              setFormData({ ...formData, inscripciones: actualizadas });
                            } catch (err) {
                              console.error("Error al cargar equipos del torneo", err);
                            }
                          }
                        }}
                        required
                      >
                        <option value="">-- Elige un torneo --</option>
                        {Array.isArray(torneos) &&
                          torneos.map((t) => (
                            <option key={t.id} value={t.id} className="bg-[#0f172a]">
                              {t.nombre_torneo || t.nombre || `Torneo #${t.id}`}
                            </option>
                          ))}
                      </select>

                      {/* Equipos específicos del torneo */}
                      <div className="border-l-2 border-blue-500 pl-4 space-y-3">
                        <label className="block text-gray-400 text-xs font-bold uppercase">
                          Equipos para este torneo:
                        </label>

                        {(inscripcion.equiposSeleccionados || []).map((equipoActual, indexEq) => (
                          <div key={indexEq} className="space-y-3">
                            <div className="flex gap-3 items-center">
                              <select
                                className={`${inputBaseClass} !p-3 !m-0 flex-1`}
                                value={equipoActual}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const nuevasInscripciones = [...formData.inscripciones];
                                  nuevasInscripciones[indexTorneo].equiposSeleccionados[indexEq] = val;
                                  setFormData({ ...formData, inscripciones: nuevasInscripciones });
                                }}
                                required
                              >
                                <option value="">-- Elige un equipo --</option>
                                {Array.isArray(inscripcion.equiposDisponibles) &&
                                  inscripcion.equiposDisponibles.map((eq) => {
                                    if (!eq || !eq.nombre_equipo) return null;
                                    const nombreConCategoria = eq.categoria
                                      ? `${eq.nombre_equipo} (${eq.categoria})`
                                      : eq.nombre_equipo;
                                    return (
                                      <option key={eq.id} value={eq.nombre_equipo.toUpperCase()}>
                                        {nombreConCategoria.toUpperCase()}
                                      </option>
                                    );
                                  })}
                                <option value="OTRO_EQUIPO">+ OTRO (Escribir manualmente)</option>
                              </select>

                              {inscripcion.equiposSeleccionados.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nuevasInscripciones = [...formData.inscripciones];
                                    nuevasInscripciones[indexTorneo].equiposSeleccionados =
                                      nuevasInscripciones[indexTorneo].equiposSeleccionados.filter((_, i) => i !== indexEq);
                                    nuevasInscripciones[indexTorneo].equiposManuales =
                                      nuevasInscripciones[indexTorneo].equiposManuales.filter((_, i) => i !== indexEq);
                                    setFormData({ ...formData, inscripciones: nuevasInscripciones });
                                  }}
                                  className="bg-red-600 text-white p-3 rounded-xl font-bold hover:bg-red-500 transition-all cursor-pointer"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            {equipoActual === "OTRO_EQUIPO" && (
                              <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                  type="text"
                                  className={`${inputErrorClass} flex-2 !m-0`}
                                  placeholder={`NOMBRE DEL EQUIPO MANUAL #${indexEq + 1}`}
                                  value={inscripcion.equiposManuales?.[indexEq]?.nombre || ""}
                                  onChange={(e) => {
                                    const nuevasInscripciones = [...formData.inscripciones];
                                    if (!nuevasInscripciones[indexTorneo].equiposManuales[indexEq]) {
                                      nuevasInscripciones[indexTorneo].equiposManuales[indexEq] = {};
                                    }
                                    nuevasInscripciones[indexTorneo].equiposManuales[indexEq].nombre = e.target.value
                                      ? e.target.value.toUpperCase()
                                      : "";
                                    setFormData({ ...formData, inscripciones: nuevasInscripciones });
                                  }}
                                  autoComplete="off"
                                  required
                                />

                                <select
                                  className={`${inputErrorClass} flex-1 !m-0`}
                                  value={inscripcion.equiposManuales?.[indexEq]?.categoria || ""}
                                  onChange={(e) => {
                                    const nuevasInscripciones = [...formData.inscripciones];
                                    if (!nuevasInscripciones[indexTorneo].equiposManuales[indexEq]) {
                                      nuevasInscripciones[indexTorneo].equiposManuales[indexEq] = {};
                                    }
                                    nuevasInscripciones[indexTorneo].equiposManuales[indexEq].categoria = e.target.value;
                                    setFormData({ ...formData, inscripciones: nuevasInscripciones });
                                  }}
                                  required
                                >
                                  <option value="">-- Categoría --</option>
                                  <option value="VARONIL" className="bg-[#0f172a]">VARONIL</option>
                                  <option value="FEMENIL" className="bg-[#0f172a]">FEMENIL</option>
                                  <option value="MIXTO" className="bg-[#0f172a]">MIXTO</option>
                                </select>
                              </div>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const nuevasInscripciones = [...formData.inscripciones];
                            nuevasInscripciones[indexTorneo].equiposSeleccionados.push("");
                            nuevasInscripciones[indexTorneo].equiposManuales.push({});
                            setFormData({ ...formData, inscripciones: nuevasInscripciones });
                          }}
                          className="text-blue-400 font-bold text-xs hover:underline bg-transparent border-none cursor-pointer pt-1 block"
                        >
                          + Agregar otro equipo a este torneo
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const nuevas = [...formData.inscripciones];
                          nuevas[indexTorneo].colapsado = true;
                          setFormData({ ...formData, inscripciones: nuevas });
                        }}
                        className="w-full bg-[#1e293b] text-white border border-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all cursor-pointer mt-3"
                      >
                        ✓ Listo (Minimizar torneo)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  inscripciones: [
                    ...formData.inscripciones,
                    {
                      torneo_id: "",
                      equiposSeleccionados: [""],
                      equiposManuales: [{}],
                      equiposDisponibles: [],
                      colapsado: false,
                    },
                  ],
                });
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg cursor-pointer mt-2"
            >
              + Añadir otro torneo
            </button>
          </div>

          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Nombre del Jugador
            </label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              className={inputBaseClass}
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value.toUpperCase() })
              }
              required
            />
          </div>

          {/* Correo */}
          <div className="md:col-span-2">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              className={inputBaseClass}
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              required
            />
          </div>

          {/* Edad */}
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Edad
            </label>
            <input
              type="number"
              placeholder="00"
              className={inputBaseClass}
              value={formData.edad}
              onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
              required
            />
          </div>

          {/* Género */}
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Género
            </label>
            <select
              className={inputBaseClass}
              value={formData.genero}
              onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
              required
            >
              <option value="Masculino" className="bg-[#0f172a]">Masculino</option>
              <option value="Femenil" className="bg-[#0f172a]">Femenil</option>
            </select>
          </div>

          {/* Categoría Global */}
          <div className="md:col-span-2">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Categoría General / Rama Principal
            </label>
            <select
              className={inputBaseClass}
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              required
            >
              <option value="" className="bg-[#0f172a]">-- Elige rama --</option>
              <option value="VARONIL" className="bg-[#0f172a]">VARONIL</option>
              <option value="FEMENIL" className="bg-[#0f172a]">FEMENIL</option>
              <option value="MIXTO" className="bg-[#0f172a]">MIXTO</option>
            </select>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              placeholder="10 dígitos"
              className={inputBaseClass}
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
            />
          </div>

          {/* Número de Jersey */}
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Número de Jersey (#)
            </label>
            <input
              type="number"
              placeholder="Ej. 07"
              className={inputBaseClass}
              value={formData.numero_jersey}
              onChange={(e) => setFormData({ ...formData, numero_jersey: e.target.value })}
            />
          </div>

          {/* Contraseña */}
          <div className="md:col-span-2">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Contraseña de Acceso
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              className={inputBaseClass}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {/* Tutor */}
          <div className="md:col-span-2">
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Nombre del Tutor (Opcional)
            </label>
            <input
              type="text"
              placeholder="En caso de ser menor de edad"
              className={inputBaseClass}
              value={formData.nombre_tutor}
              onChange={(e) => setFormData({ ...formData, nombre_tutor: e.target.value })}
            />
          </div>

          {/* Aviso de Privacidad */}
          <div className="md:col-span-2 bg-[#141b2e] p-4 rounded-2xl border border-gray-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="privacidad"
              required
              className="mt-1 cursor-pointer w-4 h-4"
              onChange={(e) => setFormData({ ...formData, acepta_privacidad: e.target.checked })}
            />
            <label htmlFor="privacidad" className="text-gray-400 text-xs leading-relaxed cursor-pointer">
              Acepto que mis datos personales y fotografía sean recolectados y utilizados exclusivamente para fines internos, control de asistencia y validación de identidad dentro de <strong className="text-white">MVP FLAG LEAGUE</strong>.
            </label>
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