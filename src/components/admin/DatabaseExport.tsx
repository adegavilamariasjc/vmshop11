import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';
import { Download, Database } from 'lucide-react';

const TABLES = [
  'products',
  'categories',
  'bairros',
  'pedidos',
  'ice_flavors',
  'alcohol_options',
  'client_origins',
  'page_visits',
  'system_settings'
] as const;

const DatabaseExport: React.FC = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const sanitizeValue = (val: any) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const objectsToCSV = (rows: any[]): string => {
    if (!rows || rows.length === 0) return '';

    const headersSet = new Set<string>();
    rows.forEach((row) => Object.keys(row || {}).forEach((k) => headersSet.add(k)));
    const headers = Array.from(headersSet);

    const escape = (value: string) => `\"${value.replace(/\"/g, '\"\"')}\"`;

    const lines = [headers.join(';')];
    for (const row of rows) {
      const line = headers
        .map((h) => escape(sanitizeValue((row as any)[h] ?? '')))
        .join(';');
      lines.push(line);
    }
    return lines.join('\n');
  };

  const handleExportAll = async () => {
    if (isExporting) return;
    setIsExporting(true);

    const startedAt = new Date();
    const zip = new JSZip();
    const errors: string[] = [];

    try {
      toast({
        title: 'Exportando base de dados',
        description: 'Coletando dados de todas as tabelas...',
      });

      // Fetch each table sequentially to avoid overwhelming the API
      for (const table of TABLES) {
        try {
          const { data, error } = await (supabase as any)
            .from(table as any)
            .select('*');

          if (error) throw error;

          const csv = data && data.length ? objectsToCSV(data) : '';
          const content = csv || 'Sem dados';
          zip.file(`${table}.csv`, content);
        } catch (e: any) {
          console.error(`Erro exportando ${table}:`, e);
          errors.push(`Tabela ${table}: ${e?.message || e}`);
          // Still add an empty file to keep structure
          zip.file(`${table}.csv`, '');
        }
      }

      const readme = [
        'Backup de dados - Supabase',
        '====================================',
        `Data de exportação: ${startedAt.toLocaleString('pt-BR')}`,
        '',
        'Conteúdo:',
        ...TABLES.map((t) => `- ${t}.csv`),
        '',
        'Formato CSV com delimitador ponto-e-vírgula (;).',
        'Colunas com objetos/JSON foram serializadas como JSON.',
      ].join('\n');
      zip.file('README.txt', readme);

      if (errors.length) {
        zip.file('errors.txt', errors.join('\n'));
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const pad = (n: number) => String(n).padStart(2, '0');
      const d = new Date();
      const filename = `backup_supabase_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.zip`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Exportação concluída',
        description: errors.length
          ? `Backup gerado com avisos. Verifique errors.txt.`
          : 'Backup completo gerado com sucesso!',
      });
    } catch (err) {
      console.error('Falha na exportação geral:', err);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o backup.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-900/50 rounded-md">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Exportar Base de Dados (CSV)</h3>
      </div>
      <p className="text-gray-300 text-sm">
        Gera um arquivo .zip contendo um CSV para cada tabela do Supabase.
      </p>
      <div>
        <Button onClick={handleExportAll} disabled={isExporting} variant="outline" className="w-fit">
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportando…' : 'Exportar Tudo (ZIP)'}
        </Button>
      </div>
    </div>
  );
};

export default DatabaseExport;
