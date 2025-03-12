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
import { Edit, Trash2, ChevronDown, ChevronUp, AlertTriangle, Check, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BoletoListProps {
  boletos: Boleto[];
  onParcelaPaga: (boletoId: string, parcelaIndex: number) => void;
  onEdit: (boleto: Boleto) => void;
  onDelete: (boletoId: string) => void;
}

export function BoletoList({ boletos, onParcelaPaga, onEdit, onDelete }: BoletoListProps) {
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
      duration: 1000,
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
              duration: 1000,
              icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
            });
          } else if (isBefore(parcela.dataVencimento, sevenDaysFromNow)) {
            toast.warning(`Parcela ${index + 1} do boleto de ${boleto.nome} vence em breve!`, {
              duration: 1000,
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

  const getParcelaStatusIcon = (parcela: { dataVencimento: Date; paga: boolean }) => {
    const today = new Date();
    if (parcela.paga) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (isBefore(parcela.dataVencimento, today)) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    if (isBefore(parcela.dataVencimento, addDays(today, 7))) {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Card className="fade-in">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/20">
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
            {boletos.map((boleto) => {
              const parcelasPagas = boleto.parcelasInfo.filter(p => p.paga).length;
              const percentPago = (parcelasPagas / boleto.parcelas) * 100;
              const isQuitado = boleto.parcelasInfo.every(parcela => parcela.paga);
              
              return (
                <React.Fragment key={boleto.id}>
                  <TableRow className={`slide-in ${isQuitado ? "bg-green-50" : ""}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {boleto.nome}
                        {isQuitado && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Quitado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarMoeda(boleto.valorTotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarMoeda(boleto.entrada)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {boleto.tipoPagamentoEntrada}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <span>{boleto.parcelas}x</span>
                        <div className="ml-2 w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${percentPago}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarMoeda(boleto.valorParcela)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {boleto.tipoPagamento}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBoleto(boleto.id)}
                        >
                          {expandedBoleto === boleto.id ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(boleto)}>
                              Editar Boleto
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir este boleto?')) {
                                  onDelete(boleto.id);
                                  toast.success("Boleto excluído com sucesso!", {
                                    duration: 2000,
                                  });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                                className={`flex items-center justify-between p-3 rounded-lg border ${getParcelaStatusColor(parcela)}`}
                              >
                                <div className="flex items-center">
                                  {getParcelaStatusIcon(parcela)}
                                  <div className="ml-3">
                                    <span className="font-medium">
                                      Parcela {parcela.numero}
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                      Vencimento:{" "}
                                      {format(new Date(parcela.dataVencimento), "dd/MM/yyyy", {
                                        locale: ptBR,
                                      })}
                                    </p>
                                    <p className="text-sm font-medium">
                                      {formatarMoeda(parcela.valor)}
                                    </p>
                                  </div>
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
              );
            })}
            {boletos.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhum boleto cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
