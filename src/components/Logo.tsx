
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="w-full h-[150px] overflow-hidden">
      <img
        src="/logo.jpg"
        alt="Logotipo da Loja"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default Logo;
