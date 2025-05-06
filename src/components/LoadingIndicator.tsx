
import React from 'react';
import { Loader2 } from 'lucide-react';
import PageLayout from './PageLayout';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Carregando dados...' 
}) => {
  return (
    <PageLayout>
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-white">{message}</span>
      </div>
    </PageLayout>
  );
};

export default LoadingIndicator;
