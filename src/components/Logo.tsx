
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="w-full max-w-[280px] h-[180px] overflow-hidden">
      <img
        src="https://adegavm.shop/logo.gif"
        alt="Logotipo da Loja"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
