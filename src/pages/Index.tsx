import { useState } from "react";
import { BoletoForm, type Boleto } from "@/components/BoletoForm";
import { BoletoList } from "@/components/BoletoList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Index = () => {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [editingBoleto, setEditingBoleto] = useState<Boleto | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (novoBoleto: Boleto) => {
    if (editingBoleto) {
      setBoletos((prev) =>
        prev.map((boleto) => (boleto.id === editingBoleto.id ? novoBoleto : boleto))
      );
      setEditingBoleto(null);
    } else {
      setBoletos((prev) => [novoBoleto, ...prev]);
    }
    setShowForm(false);
  };

  const handleParcelaPaga = (boletoId: string, parcelaIndex: number) => {
    setBoletos((prevBoletos) =>
      prevBoletos.map((boleto) => {
        if (boleto.id === boletoId) {
          const novasParcelasInfo = [...boleto.parcelasInfo];
          novasParcelasInfo[parcelaIndex] = {
            ...novasParcelasInfo[parcelaIndex],
            paga: !novasParcelasInfo[parcelaIndex].paga,
          };
          return { ...boleto, parcelasInfo: novasParcelasInfo };
        }
        return boleto;
      })
    );
  };

  const handleEdit = (boleto: Boleto) => {
    setEditingBoleto(boleto);
    setShowForm(true);
  };

  const handleDelete = (boletoId: string) => {
    setBoletos((prev) => prev.filter((boleto) => boleto.id !== boletoId));
  };

  const handleNewBoleto = () => {
    setEditingBoleto(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Controle de Boletos
          </h1>
          <p className="text-muted-foreground">
            {editingBoleto ? "Editar boleto" : "Cadastre e gerencie seus boletos de forma simples e rápida"}
          </p>
        </div>

        {!showForm ? (
          <div className="flex justify-center">
            <Button onClick={handleNewBoleto} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Boleto
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-4 md:p-6 fade-in">
            <BoletoForm onSubmit={handleSubmit} initialData={editingBoleto} />
          </div>
        )}

        {boletos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Boletos Cadastrados</h2>
            <BoletoList 
              boletos={boletos} 
              onParcelaPaga={handleParcelaPaga} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;