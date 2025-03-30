
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="w-full h-[150px] overflow-hidden">
      <img
        src="https://adegavm.com/logo.gif"
        alt="Logotipo da Loja"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default Logo;
