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
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface BoletoListProps {
  boletos: Boleto[];
  onParcelaPaga: (boletoId: string, parcelaIndex: number) => void;
}

export function BoletoList({ boletos, onParcelaPaga }: BoletoListProps) {
  const [expandedBoleto, setExpandedBoleto] = useState<string | null>(null);

  const toggleBoleto = (boletoId: string) => {
    setExpandedBoleto(expandedBoleto === boletoId ? null : boletoId);
  };

  const handleParcelaPaga = (boletoId: string, parcelaIndex: number) => {
    onParcelaPaga(boletoId, parcelaIndex);
    toast.success(`Parcela ${parcelaIndex + 1} atualizada com sucesso!`, {
      duration: 3000,
    });
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
            <TableHead></TableHead>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBoleto(boleto.id)}
                  >
                    {expandedBoleto === boleto.id ? "Ocultar" : "Ver Parcelas"}
                  </Button>
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
                            className="flex items-center justify-between p-2 bg-background rounded-lg shadow-sm"
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