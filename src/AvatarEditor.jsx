// src/AvatarEditor.jsx

const AvatarEditor = ({ config }) => {
  // Ajustamos los nombres para que coincidan con tus archivos en public/assets/avatar/
  const c = config || { 
    cuerpo: 'cuerpo', 
    cara: 'cara', 
    accesorio: 'accesorio' 
  };

  return (
    <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-gray-800 rounded-full overflow-hidden">
      
      {/* Capa 1: Cuerpo */}
      <img 
        src={`/assets/avatar/${c.cuerpo}.svg`} 
        className="absolute w-full h-full object-contain z-10" 
        alt="Cuerpo de Avatar" 
      />

      {/* Capa 2: Cara */}
      <img 
        src={`/assets/avatar/${c.cara}.svg`} 
        className="absolute w-full h-full object-contain z-20" 
        alt="Rasgos Faciales" 
      />

      {/* Capa 3: Accesorio */}
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