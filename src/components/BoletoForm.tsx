import React, { useState, useEffect } from "react";
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
import { addMonths } from "date-fns";
import { v4 as uuidv4 } from "uuid";

interface BoletoFormProps {
  onSubmit: (boleto: Boleto) => void;
  initialData?: Boleto | null;
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

export function BoletoForm({ onSubmit, initialData }: BoletoFormProps) {
  const [nome, setNome] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [entrada, setEntrada] = useState("");
  const [tipoPagamentoEntrada, setTipoPagamentoEntrada] = useState("");
  const [parcelas, setParcelas] = useState("");
  const [tipoPagamento, setTipoPagamento] = useState("");

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setValorTotal(initialData.valorTotal.toString());
      setEntrada(initialData.entrada.toString());
      setTipoPagamentoEntrada(initialData.tipoPagamentoEntrada);
      setParcelas(initialData.parcelas.toString());
      setTipoPagamento(initialData.tipoPagamento);
    } else {
      // Limpar campos quando não houver dados iniciais
      setNome("");
      setValorTotal("");
      setEntrada("");
      setTipoPagamentoEntrada("");
      setParcelas("");
      setTipoPagamento("");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !valorTotal || !entrada || !tipoPagamentoEntrada || !parcelas || !tipoPagamento) {
      toast.error("Preencha todos os campos!", {
        duration: 1000,
      });
      return;
    }

    const valorTotalNum = parseFloat(valorTotal.replace(/\D/g, "")) / 100;
    const entradaNum = parseFloat(entrada.replace(/\D/g, "")) / 100;
    const parcelasNum = parseInt(parcelas);

    if (entradaNum >= valorTotalNum) {
      toast.error("O valor da entrada deve ser menor que o valor total!", {
        duration: 1000,
      });
      return;
    }

    if (parcelasNum <= 0) {
      toast.error("O número de parcelas deve ser maior que zero!", {
        duration: 1000,
      });
      return;
    }

    const valorParcela = (valorTotalNum - entradaNum) / parcelasNum;
    const parcelasInfo = Array.from({ length: parcelasNum }, (_, index) => ({
      numero: index + 1,
      valor: valorParcela,
      dataVencimento: addMonths(new Date(), index + 1),
      paga: false,
    }));

    const novoBoleto: Boleto = {
      id: initialData?.id || uuidv4(),
      nome,
      valorTotal: valorTotalNum,
      entrada: entradaNum,
      tipoPagamentoEntrada,
      parcelas: parcelasNum,
      valorParcela,
      tipoPagamento,
      parcelasInfo,
      dataCadastro: new Date(),
    };

    onSubmit(novoBoleto);
    toast.success("Boleto salvo com sucesso!", {
      duration: 1000,
    });

    // Limpar campos após o envio
    if (!initialData) {
      setNome("");
      setValorTotal("");
      setEntrada("");
      setTipoPagamentoEntrada("");
      setParcelas("");
      setTipoPagamento("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Cliente</Label>
          <Input
            id="nome"
            placeholder="Digite o nome do cliente"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

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
            className="max-w-[120px]"
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
            className="max-w-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipoPagamentoEntrada">Forma de Pagamento da Entrada</Label>
          <Select value={tipoPagamentoEntrada} onValueChange={setTipoPagamentoEntrada}>
            <SelectTrigger className="max-w-[120px]">
              <SelectValue placeholder="Selecione" />
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
            placeholder="Parcelas"
            value={parcelas}
            onChange={(e) => setParcelas(e.target.value)}
            className="max-w-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipoPagamento">Tipo de Pagamento das Parcelas</Label>
          <Select value={tipoPagamento} onValueChange={setTipoPagamento}>
            <SelectTrigger className="max-w-[120px]">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto">
        {initialData ? "Atualizar" : "Cadastrar"} Boleto
      </Button>
    </form>
  );
}