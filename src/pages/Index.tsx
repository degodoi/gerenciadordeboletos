
import { useState } from "react";
import { BoletoForm, type Boleto } from "@/components/BoletoForm";
import { BoletoList } from "@/components/BoletoList";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/Dashboard";
import { Plus, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface IndexProps {
  boletos: Boleto[];
  onUpdateBoletos: (boletos: Boleto[]) => void;
}

const Index = ({ boletos, onUpdateBoletos }: IndexProps) => {
  const [editingBoleto, setEditingBoleto] = useState<Boleto | null>(null);
  const [showForm, setShowForm] = useState(false);

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Controle de Boletos
            </h1>
            <p className="text-muted-foreground">
              {editingBoleto 
                ? "Editar boleto" 
                : "Cadastre e gerencie seus boletos de forma simples e rápida"}
            </p>
          </div>
          
          <div className="flex space-x-2">
            {!showForm && (
              <>
                <Button onClick={handleNewBoleto} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Boleto
                </Button>
                
                <Button variant="outline" asChild>
                  <Link to="/relatorios" className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Relatórios
                  </Link>
                </Button>
              </>
            )}
          </div>
        </header>

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
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Nenhum boleto cadastrado</h3>
              <p className="text-muted-foreground mb-6">Clique em "Novo Boleto" para começar a cadastrar seus boletos.</p>
              <Button onClick={handleNewBoleto}>Cadastrar Boleto</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
