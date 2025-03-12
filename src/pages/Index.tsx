import { useState } from "react";
import { BoletoForm, type Boleto } from "@/components/BoletoForm";
import { BoletoList } from "@/components/BoletoList";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/Dashboard";
import { Plus, BarChart, Banknote, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda } from "@/lib/utils";
import { BackupManager } from "@/components/BackupManager";

interface IndexProps {
  boletos: Boleto[];
  onUpdateBoletos: (boletos: Boleto[]) => void;
}

const Index = ({ boletos, onUpdateBoletos }: IndexProps) => {
  const [editingBoleto, setEditingBoleto] = useState<Boleto | null>(null);
  const [showForm, setShowForm] = useState(false);

  const totalReceber = boletos.reduce((acc, boleto) => {
    const parcelasNaoPagas = boleto.parcelasInfo.filter(parcela => !parcela.paga);
    return acc + parcelasNaoPagas.reduce((total, parcela) => total + parcela.valor, 0);
  }, 0);

  const proximosVencimentos = boletos
    .flatMap(boleto => 
      boleto.parcelasInfo
        .filter(parcela => !parcela.paga)
        .map(parcela => ({
          cliente: boleto.nome,
          valor: parcela.valor,
          data: parcela.dataVencimento
        }))
    )
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  const handleSubmit = (novoBoleto: Boleto) => {
    let newBoletos: Boleto[];
    
    if (editingBoleto) {
      newBoletos = boletos.map((boleto) => 
        (boleto.id === editingBoleto.id ? novoBoleto : boleto)
      );
    } else {
      newBoletos = [novoBoleto, ...boletos];
    }
    
    onUpdateBoletos(newBoletos);
    setEditingBoleto(null);
    setShowForm(false);
  };

  const handleParcelaPaga = (boletoId: string, parcelaIndex: number) => {
    const newBoletos = boletos.map((boleto) => {
      if (boleto.id === boletoId) {
        const novasParcelasInfo = [...boleto.parcelasInfo];
        novasParcelasInfo[parcelaIndex] = {
          ...novasParcelasInfo[parcelaIndex],
          paga: !novasParcelasInfo[parcelaIndex].paga,
        };
        return { ...boleto, parcelasInfo: novasParcelasInfo };
      }
      return boleto;
    });
    
    onUpdateBoletos(newBoletos);
  };

  const handleEdit = (boleto: Boleto) => {
    setEditingBoleto(boleto);
    setShowForm(true);
  };

  const handleDelete = (boletoId: string) => {
    onUpdateBoletos(boletos.filter((boleto) => boleto.id !== boletoId));
  };

  const handleNewBoleto = () => {
    setEditingBoleto(null);
    setShowForm(true);
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-secondary to-primary/90 text-white rounded-lg shadow-md">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">
              CFC Direção
            </h1>
            <p className="text-white/80">
              {editingBoleto 
                ? "Editar boleto" 
                : "Sistema de Controle de Contas a Receber"}
            </p>
          </div>
          
          <div className="flex space-x-2">
            {!showForm && (
              <>
                <Button onClick={handleNewBoleto} className="gap-2 bg-white text-primary hover:bg-white/90">
                  <Plus className="h-4 w-4" />
                  Novo Boleto
                </Button>
                
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                  <Link to="/relatorios" className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Relatórios
                  </Link>
                </Button>
                
                <BackupManager onDataImported={onUpdateBoletos} />
              </>
            )}
          </div>
        </header>

        {!showForm && (
          <div className="grid gap-6 md:grid-cols-2 fade-in">
            <Card className="hover-scale border-primary/20 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Banknote className="h-5 w-5 mr-2 text-primary" />
                  A Receber
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatarMoeda(totalReceber)}</div>
                <p className="text-sm text-muted-foreground mt-1">Valor pendente total</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/relatorios">Ver detalhes</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover-scale border-primary/20 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Próximos Vencimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {proximosVencimentos.length > 0 ? (
                    proximosVencimentos.map((vencimento, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="truncate max-w-[130px]">{vencimento.cliente}</span>
                        <span className="font-medium">{formatarMoeda(vencimento.valor)}</span>
                        <span className="text-muted-foreground">{formatarData(vencimento.data)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-muted-foreground">Nenhum vencimento próximo</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {boletos.length > 0 && !showForm && (
          <Dashboard boletos={boletos} />
        )}

        {showForm ? (
          <BoletoForm onSubmit={handleSubmit} initialData={editingBoleto} />
        ) : null}

        {boletos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Boletos Cadastrados</h2>
              {showForm && (
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              )}
            </div>
            <BoletoList 
              boletos={boletos} 
              onParcelaPaga={handleParcelaPaga} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
        
        {boletos.length === 0 && !showForm && (
          <Card className="border-primary/20 shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Nenhum boleto cadastrado</h3>
              <p className="text-muted-foreground mb-6">Clique em "Novo Boleto" para começar a cadastrar seus boletos.</p>
              <Button onClick={handleNewBoleto}>Novo Boleto</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
