
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Relatorios from "./pages/Relatorios";
import { type Boleto } from "@/components/BoletoForm";

const queryClient = new QueryClient();

const App = () => {
  const [boletos, setBoletos] = useState<Boleto[]>([]);

  const handleUpdateBoletos = (newBoletos: Boleto[]) => {
    setBoletos(newBoletos);
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
