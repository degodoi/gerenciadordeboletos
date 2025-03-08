import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Users, Receipt, PiggyBank, AlertCircle } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import { Boleto } from "./BoletoForm";

interface DashboardProps {
  boletos: Boleto[];
}

export function Dashboard({ boletos }: DashboardProps) {
  // Calcular estatísticas
  const totalBoletos = boletos.length;
  const totalValor = boletos.reduce((acc, boleto) => acc + boleto.valorTotal, 0);
  const totalParcelas = boletos.reduce((acc, boleto) => acc + boleto.parcelas, 0);
  const totalRecebido = boletos.reduce((acc, boleto) => {
    const parcelasPagas = boleto.parcelasInfo.filter(parcela => parcela.paga);
    return acc + parcelasPagas.reduce((total, parcela) => total + parcela.valor, 0) + boleto.entrada;
  }, 0);
  
  const parcelasVencidas = boletos.reduce((acc, boleto) => {
    const vencidas = boleto.parcelasInfo.filter(
      parcela => !parcela.paga && new Date() > parcela.dataVencimento
    );
    return acc + vencidas.length;
  }, 0);

  const valorVencido = boletos.reduce((acc, boleto) => {
    const valorVencido = boleto.parcelasInfo
      .filter(parcela => !parcela.paga && new Date() > parcela.dataVencimento)
      .reduce((total, parcela) => total + parcela.valor, 0);
    return acc + valorVencido;
  }, 0);
  
  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Boletos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBoletos}</div>
            <p className="text-xs text-muted-foreground">
              {totalParcelas} parcelas no total
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(totalValor)}</div>
            <p className="text-xs text-muted-foreground">
              Total de todos os boletos
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(totalRecebido)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalRecebido / totalValor) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className={`hover-scale shadow-md ${parcelasVencidas > 0 ? "border-destructive/50 bg-destructive/5" : "border-primary/20"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcelas Vencidas</CardTitle>
            <AlertCircle className={`h-4 w-4 ${parcelasVencidas > 0 ? "text-destructive" : "text-primary"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parcelasVencidas}</div>
            <p className="text-xs text-muted-foreground">
              {formatarMoeda(valorVencido)} em atraso
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
