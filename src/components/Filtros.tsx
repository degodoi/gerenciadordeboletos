
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface FiltrosProps {
  periodoFiltro: string;
  setPeriodoFiltro: (value: string) => void;
  statusFiltro: string;
  setStatusFiltro: (value: string) => void;
  formaPagamentoFiltro: string;
  setFormaPagamentoFiltro: (value: string) => void;
}

export const Filtros = ({
  periodoFiltro,
  setPeriodoFiltro,
  statusFiltro,
  setStatusFiltro,
  formaPagamentoFiltro,
  setFormaPagamentoFiltro,
}: FiltrosProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-primary/20">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Período</h3>
        </div>
        <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ultimo-mes">Último mês</SelectItem>
            <SelectItem value="ultimos-tres-meses">Últimos 3 meses</SelectItem>
            <SelectItem value="ultimos-seis-meses">Últimos 6 meses</SelectItem>
            <SelectItem value="ultimo-ano">Último ano</SelectItem>
            <SelectItem value="todos">Todos os períodos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Status</h3>
        </div>
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="pago">Pagos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Forma de Pagamento</h3>
        </div>
        <Select value={formaPagamentoFiltro} onValueChange={setFormaPagamentoFiltro}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as formas</SelectItem>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
