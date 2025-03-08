
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { type Boleto } from "@/components/BoletoForm";
import { formatarMoeda } from "@/lib/utils";
import { ArrowLeft, Download, Printer, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BackButton } from "@/components/BackButton";

interface RelatoriosProps {
  boletos: Boleto[];
}

const COLORS = ['#e11d48', '#000000', '#666666', '#999999', '#cccccc'];

const Relatorios = ({ boletos }: RelatoriosProps) => {
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("todos");
  
  const boletosFiltered = React.useMemo(() => {
    if (periodoFiltro === "todos") return boletos;
    
    const hoje = new Date();
    const umMesAtras = new Date();
    umMesAtras.setMonth(hoje.getMonth() - 1);
    
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(hoje.getMonth() - 3);
    
    if (periodoFiltro === "ultimo-mes") {
      return boletos.filter(boleto => 
        new Date(boleto.dataCadastro) >= umMesAtras
      );
    }
    
    if (periodoFiltro === "ultimos-tres-meses") {
      return boletos.filter(boleto => 
        new Date(boleto.dataCadastro) >= tresMesesAtras
      );
    }
    
    return boletos;
  }, [boletos, periodoFiltro]);

  const dadosPorTipoPagamento = React.useMemo(() => {
    const dados: Record<string, number> = {};
    boletosFiltered.forEach(boleto => {
      dados[boleto.tipoPagamento] = (dados[boleto.tipoPagamento] || 0) + 1;
    });
    
    return Object.keys(dados).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: dados[key]
    }));
  }, [boletosFiltered]);

  const dadosPorMes = React.useMemo(() => {
    const dados: Record<string, number> = {};
    boletosFiltered.forEach(boleto => {
      const mes = format(new Date(boleto.dataCadastro), "MMM", { locale: ptBR });
      dados[mes] = (dados[mes] || 0) + boleto.valorTotal;
    });
    
    return Object.keys(dados).map(key => ({
      name: key,
      valor: dados[key]
    }));
  }, [boletosFiltered]);
  
  const dadosStatus = React.useMemo(() => {
    let parcelasPagas = 0;
    let parcelasVencidas = 0;
    let parcelasAVencer = 0;
    
    boletosFiltered.forEach(boleto => {
      boleto.parcelasInfo.forEach(parcela => {
        if (parcela.paga) {
          parcelasPagas++;
        } else if (new Date() > parcela.dataVencimento) {
          parcelasVencidas++;
        } else {
          parcelasAVencer++;
        }
      });
    });
    
    return [
      { name: "Recebidas", value: parcelasPagas },
      { name: "Vencidas", value: parcelasVencidas },
      { name: "A Vencer", value: parcelasAVencer }
    ];
  }, [boletosFiltered]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const cabecalho = "Nome,Valor Total,Entrada,Tipo Pagamento Entrada,Parcelas,Valor Parcela,Tipo Pagamento,Data Cadastro\n";
    const linhas = boletosFiltered.map(boleto => {
      return `"${boleto.nome}",${boleto.valorTotal},${boleto.entrada},"${boleto.tipoPagamentoEntrada}",${boleto.parcelas},${boleto.valorParcela},"${boleto.tipoPagamento}","${format(new Date(boleto.dataCadastro), 'dd/MM/yyyy')}"`;
    }).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + cabecalho + linhas;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_boletos_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 fade-in">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-secondary to-primary/90 text-white rounded-lg shadow-md">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">CFC Direção - Relatórios</h1>
            <p className="text-white/80">
              Visualize estatísticas e relatórios das suas contas a receber
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BackButton to="/" />
            <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os períodos</SelectItem>
                <SelectItem value="ultimo-mes">Último mês</SelectItem>
                <SelectItem value="ultimos-tres-meses">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 print:hidden">
          <Button variant="outline" onClick={handleExportCSV} className="border-primary/20">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="border-primary/20">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Relatório
          </Button>
        </div>

        <Tabs defaultValue="resumo" className="space-y-4">
          <TabsList className="border border-primary/20">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumo" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle>Total de Boletos</CardTitle>
                  <CardDescription>Período selecionado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{boletosFiltered.length}</div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle>Valor Total</CardTitle>
                  <CardDescription>Soma de todos os boletos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {formatarMoeda(boletosFiltered.reduce((acc, boleto) => acc + boleto.valorTotal, 0))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle>Média por Boleto</CardTitle>
                  <CardDescription>Valor médio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {boletosFiltered.length 
                      ? formatarMoeda(boletosFiltered.reduce((acc, boleto) => acc + boleto.valorTotal, 0) / boletosFiltered.length) 
                      : formatarMoeda(0)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle>Totais por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dadosPorTipoPagamento}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="font-medium">{payload[0].name}</div>
                                  <div className="font-medium text-right">
                                    {payload[0].value}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" fill="#e11d48" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="graficos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle>Status das Parcelas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#e11d48"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {dadosStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle>Valor por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dadosPorMes}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="font-medium">{label}</div>
                                  <div className="mt-1 text-muted-foreground">
                                    {formatarMoeda(payload[0].value as number)}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line type="monotone" dataKey="valor" stroke="#e11d48" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="detalhes">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Detalhamento de Boletos</CardTitle>
                  <CardDescription>
                    Lista completa de boletos para o período selecionado
                  </CardDescription>
                </div>
                <FileText className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-primary/20">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Entrada</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Forma Entrada</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Parcelas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Forma Parcelas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {boletosFiltered.map((boleto) => {
                        const parcelasPagas = boleto.parcelasInfo.filter(p => p.paga).length;
                        const totalParcelas = boleto.parcelasInfo.length;
                        const percentualPago = (parcelasPagas / totalParcelas) * 100;
                        
                        return (
                          <tr key={boleto.id}>
                            <td className="px-4 py-4 whitespace-nowrap">{boleto.nome}</td>
                            <td className="px-4 py-4 whitespace-nowrap">{formatarMoeda(boleto.valorTotal)}</td>
                            <td className="px-4 py-4 whitespace-nowrap">{formatarMoeda(boleto.entrada)}</td>
                            <td className="px-4 py-4 whitespace-nowrap capitalize">{boleto.tipoPagamentoEntrada}</td>
                            <td className="px-4 py-4 whitespace-nowrap">{boleto.parcelas}x</td>
                            <td className="px-4 py-4 whitespace-nowrap capitalize">{boleto.tipoPagamento}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {format(new Date(boleto.dataCadastro), 'dd/MM/yyyy')}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div 
                                    className="bg-primary h-2.5 rounded-full" 
                                    style={{ width: `${percentualPago}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs">
                                  {parcelasPagas}/{totalParcelas}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {boletosFiltered.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                            Nenhum boleto encontrado para o período selecionado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Relatorios;
