import { useState, useEffect, useRef } from 'react';
import { 
  StockReport, 
  TopSellingProduct, 
  StockTurnover, 
  StockAlert 
} from '@/types/stock';
import {
  getStockReport,
  getTopSellingProducts,
  getStockTurnover,
  getStockAlerts,
  getStockFinancialSummary
} from '@/lib/supabase/reports';

// Utility: adiciona timeout a uma promise
const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: ${label} excedeu ${ms}ms`));
    }, ms);

    console.time(label);
    promise
      .then((value) => {
        clearTimeout(timer);
        console.timeEnd(label);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        console.timeEnd(label);
        reject(err);
      });
  });
};

export const useStockReports = () => {
  const [stockReport, setStockReport] = useState<StockReport[]>([]);
  const [topSelling, setTopSelling] = useState<TopSellingProduct[]>([]);
  const [stockTurnover, setStockTurnover] = useState<StockTurnover[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalInvestido: 0,
    valorPotencial: 0,
    lucroEstimado: 0,
    margemMedia: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastRunMs, setLastRunMs] = useState<number>(0);

  const isMountedRef = useRef(true);
  const runIdRef = useRef(0);

  const loadAllReports = async (days: number = 30) => {
    const currentRunId = ++runIdRef.current;
    const startTime = performance.now();
    
    console.info(`[StockReports] Iniciando carregamento (runId: ${currentRunId})`, new Date().toISOString());
    
    if (!isMountedRef.current) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Executar todas as chamadas em paralelo com timeout individual
      const results = await Promise.allSettled([
        withTimeout(getStockReport(), 10000, 'getStockReport'),
        withTimeout(getTopSellingProducts(days), 10000, 'getTopSellingProducts'),
        withTimeout(getStockTurnover(days), 10000, 'getStockTurnover'),
        withTimeout(getStockAlerts(), 10000, 'getStockAlerts'),
        withTimeout(getStockFinancialSummary(), 10000, 'getStockFinancialSummary')
      ]);

      // Verificar se ainda é o run ativo
      if (runIdRef.current !== currentRunId || !isMountedRef.current) {
        console.warn(`[StockReports] Run ${currentRunId} cancelado (novo run: ${runIdRef.current})`);
        return;
      }

      const errors: string[] = [];

      // Processar resultados individuais
      const [r1, r2, r3, r4, r5] = results;

      if (r1.status === 'fulfilled') {
        setStockReport(r1.value ?? []);
      } else {
        console.error('[StockReports] Erro em getStockReport:', r1.reason);
        errors.push('Relatório de estoque');
        setStockReport([]);
      }

      if (r2.status === 'fulfilled') {
        setTopSelling(r2.value ?? []);
      } else {
        console.error('[StockReports] Erro em getTopSellingProducts:', r2.reason);
        errors.push('Produtos mais vendidos');
        setTopSelling([]);
      }

      if (r3.status === 'fulfilled') {
        setStockTurnover(r3.value ?? []);
      } else {
        console.error('[StockReports] Erro em getStockTurnover:', r3.reason);
        errors.push('Giro de estoque');
        setStockTurnover([]);
      }

      if (r4.status === 'fulfilled') {
        setAlerts(r4.value ?? []);
      } else {
        console.error('[StockReports] Erro em getStockAlerts:', r4.reason);
        errors.push('Alertas');
        setAlerts([]);
      }

      if (r5.status === 'fulfilled') {
        setFinancialSummary(
          r5.value ?? {
            totalInvestido: 0,
            valorPotencial: 0,
            lucroEstimado: 0,
            margemMedia: 0,
          }
        );
      } else {
        console.error('[StockReports] Erro em getStockFinancialSummary:', r5.reason);
        errors.push('Resumo financeiro');
        setFinancialSummary({
          totalInvestido: 0,
          valorPotencial: 0,
          lucroEstimado: 0,
          margemMedia: 0,
        });
      }

      if (errors.length > 0) {
        setErrorMessage(`Erro ao carregar: ${errors.join(', ')}`);
      }

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setLastRunMs(duration);
      console.info(`[StockReports] Carregamento concluído em ${duration}ms (runId: ${currentRunId})`);

    } catch (error) {
      console.error('[StockReports] Erro geral ao carregar relatórios:', error);
      
      if (runIdRef.current !== currentRunId || !isMountedRef.current) return;
      
      setErrorMessage('Erro ao carregar relatórios de estoque');
      setStockReport([]);
      setTopSelling([]);
      setStockTurnover([]);
      setAlerts([]);
      setFinancialSummary({
        totalInvestido: 0,
        valorPotencial: 0,
        lucroEstimado: 0,
        margemMedia: 0,
      });
    } finally {
      if (runIdRef.current === currentRunId && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    loadAllReports();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    stockReport,
    topSelling,
    stockTurnover,
    alerts,
    financialSummary,
    isLoading,
    errorMessage,
    lastRunMs,
    refreshReports: loadAllReports
  };
};
