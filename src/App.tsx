
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Relatorios from "./pages/Relatorios";
import { type Boleto } from "@/components/BoletoForm";
import { saveBoletos, loadBoletos } from "@/lib/localStorage";

const queryClient = new QueryClient();

const App = () => {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  
  // Load data from localStorage on initial mount
  useEffect(() => {
    const loadedBoletos = loadBoletos();
    setBoletos(loadedBoletos);
  }, []);

  const handleUpdateBoletos = (newBoletos: Boleto[]) => {
    // Ensure all dates are properly converted to Date objects before saving
    const processedBoletos = newBoletos.map(boleto => ({
      ...boleto,
      dataInicial: new Date(boleto.dataInicial),
      dataCadastro: new Date(boleto.dataCadastro),
      parcelasInfo: boleto.parcelasInfo.map(parcela => ({
        ...parcela,
        dataVencimento: new Date(parcela.dataVencimento)
      }))
    }));
    
    setBoletos(processedBoletos);
    saveBoletos(processedBoletos);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index boletos={boletos} onUpdateBoletos={handleUpdateBoletos} />} />
            <Route path="/relatorios" element={<Relatorios boletos={boletos} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
