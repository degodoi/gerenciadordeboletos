import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Users, Receipt, PiggyBank, AlertCircle, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
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
  
  // Calculate fully paid boletos
  const boletosQuitados = boletos.filter(boleto => 
    boleto.parcelasInfo.every(parcela => parcela.paga)
  ).length;

  const percentagemQuitados = ((boletosQuitados / totalBoletos) * 100) || 0;
  
  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col space-y-4">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
          Visão Geral
        </h2>
        <p className="text-muted-foreground">
          Acompanhe seus boletos e pagamentos em tempo real
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Boletos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBoletos}</div>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-muted-foreground">
                {totalParcelas} parcelas no total
              </p>
              <span className="flex items-center text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {boletosQuitados} quitados
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(totalValor)}</div>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Valor total dos boletos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(totalRecebido)}</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600">
                {((totalRecebido / totalValor) * 100).toFixed(1)}% do total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover-scale shadow-md ${parcelasVencidas > 0 ? "border-destructive/50 bg-destructive/5" : "border-primary/20"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcelas Vencidas</CardTitle>
            <AlertCircle className={`h-4 w-4 ${parcelasVencidas > 0 ? "text-destructive" : "text-primary"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parcelasVencidas}</div>
            <div className="flex items-center space-x-2">
              <Receipt className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {formatarMoeda(valorVencido)} em atraso
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
