
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockKeyhole, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: (password: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md bg-black/80 border-purple-dark text-white">
        <CardHeader className="text-center">
          <div className="mx-auto bg-purple-dark p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <LockKeyhole size={32} />
          </div>
          <CardTitle className="text-2xl">Login Administrativo</CardTitle>
          <CardDescription className="text-gray-300">
            Digite a senha para acessar o painel
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white border-white hover:bg-white/10"
            >
              <ArrowLeft size={16} /> Voltar
            </Button>
            <Button 
              type="submit" 
              className="bg-purple-dark hover:bg-purple-600"
            >
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
