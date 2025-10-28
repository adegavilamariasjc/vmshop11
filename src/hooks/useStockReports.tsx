import { useState, useEffect } from 'react';
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

  const loadAllReports = async (days: number = 30) => {
    setIsLoading(true);
    
    const [
      stockData,
      topSellingData,
      turnoverData,
      alertsData,
      financialData
    ] = await Promise.all([
      getStockReport(),
      getTopSellingProducts(days),
      getStockTurnover(days),
      getStockAlerts(),
      getStockFinancialSummary()
    ]);

    setStockReport(stockData);
    setTopSelling(topSellingData);
    setStockTurnover(turnoverData);
    setAlerts(alertsData);
    setFinancialSummary(financialData);
    
    setIsLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      if (mounted) {
        await loadAllReports();
      }
    };
    
    load();
    
    return () => {
      mounted = false;
    };
  }, []);

  return {
    stockReport,
    topSelling,
    stockTurnover,
    alerts,
    financialSummary,
    isLoading,
    refreshReports: loadAllReports
  };
};
