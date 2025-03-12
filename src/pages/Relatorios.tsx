import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackButton } from "@/components/BackButton";
import { Download, Printer, FileText, Filter, ChevronsUpDown } from "lucide-react";
import { Filtros } from "@/components/Filtros";
import { type Boleto } from "@/components/BoletoForm";
import { formatarMoeda } from "@/lib/utils";

interface RelatoriosProps {
  boletos: Boleto[];
}

const COLORS = ['#e11d48', '#0ea5e9', '#84cc16', '#f97316', '#8b5cf6'];

const Relatorios = ({ boletos }: RelatoriosProps) => {
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("ultimo-mes");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState<string>("todos");
  
  const boletosFiltered = React.useMemo(() => {
    let filtrados = [...boletos];
    
    if (periodoFiltro !== "todos") {
      const hoje = new Date();
      let dataLimite: Date;
      
      if (periodoFiltro === "ultimo-mes") {
        dataLimite = subMonths(hoje, 1);
      } else if (periodoFiltro === "ultimos-tres-meses") {
        dataLimite = subMonths(hoje, 3);
      } else if (periodoFiltro === "ultimos-seis-meses") {
        dataLimite = subMonths(hoje, 6);
      } else {
        dataLimite = subMonths(hoje, 12);
      }
      
      filtrados = filtrados.filter(boleto => 
        isAfter(new Date(boleto.dataCadastro), dataLimite)
      );
    }
    
    if (formaPagamentoFiltro !== "todos") {
      filtrados = filtrados.filter(boleto => 
        boleto.tipoPagamento === formaPagamentoFiltro || 
        boleto.tipoPagamentoEntrada === formaPagamentoFiltro
      );
    }
    
    if (statusFiltro !== "todos") {
      if (statusFiltro === "pago") {
        filtrados = filtrados.filter(boleto => 
          boleto.parcelasInfo.every(parcela => parcela.paga)
        );
      } else if (statusFiltro === "pendente") {
        filtrados = filtrados.filter(boleto => 
          boleto.parcelasInfo.some(parcela => !parcela.paga && new Date() < parcela.dataVencimento)
        );
      } else if (statusFiltro === "vencido") {
        filtrados = filtrados.filter(boleto => 
          boleto.parcelasInfo.some(parcela => !parcela.paga && new Date() > parcela.dataVencimento)
        );
      }
    }
    
    return filtrados;
  }, [boletos, periodoFiltro, statusFiltro, formaPagamentoFiltro]);

  const totais = React.useMemo(() => {
    const valorTotal = boletosFiltered.reduce((acc, boleto) => acc + boleto.valorTotal, 0);
    const valorEntradas = boletosFiltered.reduce((acc, boleto) => acc + boleto.entrada, 0);
    
    let valorPago = 0;
    let valorPendente = 0;
    let valorVencido = 0;
    
    boletosFiltered.forEach(boleto => {
      boleto.parcelasInfo.forEach(parcela => {
        if (parcela.paga) {
          valorPago += parcela.valor;
        } else if (new Date() > parcela.dataVencimento) {
          valorVencido += parcela.valor;
        } else {
          valorPendente += parcela.valor;
        }
      });
    });
    
    return {
      valorTotal,
      valorEntradas,
      valorParcelas: valorTotal - valorEntradas,
      valorPago,
      valorPendente,
      valorVencido,
      valorRecebido: valorEntradas + valorPago,
      valorAReceber: valorPendente + valorVencido
    };
  }, [boletosFiltered]);

  const dadosPorFormaPagamento = React.useMemo(() => {
    const formasPagamento: Record<string, number> = {};
    
    boletosFiltered.forEach(boleto => {
      if (boleto.entrada > 0 && boleto.tipoPagamentoEntrada) {
        const forma = boleto.tipoPagamentoEntrada;
        formasPagamento[forma] = (formasPagamento[forma] || 0) + boleto.entrada;
      }
    });
    
    boletosFiltered.forEach(boleto => {
      const parcelasPagas = boleto.parcelasInfo.filter(p => p.paga);
      if (parcelasPagas.length > 0) {
        const forma = boleto.tipoPagamento;
        const valorParcelasPagas = parcelasPagas.reduce((acc, p) => acc + p.valor, 0);
        formasPagamento[forma] = (formasPagamento[forma] || 0) + valorParcelasPagas;
      }
    });
    
    return Object.keys(formasPagamento).map(forma => ({
      name: forma.charAt(0).toUpperCase() + forma.slice(1),
      valor: formasPagamento[forma]
    }));
  }, [boletosFiltered]);

  const dadosStatus = React.useMemo(() => {
    return [
      { name: "Recebido", valor: totais.valorRecebido },
      { name: "A Vencer", valor: totais.valorPendente },
      { name: "Vencido", valor: totais.valorVencido }
    ];
  }, [totais]);

  const dadosEvolucaoMensal = React.useMemo(() => {
    const hoje = new Date();
    const meses = Array.from({length: 6}, (_, i) => {
      const data = subMonths(hoje, 5 - i);
      return {
        mes: format(data, "MMM", { locale: ptBR }),
        data: data,
        recebido: 0,
        pendente: 0
      };
    });

    boletosFiltered.forEach(boleto => {
      const dataEntrada = new Date(boleto.dataCadastro);
      
      for (const mes of meses) {
        if (dataEntrada.getMonth() === mes.data.getMonth() && 
            dataEntrada.getFullYear() === mes.data.getFullYear()) {
          mes.recebido += boleto.entrada;
          break;
        }
      }
      
      boleto.parcelasInfo.forEach(parcela => {
        const dataParcela = new Date(parcela.dataVencimento);
        
        for (const mes of meses) {
          if (dataParcela.getMonth() === mes.data.getMonth() && 
              dataParcela.getFullYear() === mes.data.getFullYear()) {
            if (parcela.paga) {
              mes.recebido += parcela.valor;
            } else {
              mes.pendente += parcela.valor;
            }
            break;
          }
        }
      });
    });

    return meses.map(m => ({
      name: m.mes,
      Recebido: m.recebido,
      Pendente: m.pendente
    }));
  }, [boletosFiltered]);

  const proximosVencimentos = React.useMemo(() => {
    const hoje = new Date();
    
    return boletosFiltered
      .flatMap(boleto => 
        boleto.parcelasInfo
          .filter(parcela => !parcela.paga)
          .map(parcela => ({
            cliente: boleto.nome,
            valor: parcela.valor,
            data: parcela.dataVencimento,
            vencido: new Date(parcela.dataVencimento) < hoje,
            parcela: `${parcela.numero}/${boleto.parcelas}`,
            formaPagamento: boleto.tipoPagamento
          }))
      )
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 5);
  }, [boletosFiltered]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const cabecalho = "Nome,Valor Total,Entrada,Tipo Pagamento Entrada,Parcelas,Valor Parcela,Tipo Pagamento,Data Cadastro,Status\n";
    const linhas = boletosFiltered.map(boleto => {
      const parcelasPagas = boleto.parcelasInfo.filter(p => p.paga).length;
      const totalParcelas = boleto.parcelasInfo.length;
      const status = parcelasPagas === totalParcelas ? "Pago" : 
                     boleto.parcelasInfo.some(p => !p.paga && new Date() > p.dataVencimento) ? "Vencido" : "Pendente";
      
      return `"${boleto.nome}",${boleto.valorTotal},${boleto.entrada},"${boleto.tipoPagamentoEntrada}",${boleto.parcelas},${boleto.valorParcela},"${boleto.tipoPagamento}","${format(new Date(boleto.dataCadastro), 'dd/MM/yyyy')}","${status}"`;
    }).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + cabecalho + linhas;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_contas_receber_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 fade-in">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/80 to-secondary rounded-lg shadow-lg">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Relatório Financeiro</h1>
            <p className="text-white/80">
              Visão geral do seu contas a receber e análise financeira
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BackButton to="/" />
            <Button variant="outline" onClick={handleExportCSV} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

        <Filtros
          periodoFiltro={periodoFiltro}
          setPeriodoFiltro={setPeriodoFiltro}
          statusFiltro={statusFiltro}
          setStatusFiltro={setStatusFiltro}
          formaPagamentoFiltro={formaPagamentoFiltro}
          setFormaPagamentoFiltro={setFormaPagamentoFiltro}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-primary">Total Recebido</CardTitle>
              <CardDescription>Entradas + parcelas pagas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{formatarMoeda(totais.valorRecebido)}</div>
              <div className="flex justify-between mt-2 text-sm">
                <span>Entradas: {formatarMoeda(totais.valorEntradas)}</span>
                <span>Parcelas: {formatarMoeda(totais.valorPago)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-primary">A Receber</CardTitle>
              <CardDescription>Parcelas pendentes + vencidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{formatarMoeda(totais.valorAReceber)}</div>
              <div className="flex justify-between mt-2 text-sm">
                <span>A Vencer: {formatarMoeda(totais.valorPendente)}</span>
                <span>Vencido: {formatarMoeda(totais.valorVencido)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-primary">Total Movimentado</CardTitle>
              <CardDescription>Valor total dos boletos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{formatarMoeda(totais.valorTotal)}</div>
              <div className="flex justify-between mt-2 text-sm">
                <span>Total de boletos: {boletosFiltered.length}</span>
                <span>Média: {boletosFiltered.length ? formatarMoeda(totais.valorTotal / boletosFiltered.length) : formatarMoeda(0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="visaogeral" className="space-y-6">
          <TabsList className="w-full justify-start bg-white/5 backdrop-blur-sm border border-primary/20 p-1 rounded-lg">
            <TabsTrigger value="visaogeral" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="formapagamento" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Por Forma de Pagamento
            </TabsTrigger>
            <TabsTrigger value="vencimentos" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Próximos Vencimentos
            </TabsTrigger>
            <TabsTrigger value="detalhada" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Visão Detalhada
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visaogeral" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Status Financeiro</CardTitle>
                  <CardDescription>
                    Distribuição dos valores recebidos, a vencer e vencidos
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#e11d48"
                          dataKey="valor"
                          nameKey="name"
                          label={({ name, percent }) => 
                            `${name}: ${(percent * 100).toFixed(1)}%`
                          }
                        >
                          {dadosStatus.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? '#84cc16' : index === 1 ? '#0ea5e9' : '#e11d48'} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatarMoeda(value)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Evolução Mensal</CardTitle>
                  <CardDescription>
                    Valores recebidos e pendentes nos últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dadosEvolucaoMensal}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                        <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                        <Legend />
                        <Bar dataKey="Recebido" stackId="a" fill="#84cc16" />
                        <Bar dataKey="Pendente" stackId="a" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="formapagamento" className="space-y-6">
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Valores Recebidos por Forma de Pagamento</CardTitle>
                <CardDescription>
                  Distribuição dos valores recebidos por método de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dadosPorFormaPagamento}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                      <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                      <Bar dataKey="valor" fill="#e11d48">
                        {dadosPorFormaPagamento.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead className="text-right">Valor Recebido</TableHead>
                      <TableHead className="text-right">Porcentagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosPorFormaPagamento.map((item, index) => {
                      const porcentagem = (item.valor / totais.valorRecebido) * 100;
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium capitalize">{item.name}</TableCell>
                          <TableCell className="text-right">{formatarMoeda(item.valor)}</TableCell>
                          <TableCell className="text-right">{porcentagem.toFixed(1)}%</TableCell>
                        </TableRow>
                      );
                    })}
                    {dadosPorFormaPagamento.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Nenhum valor recebido no período selecionado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vencimentos" className="space-y-6">
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Próximos Vencimentos</CardTitle>
                <CardDescription>
                  As próximas parcelas a vencer ou já vencidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proximosVencimentos.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.cliente}</TableCell>
                        <TableCell>{item.parcela}</TableCell>
                        <TableCell>{format(new Date(item.data), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="capitalize">{item.formaPagamento}</TableCell>
                        <TableCell className="text-right">{formatarMoeda(item.valor)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.vencido ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.vencido ? 'Vencido' : 'A vencer'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {proximosVencimentos.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Não há vencimentos pendentes no período selecionado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="detalhada">
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Relatório Detalhado de Boletos</CardTitle>
                  <CardDescription>
                    Lista completa com status de pagamento e valores
                  </CardDescription>
                </div>
                <FileText className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center space-x-1">
                            <span>Cliente</span>
                            <ChevronsUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Entrada</TableHead>
                        <TableHead>Forma Entrada</TableHead>
                        <TableHead>Parcelas</TableHead>
                        <TableHead>Forma Parcelas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Informações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {boletosFiltered.map((boleto) => {
                        const parcelasPagas = boleto.parcelasInfo.filter(p => p.paga).length;
                        const totalParcelas = boleto.parcelasInfo.length;
                        const percentualPago = (parcelasPagas / totalParcelas) * 100;
                        
                        const statusBoleto = parcelasPagas === totalParcelas 
                          ? "Pago"
                          : boleto.parcelasInfo.some(p => !p.paga && new Date() > p.dataVencimento)
                            ? "Vencido"
                            : "Pendente";
                            
                        const statusClass = 
                          statusBoleto === "Pago" 
                            ? "bg-green-100 text-green-800" 
                            : statusBoleto === "Vencido"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800";
                        
                        return (
                          <TableRow key={boleto.id}>
                            <TableCell className="font-medium">{boleto.nome}</TableCell>
                            <TableCell>{format(new Date(boleto.dataCadastro), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{formatarMoeda(boleto.valorTotal)}</TableCell>
                            <TableCell>{formatarMoeda(boleto.entrada)}</TableCell>
                            <TableCell className="capitalize">{boleto.tipoPagamentoEntrada || "-"}</TableCell>
                            <TableCell>{`${boleto.parcelas}x de ${formatarMoeda(boleto.valorParcela)}`}</TableCell>
                            <TableCell className="capitalize">{boleto.tipoPagamento}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                                {statusBoleto}
                              </span>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Filter className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                  <div className="p-2">
                                    <div className="text-sm font-medium mb-1">Pagamento</div>
                                    <div className="text-xs">{parcelasPagas} de {totalParcelas} parcelas pagas</div>
                                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                                      <div 
                                        className="bg-primary h-2 rounded-full" 
                                        style={{ width: `${percentualPago}%` }}
                                      ></div>
                                    </div>
                                    
                                    <div className="text-sm font-medium mt-3 mb-1">Próximo Vencimento</div>
                                    {boleto.parcelasInfo.find(p => !p.paga) ? (
                                      <div className="text-xs">
                                        {format(new Date(boleto.parcelasInfo.find(p => !p.paga)!.dataVencimento), 'dd/MM/yyyy')}
                                      </div>
                                    ) : (
                                      <div className="text-xs">Todas parcelas pagas</div>
                                    )}
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {boletosFiltered.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                            Nenhum boleto encontrado para os filtros selecionados
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
