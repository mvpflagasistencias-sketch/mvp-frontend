import { useState, useEffect } from 'react'; // 🚀 IMPORTADO useEffect
import Login from './Login.jsx';
import RegistroJugadores from './RegistroJugadores.jsx';
import RegistroEquipos from './RegistroEquipos.jsx'; 
import GestionJugadores from './GestionJugadores.jsx';
import GestionStaff from './GestionStaff.jsx';
import MonitorAsistencias from './MonitorAsistencias.jsx'; 
import CardPromociones from './CardPromociones.jsx'; // 🚀 IMPORTADO DE FORMA MODULAR
import GestionPromociones from './GestionPromociones.jsx'; // 🚀 DESCOMENTADO PARA RENDERIZAR LA VISTA

// 👈 COMENTADO QUIRÚRGICAMENTE: Evita que Vite truene al no encontrar los archivos en esta carpeta
// import LoginJugador from './LoginJugador.jsx';
// import PerfilJugador from './PerfilJugador.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  
  // 🚀 NUEVO ESTADO: Controla si estamos en el portal de Staff o en el de Jugadores
  const [portalMode, setPortalMode] = useState('staff'); 
  // 🚀 NUEVO ESTADO: Almacena los datos del jugador autenticado en su sesión privada
  const [jugadorActual, setJugadorActual] = useState(null);
  // 🚀 NUEVO ESTADO: Controla la vista dentro del portal de jugadores (login o registro)
  const [vistaJugador, setVistaJugador] = useState('login');

  // =========================================================================
  // 🔄 PERSISTENCIA DE SESIÓN: Recupera el usuario si existe un token activo
  // =========================================================================
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Si tienes un endpoint para validar el token y traer el usuario completo, puedes hacer el fetch aquí.
    // Como solución inmediata para que no te bote, si encuentra un token le asigna un estado provisional.
    if (token && !user) {
      // Reemplaza esto con los datos reales que use tu app si es necesario, o déjalo provisional
      setUser({ nombre: localStorage.getItem('user_nombre') || 'Staff' });
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    // Si tu backend te regresa el nombre, guárdalo para que al recargar se mantenga en el Navbar
    if (userData?.nombre) {
      localStorage.setItem('user_nombre', userData.nombre);
    }
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_nombre'); // Limpia también el nombre guardado
    setUser(null);
    setView('dashboard');
  };

  // =========================================================================
  // 🏈 CONTROL DE FLUJO EXCLUSIVO PARA EL PORTAL DE JUGADORES
  // =========================================================================
  if (portalMode === 'jugador') {
    // Si el jugador no ha iniciado sesión, renderizamos su login o registro privado
    if (!jugadorActual && !localStorage.getItem('atleta_id')) {
      return (
        <div>
          {vistaJugador === 'login' ? (
            /* 👈 COMENTADO: Evita llamadas a componentes no importados */
            /* <LoginJugador 
              onLoginSuccess={(jugador) => setJugadorActual(jugador)} 
              onSwitchToRegister={() => setVistaJugador('registro')}
            /> */
            <div className="text-center p-10 text-gray-400 font-bold uppercase text-xs">Módulo del portal de jugador externo</div>
          ) : (
            <RegistroJugadores onBack={() => setVistaJugador('login')} />
          )}
          
          {/* Botón flotante discreto para regresar al login administrativo del Staff */}
          <div className="text-center bg-[#0f172a] pb-8">
            <button 
              onClick={() => setPortalMode('staff')} 
              className="text-xs font-bold text-gray-500 hover:text-blue-400 uppercase tracking-wider transition-all"
            >
              ← Volver al Acceso de Staff / Árbitros
            </button>
          </div>
        </div>
      );
    }
    
    // Si ya está autenticado, le pintamos directamente su Licencia Digital / Perfil privado
    return (
      /* 👈 COMENTADO: Evita llamadas a componentes no importados */
      /* <PerfilJugador 
        jugadorId={jugadorActual?.id} 
        onLogout={() => {
          setJugadorActual(null);
          setPortalMode('staff');
        }} 
      /> */
      <div className="text-center p-10 text-gray-400 font-bold uppercase text-xs">Licencia cargada desde el portal externo</div>
    );
  }

  // =========================================================================
  // 🔑 FLUJO ESTÁNDAR Y ORIGINAL PARA EL STAFF ADMINISTRATIVO
  // =========================================================================
  if (!user) {
    return (
      <div>
        <Login onLoginSuccess={handleLoginSuccess} />
        {/* Botón de desvío para que el jugador se desplace a su login privado sin tocar código */}
        <div className="text-center bg-[#0F172A] pb-10">
          <button 
            onClick={() => setPortalMode('jugador')} 
            className="px-6 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold border border-blue-600/30 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg"
          >
            ¿Eres Jugador? Ingresa a tu Licencia Digital →
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'registro':
        return <RegistroJugadores onBack={() => setView('dashboard')} />;
      case 'bitacora':
        return <GestionJugadores onBack={() => setView('dashboard')} alRegistro={() => setView('registro')} />;
      case 'equipos':
        return <RegistroEquipos onBack={() => setView('dashboard')} />;
      case 'staff':
        return <GestionStaff onBack={() => setView('dashboard')} />;
      case 'asistencias': 
        return <MonitorAsistencias onBack={() => setView('dashboard')} />;
      case 'promociones':
        return <GestionPromociones onBack={() => setView('dashboard')} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
            {/* NUEVO ATLETA */}
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700 hover:border-blue-500 transition-all text-left shadow-lg">
              <div className="text-4xl mb-4">✍️</div>
              <h3 className="text-xl font-bold mb-2">Nuevo Atleta</h3>
              <p className="text-gray-400 text-sm mb-6">Registro de nuevos ingresos.</p>
              <button onClick={() => setView('registro')} className="w-full bg-blue-600 py-3 rounded-xl font-bold">Registrar</button>
            </div>

            {/* MONITOR DE CAMPO */}
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-green-500/30 hover:border-green-500 transition-all text-left shadow-lg">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-xl font-bold mb-2 text-green-400 uppercase italic">Monitor En Vivo</h3>
              <p className="text-gray-400 text-sm mb-6">Asistencias escaneadas por Staff.</p>
              <button onClick={() => setView('asistencias')} className="w-full bg-green-600 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">Monitorear</button>
            </div>

            {/* BITÁCORA */}
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700 hover:border-cyan-500 transition-all text-left shadow-lg">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-2">Bitácora Digital</h3>
              <p className="text-gray-400 text-sm mb-6">Consulta y edición de perfiles.</p>
              <button onClick={() => setView('bitacora')} className="w-full bg-cyan-600 py-3 rounded-xl font-bold">Ver Listado</button>
            </div>

            {/* EQUIPOS */}
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700 hover:border-purple-500 transition-all text-left shadow-lg">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Equipos</h3>
              <p className="text-gray-400 text-sm mb-6">Gestión de ligas y clubes.</p>
              <button onClick={() => setView('equipos')} className="w-full bg-purple-600 py-3 rounded-xl font-bold">Gestionar</button>
            </div>

            {/* STAFF */}
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700 hover:border-orange-500 transition-all text-left border-orange-500/30 shadow-lg">
              <div className="text-4xl mb-4">🔑</div>
              <h3 className="text-xl font-bold mb-2 text-white">Control Staff</h3>
              <p className="text-gray-400 text-sm mb-6">Gestión de accesos y roles.</p>
              <button onClick={() => setView('staff')} className="w-full bg-orange-600 py-3 rounded-xl font-bold">Gestionar</button>
            </div>

            {/* PROMOCIONES */}
            <CardPromociones alGestionar={() => setView('promociones')} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans p-4 md:p-8">
      {/* NAVBAR ACTUALIZADO */}
      <nav className="flex justify-between items-center bg-[#1e293b] p-5 rounded-2xl shadow-2xl border-b-2 border-blue-600 mb-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="bg-blue-600 p-2 rounded-lg font-black text-white shadow-lg shadow-blue-900/40 uppercase">MVP</div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter italic uppercase">Flag <span className="text-blue-500">System</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-gray-400 text-[10px] font-black uppercase tracking-widest">
            Sesión activa: <strong className="text-white ml-1">{user?.nombre}</strong>
          </span>
          <button onClick={handleLogout} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-xl border border-red-600/30 transition-all font-black text-[10px] uppercase tracking-widest">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;