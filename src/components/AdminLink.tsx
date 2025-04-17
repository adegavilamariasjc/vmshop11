
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

const AdminLink: React.FC = () => {
  return (
    <Link 
      to="/admin" 
      className="fixed top-24 left-4 bg-purple-dark/70 hover:bg-purple-dark text-white p-3 rounded-full shadow-lg transition-all duration-200"
      title="Área Administrativa"
    >
      <Settings size={16} />
    </Link>
  );
};

export default AdminLink;
