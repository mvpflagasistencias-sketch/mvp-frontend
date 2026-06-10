import { useState } from 'react';
import Login from './Login.jsx';
import RegistroJugadores from './RegistroJugadores.jsx';
import RegistroEquipos from './RegistroEquipos.jsx'; 
import GestionJugadores from './GestionJugadores.jsx';
import GestionStaff from './GestionStaff.jsx';
import MonitorAsistencias from './MonitorAsistencias.jsx'; 

// IMPORTAMOS LAS DOS NUEVAS VISTAS DEL PORTAL PRIVADO DEL ATLETA
import LoginJugador from './LoginJugador.jsx';
import PerfilJugador from './PerfilJugador.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  
  // 🚀 NUEVO ESTADO: Controla si estamos en el portal de Staff o en el de Jugadores
  const [portalMode, setPortalMode] = useState('staff'); 
  // 🚀 NUEVO ESTADO: Almacena los datos del jugador autenticado en su sesión privada
  const [jugadorActual, setJugadorActual] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('dashboard');
  };

  // =========================================================================
  // 🏈 EVALUACIÓN 1: CONTROL DE FLUJO EXCLUSIVO PARA EL PORTAL DE JUGADORES
  // =========================================================================
  if (portalMode === 'jugador') {
    // Si el jugador no ha iniciado sesión, renderizamos su login privado
    if (!jugadorActual && !localStorage.getItem('atleta_id')) {
      return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center p-4">
          <LoginJugador onLoginSuccess={(jugador) => setJugadorActual(jugador)} />
          {/* Botón flotante discreto para regresar al login administrativo del Staff */}
          <button 
            onClick={() => setPortalMode('staff')} 
            className="text-xs font-bold text-gray-500 hover:text-blue-400 uppercase tracking-wider transition-all mt-4 mb-8"
          >
            ← Volver al Acceso de Staff / Árbitros
          </button>
        </div>
      );
    }
    
    // Si ya está autenticado, le pintamos directamente su Licencia Digital / Perfil privado
    return (
      <PerfilJugador 
        jugadorId={jugadorActual?.id} 
        onLogout={() => {
          setJugadorActual(null);
          setPortalMode('staff'); // Al cerrar sesión del jugador, regresa al entorno por defecto
        }} 
      />
    );
  }

  // =========================================================================
  // 🔑 EVALUACIÓN 2: FLUJO ESTÁNDAR Y ORIGINAL PARA EL STAFF ADMINISTRATIVO
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center p-4">
        {/* Renderiza tu tarjeta de login administrativo de la captura */}
        <Login onLoginSuccess={handleLoginSuccess} />
        
        {/* 👈 ENVOLTURA CORRECTA: El botón ahora se renderiza en la misma pantalla justo debajo */}
        <div className="text-center w-full max-w-md mt-6">
          <button 
            onClick={() => setPortalMode('jugador')} 
            className="w-full py-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold border border-blue-600/30 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-black/40"
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
            Sesión activa: <strong className="text-white ml-1">{user.nombre}</strong>
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