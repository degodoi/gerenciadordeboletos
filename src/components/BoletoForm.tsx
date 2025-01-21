import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface BoletoFormProps {
  onSubmit: (boleto: Boleto) => void;
}

export interface Parcela {
  numero: number;
  valor: number;
  paga: boolean;
  dataVencimento: Date;
}

export interface Boleto {
  id: string;
  nome: string;
  valorTotal: number;
  entrada: number;
  tipoPagamentoEntrada: string;
  parcelas: number;
  tipoPagamento: string;
  valorParcela: number;
  dataCadastro: Date;
  parcelasInfo: Parcela[];
}

export function BoletoForm({ onSubmit }: BoletoFormProps) {
  const [nome, setNome] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [entrada, setEntrada] = useState("");
  const [tipoPagamentoEntrada, setTipoPagamentoEntrada] = useState("");
  const [parcelas, setParcelas] = useState("");
  const [tipoPagamento, setTipoPagamento] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valorTotalNum = parseFloat(valorTotal);
    const entradaNum = parseFloat(entrada) || 0;
    const parcelasNum = parseInt(parcelas);

    if (!nome || !valorTotal || !parcelas || !tipoPagamento || !tipoPagamentoEntrada) {
      toast.error("Por favor, preencha todos os campos obrigatórios", {
        duration: 3000,
      });
      return;
    }

    if (entradaNum > valorTotalNum) {
      toast.error("O valor da entrada não pode ser maior que o valor total", {
        duration: 3000,
      });
      return;
    }

    const valorRestante = valorTotalNum - entradaNum;
    const valorParcela = parcelasNum > 0 ? valorRestante / parcelasNum : 0;

    // Criar array de parcelas
    const parcelasInfo: Parcela[] = Array.from({ length: parcelasNum }, (_, index) => ({
      numero: index + 1,
      valor: valorParcela,
      paga: false,
      dataVencimento: new Date(new Date().setMonth(new Date().getMonth() + index + 1)),
    }));

    const novoBoleto: Boleto = {
      id: crypto.randomUUID(),
      nome,
      valorTotal: valorTotalNum,
      entrada: entradaNum,
      tipoPagamentoEntrada,
      parcelas: parcelasNum,
      tipoPagamento,
      valorParcela,
      dataCadastro: new Date(),
      parcelasInfo,
    };

    onSubmit(novoBoleto);
    toast.success("Boleto cadastrado com sucesso!", {
      duration: 3000,
    });

    // Limpar formulário
    setNome("");
    setValorTotal("");
    setEntrada("");
    setTipoPagamentoEntrada("");
    setParcelas("");
    setTipoPagamento("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 fade-in">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Cliente</Label>
        <Input
          id="nome"
          placeholder="Digite o nome do cliente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valorTotal">Valor Total (R$)</Label>
          <Input
            id="valorTotal"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="entrada">Entrada (R$)</Label>
          <Input
            id="entrada"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipoPagamentoEntrada">Forma de Pagamento da Entrada</Label>
          <Select value={tipoPagamentoEntrada} onValueChange={setTipoPagamentoEntrada}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parcelas">Número de Parcelas</Label>
          <Input
            id="parcelas"
            type="number"
            min="1"
            placeholder="Digite o número de parcelas"
            value={parcelas}
            onChange={(e) => setParcelas(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipoPagamento">Tipo de Pagamento das Parcelas</Label>
        <Select value={tipoPagamento} onValueChange={setTipoPagamento}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Cadastrar Boleto
      </Button>
    </form>
  );
}