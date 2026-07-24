import { useState } from "react";
// IMPORTANTE: Cambiamos axios por nuestra instancia personalizada
import api from "./api";

// RECIBIMOS LA PROPIEDAD: onSwitchToJugador para cambiar de portal
const Login = ({ onLoginSuccess, onSwitchToJugador }) => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  // 🟢 NUEVOS ESTADOS PARA LA RECUPERACIÓN POR CORREO
  const [isRecuperando, setIsRecuperando] = useState(false);
  const [correoRecuperacion, setCorreoRecuperacion] = useState("");
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const res = await api.post("/api/staff/login", {
        usuario,
        password,
      });

      console.log("Respuesta del servidor:", res.data);

      if (res.data.user) {
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      console.error(
        "Error detallado del login:",
        err.response ? err.response.data : err.message,
      );
      alert(
        "❌ Error: " +
          (err.response?.data?.message ||
            err.response?.data?.error ||
            "No se pudo conectar con el servidor"),
      );
    } finally {
      setCargando(false);
    }
  };

  // 🟢 NUEVA FUNCIÓN: Solicitar el correo de recuperación al backend
  const handleSolicitarPassword = async (e) => {
    e.preventDefault();
    setEnviandoCorreo(true);

    try {
      const res = await api.post("/api/staff/solicitar-cambio-password", {
        correo: correoRecuperacion,
      });

      alert("✅ " + (res.data.message || "Se ha enviado un correo con las instrucciones de recuperación."));
      setIsRecuperando(false);
      setCorreoRecuperacion("");
    } catch (err) {
      console.error("Error al solicitar recuperación:", err);
      alert(
        "❌ Error: " +
          (err.response?.data?.error || "No se pudo procesar la solicitud de recuperación.")
      );
    } finally {
      setEnviandoCorreo(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      {!isRecuperando ? (
        /* VISTA PRINCIPAL DE LOGIN */
        <form
          onSubmit={handleSubmit}
          className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl w-full max-w-md text-left animate-in fade-in zoom-in duration-300"
        >
          <div className="mb-8 text-center">
            <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-2xl text-white shadow-lg shadow-blue-500/20">
              MVP
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Acceso <span className="text-blue-400">Admin</span>
            </h2>
            <p className="text-gray-500 text-xs mt-2 uppercase font-bold tracking-widest">
              Estadía 2026
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block">
                Usuario
              </label>
              <input
                type="text"
                className="w-full bg-[#0f172a] p-4 rounded-2xl border border-gray-700 text-white outline-none focus:border-blue-500 transition-all font-bold"
                placeholder="Tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                disabled={cargando}
              />
            </div>

            <div>
              <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full bg-[#0f172a] p-4 rounded-2xl border border-gray-700 text-white outline-none focus:border-blue-500 transition-all font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={cargando}
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsRecuperando(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors uppercase tracking-wider"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-4 rounded-2xl font-black text-white transition-all mt-2 uppercase tracking-widest text-xs shadow-lg ${
                cargando
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
              }`}
            >
              {cargando ? "Verificando..." : "Entrar al Sistema"}
            </button>
          </div>
        </form>
      ) : (
        /* VISTA PARA SOLICITAR RECUPERACIÓN POR CORREO */
        <form
          onSubmit={handleSolicitarPassword}
          className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl w-full max-w-md text-left animate-in fade-in zoom-in duration-300"
        >
          <div className="mb-8 text-center">
            <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-2xl text-white shadow-lg shadow-orange-500/20">
              🔑
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Recuperar <span className="text-orange-400">Contraseña</span>
            </h2>
            <p className="text-gray-400 text-xs mt-2 font-medium">
              Ingresa el correo electrónico registrado en tu cuenta de administrador para enviarte un enlace de restablecimiento.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-500 text-[10px] font-black uppercase mb-1 block">
                Correo Electrónico Admin
              </label>
              <input
                type="email"
                className="w-full bg-[#0f172a] p-4 rounded-2xl border border-gray-700 text-white outline-none focus:border-orange-500 transition-all font-bold"
                placeholder="admin@liga.com"
                value={correoRecuperacion}
                onChange={(e) => setCorreoRecuperacion(e.target.value)}
                required
                disabled={enviandoCorreo}
              />
            </div>

            <button
              type="submit"
              disabled={enviandoCorreo}
              className={`w-full py-4 rounded-2xl font-black text-white transition-all mt-4 uppercase tracking-widest text-xs shadow-lg ${
                enviandoCorreo
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-500 shadow-orange-900/20"
              }`}
            >
              {enviandoCorreo ? "Enviando enlace..." : "Enviar Enlace de Recuperación"}
            </button>

            <button
              type="button"
              onClick={() => setIsRecuperando(false)}
              disabled={enviandoCorreo}
              className="w-full py-3 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors mt-2 text-center block"
            >
              ← Volver al Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;