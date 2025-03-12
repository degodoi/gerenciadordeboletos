
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Users, Receipt, PiggyBank, AlertCircle, TrendingUp, Clock, CheckCircle2, DollarSign, BadgePercent, ArrowUpRight } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import { Boleto } from "./BoletoForm";
import { Badge } from "@/components/ui/badge";

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
  const percentagemRecebido = ((totalRecebido / totalValor) * 100) || 0;
  
  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
            Visão Geral
          </span>
        </h2>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-muted-foreground">
            Acompanhe seus boletos e pagamentos em tempo real
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale border-primary/20 shadow-md overflow-hidden">
          <div className="absolute h-1 w-full bg-gradient-to-r from-primary/70 to-primary top-0 left-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Boletos</CardTitle>
            <div className="rounded-full bg-primary/10 p-1">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBoletos}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <p className="text-xs text-muted-foreground">
                  {totalParcelas} parcelas no total
                </p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200">
                <CheckCircle2 className="h-3 w-3" />
                {boletosQuitados} quitados
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale border-primary/20 shadow-md overflow-hidden">
          <div className="absolute h-1 w-full bg-gradient-to-r from-primary/70 to-primary top-0 left-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <div className="rounded-full bg-primary/10 p-1">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(totalValor)}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                Valor total dos boletos
              </div>
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-200">
                <BadgePercent className="h-3 w-3" />
                100%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale border-primary/20 shadow-md overflow-hidden">
          <div className="absolute h-1 w-full bg-gradient-to-r from-green-500 to-green-600 top-0 left-0"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <div className="rounded-full bg-green-100 p-1">
              <PiggyBank className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(totalRecebido)}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                Recebido até o momento
              </div>
              <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200">
                <BadgePercent className="h-3 w-3" />
                {percentagemRecebido.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover-scale shadow-md overflow-hidden ${parcelasVencidas > 0 ? "border-destructive/30" : "border-primary/20"}`}>
          <div className={`absolute h-1 w-full ${parcelasVencidas > 0 ? "bg-gradient-to-r from-destructive/70 to-destructive" : "bg-gradient-to-r from-primary/70 to-primary"} top-0 left-0`}></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcelas Vencidas</CardTitle>
            <div className={`rounded-full ${parcelasVencidas > 0 ? "bg-red-100" : "bg-primary/10"} p-1`}>
              <AlertCircle className={`h-4 w-4 ${parcelasVencidas > 0 ? "text-destructive" : "text-primary"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parcelasVencidas}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Receipt className="h-3 w-3" />
                Em atraso
              </div>
              {valorVencido > 0 ? (
                <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-600 border-red-200">
                  {formatarMoeda(valorVencido)}
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Em dia
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
