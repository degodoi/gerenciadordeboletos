
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
import type { Boleto, Parcela } from "./BoletoForm";
import { format, isAfter, isBefore, addDays, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Edit, Trash2, ChevronDown, ChevronUp, AlertTriangle, Check, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface BoletoListProps {
  boletos: Boleto[];
  onParcelaPaga: (boletoId: string, parcelaIndex: number) => void;
  onEdit: (boleto: Boleto) => void;
  onDelete: (boletoId: string) => void;
}

export function BoletoList({ boletos, onParcelaPaga, onEdit, onDelete }: BoletoListProps) {
  const [expandedBoleto, setExpandedBoleto] = useState<string | null>(null);
  const [editingParcela, setEditingParcela] = useState<{boletoId: string, parcelaIndex: number} | null>(null);
  const [novaData, setNovaData] = useState<Date>(new Date());
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);

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

  const openDateEditor = (boletoId: string, parcelaIndex: number, dataAtual: Date) => {
    setEditingParcela({ boletoId, parcelaIndex });
    // Make sure to create a new Date instance to avoid reference issues
    setNovaData(new Date(dataAtual));
    setIsDateDialogOpen(true);
  };

  const updateParcelaDate = () => {
    if (!editingParcela) return;
    
    const { boletoId, parcelaIndex } = editingParcela;
    
    // Find the boleto in the array
    const boletoToUpdate = boletos.find(b => b.id === boletoId);
    if (!boletoToUpdate) return;
    
    console.log("Updating parcela date:", {
      boletoId,
      parcelaIndex,
      currentDate: boletoToUpdate.parcelasInfo[parcelaIndex].dataVencimento,
      newDate: novaData
    });
    
    // Create a proper deep copy of the boleto with correct date conversions
    const updatedBoleto = {
      ...boletoToUpdate,
      parcelasInfo: boletoToUpdate.parcelasInfo.map((parcela, idx) => {
        if (idx === parcelaIndex) {
          return {
            ...parcela,
            dataVencimento: new Date(novaData)
          };
        }
        return {
          ...parcela,
          dataVencimento: new Date(parcela.dataVencimento)
        };
      })
    };
    
    console.log("Updated boleto:", updatedBoleto);
    
    // Call the edit function to update the boleto in the parent component
    onEdit(updatedBoleto);
    
    // Close the dialog and reset state
    setIsDateDialogOpen(false);
    setEditingParcela(null);
    
    toast.success("Data de vencimento atualizada com sucesso!", {
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
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                      <span>Vencimento: {format(new Date(parcela.dataVencimento), "dd/MM/yyyy", {
                                        locale: ptBR,
                                      })}</span>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-5 w-5 rounded-full"
                                        onClick={() => openDateEditor(boleto.id, index, parcela.dataVencimento)}
                                      >
                                        <Calendar className="h-3 w-3" />
                                      </Button>
                                    </div>
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

      {/* Dialog para edição de data */}
      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Data de Vencimento</DialogTitle>
            <DialogDescription>
              Selecione a nova data de vencimento para esta parcela.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <CalendarComponent
              mode="single"
              selected={novaData}
              onSelect={(date) => date && setNovaData(date)}
              className={cn("p-3 pointer-events-auto")}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDateDialogOpen(false)} variant="outline" className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={updateParcelaDate} className="w-full sm:w-auto">
              Salvar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
