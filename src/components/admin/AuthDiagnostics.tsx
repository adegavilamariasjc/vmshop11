import { useCallback, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Shield, Database, ActivitySquare } from 'lucide-react';

interface TestResult {
  name: string;
  ok: boolean;
  details?: string;
}

export const AuthDiagnostics = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const run = useCallback(async () => {
    setRunning(true);
    const out: TestResult[] = [];

    try {
      // 1) Session
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      out.push({
        name: 'Sessão ativa',
        ok: !!sessionData.session && !sessionErr,
        details: userId ? `user_id: ${userId}` : (sessionErr?.message || 'Sem sessão')
      });

      // 2) Role
      if (userId) {
        const { data: roleData, error: roleErr } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        out.push({
          name: 'Papel do usuário (user_roles)',
          ok: !roleErr,
          details: roleData?.role ? `role: ${roleData.role}` : (roleErr?.message || 'sem papel')
        });
      } else {
        out.push({ name: 'Papel do usuário (user_roles)', ok: false, details: 'sem sessão' });
      }

      // 3) Leitura products (RLS pública)
      const { error: prodErr, count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });
      out.push({
        name: 'Leitura de products',
        ok: !prodErr,
        details: prodErr ? prodErr.message : `count ≈ ${count ?? 'n/a'}`
      });

      // 4) RPC de vendas
      const { data: topData, error: topErr } = await supabase.rpc('get_top_selling_products', { days: 7 });
      out.push({
        name: 'RPC get_top_selling_products',
        ok: !topErr,
        details: topErr ? topErr.message : `items: ${topData?.length ?? 0}`
      });

    } catch (e: any) {
      out.push({ name: 'Exceção geral', ok: false, details: e?.message });
    } finally {
      setResults(out);
      setRunning(false);
    }
  }, []);

  const status = useMemo(() => {
    const ok = results.every(r => r.ok);
    return ok ? 'OK' : 'Problemas';
  }, [results]);

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ActivitySquare className="h-5 w-5 text-blue-400" />
          <h3 className="text-white font-semibold">Diagnóstico de Autenticação e Acesso</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === 'OK' ? 'default' : 'destructive'}>
            {status}
          </Badge>
          <Button size="sm" variant="outline" onClick={run} disabled={running}>
            <RefreshCw className={`h-4 w-4 mr-2 ${running ? 'animate-spin' : ''}`} />
            Executar testes
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-gray-300">Teste</TableHead>
            <TableHead className="text-gray-300">Resultado</TableHead>
            <TableHead className="text-gray-300">Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.length === 0 ? (
            <TableRow className="border-gray-700">
              <TableCell colSpan={3} className="text-gray-400">Nenhum teste executado ainda.</TableCell>
            </TableRow>
          ) : (
            results.map((r) => (
              <TableRow key={r.name} className="border-gray-700">
                <TableCell className="text-white">{r.name}</TableCell>
                <TableCell className="text-white">{r.ok ? 'OK' : 'FALHA'}</TableCell>
                <TableCell className="text-gray-400">{r.details || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="text-xs text-gray-400 mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> Autenticação</div>
        <div className="flex items-center gap-1"><Database className="h-3 w-3" /> Leitura de dados</div>
      </div>
    </Card>
  );
};
