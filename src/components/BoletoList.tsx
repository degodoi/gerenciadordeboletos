import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatarMoeda } from "@/lib/utils";
import type { Boleto } from "./BoletoForm";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Edit, AlertTriangle } from "lucide-react";

interface BoletoListProps {
  boletos: Boleto[];
  onParcelaPaga: (boletoId: string, parcelaIndex: number) => void;
  onEdit: (boleto: Boleto) => void;
}

export function BoletoList({ boletos, onParcelaPaga, onEdit }: BoletoListProps) {
  const [expandedBoleto, setExpandedBoleto] = useState<string | null>(null);

  useEffect(() => {
    checkOverduePayments();
  }, [boletos]);

  const toggleBoleto = (boletoId: string) => {
    setExpandedBoleto(expandedBoleto === boletoId ? null : boletoId);
  };

  const handleParcelaPaga = (boletoId: string, parcelaIndex: number) => {
    onParcelaPaga(boletoId, parcelaIndex);
    toast.success(`Parcela ${parcelaIndex + 1} atualizada com sucesso!`, {
      duration: 3000,
    });
  };

  const checkOverduePayments = () => {
    const today = new Date();
    const sevenDaysFromNow = addDays(today, 7);

    boletos.forEach(boleto => {
      boleto.parcelasInfo.forEach((parcela, index) => {
        if (!parcela.paga) {
          if (isBefore(parcela.dataVencimento, today)) {
            toast.error(`Parcela ${index + 1} do boleto de ${boleto.nome} está vencida!`, {
              duration: 5000,
              icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
            });
          } else if (isBefore(parcela.dataVencimento, sevenDaysFromNow)) {
            toast.warning(`Parcela ${index + 1} do boleto de ${boleto.nome} vence em breve!`, {
              duration: 5000,
            });
          }
        }
      });
    });
  };

  const getParcelaStatusColor = (parcela: { dataVencimento: Date; paga: boolean }) => {
    const today = new Date();
    if (parcela.paga) {
      return "bg-green-100 border-green-200";
    }
    if (isBefore(parcela.dataVencimento, today)) {
      return "bg-red-100 border-red-200";
    }
    if (isBefore(parcela.dataVencimento, addDays(today, 7))) {
      return "bg-yellow-100 border-yellow-200";
    }
    return "bg-white border-gray-200";
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm space-y-4 fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-right">Entrada</TableHead>
            <TableHead>Pgto. Entrada</TableHead>
            <TableHead className="text-right">Parcelas</TableHead>
            <TableHead className="text-right">Valor Parcela</TableHead>
            <TableHead>Pgto. Parcelas</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {boletos.map((boleto) => (
            <React.Fragment key={boleto.id}>
              <TableRow className="slide-in">
                <TableCell className="font-medium">{boleto.nome}</TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(boleto.valorTotal)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(boleto.entrada)}
                </TableCell>
                <TableCell className="capitalize">{boleto.tipoPagamentoEntrada}</TableCell>
                <TableCell className="text-right">{boleto.parcelas}x</TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(boleto.valorParcela)}
                </TableCell>
                <TableCell className="capitalize">{boleto.tipoPagamento}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBoleto(boleto.id)}
                    >
                      {expandedBoleto === boleto.id ? "Ocultar" : "Ver Parcelas"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(boleto)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedBoleto === boleto.id && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Parcelas:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {boleto.parcelasInfo.map((parcela, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-2 rounded-lg border ${getParcelaStatusColor(parcela)}`}
                          >
                            <div>
                              <span className="font-medium">
                                Parcela {parcela.numero}
                              </span>
                              <p className="text-sm text-muted-foreground">
                                Vencimento:{" "}
                                {format(parcela.dataVencimento, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })}
                              </p>
                              <p className="text-sm">
                                Valor: {formatarMoeda(parcela.valor)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`parcela-${boleto.id}-${index}`}
                                checked={parcela.paga}
                                onCheckedChange={() =>
                                  handleParcelaPaga(boleto.id, index)
                                }
                              />
                              <label
                                htmlFor={`parcela-${boleto.id}-${index}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Paga
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}