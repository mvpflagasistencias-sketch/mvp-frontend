// src/AvatarEditor.jsx

const AvatarEditor = ({ config }) => {
  // Valores por defecto: si el jugador no ha configurado nada, el sistema carga estos
  // Asegúrate de tener estos archivos en tu carpeta /assets/avatar/
  const c = config || { 
    cuerpo: 'base1', 
    cara: 'cara1', 
    accesorio: 'none' 
  };

  return (
    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
      {/* Capa 1: Cuerpo (Base)
         El z-index más bajo para quedar al fondo 
      */}
      <img 
        src={`/assets/avatar/${c.cuerpo}.svg`} 
        className="absolute w-full h-full object-contain z-10" 
        alt="Cuerpo de Avatar" 
      />

      {/* Capa 2: Cara (Gestos/Rasgos)
         Z-index medio para sobreponerse al cuerpo
      */}
      <img 
        src={`/assets/avatar/${c.cara}.svg`} 
        className="absolute w-full h-full object-contain z-20" 
        alt="Rasgos Faciales" 
      />

      {/* Capa 3: Accesorio (Opcional)
         Z-index alto para quedar hasta adelante (gorras, lentes, etc.)
      */}
      {c.accesorio !== 'none' && (
        <img 
          src={`/assets/avatar/${c.accesorio}.svg`} 
          className="absolute w-full h-full object-contain z-30 animate-in zoom-in duration-300" 
          alt="Accesorio" 
        />
      )}
    </div>
  );
};

export default AvatarEditor;