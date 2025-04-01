
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="w-full max-w-[320px] h-[200px] overflow-hidden">
      <img
        src="https://adegavm.com/logo.gif"
        alt="Logotipo da Loja"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
