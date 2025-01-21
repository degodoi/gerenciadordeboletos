import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarMoeda } from "@/lib/utils";
import type { Boleto } from "./BoletoForm";

interface BoletoListProps {
  boletos: Boleto[];
}

export function BoletoList({ boletos }: BoletoListProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-right">Entrada</TableHead>
            <TableHead className="text-right">Parcelas</TableHead>
            <TableHead className="text-right">Valor Parcela</TableHead>
            <TableHead>Pagamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {boletos.map((boleto) => (
            <TableRow key={boleto.id} className="slide-in">
              <TableCell className="font-medium">{boleto.nome}</TableCell>
              <TableCell className="text-right">
                {formatarMoeda(boleto.valorTotal)}
              </TableCell>
              <TableCell className="text-right">
                {formatarMoeda(boleto.entrada)}
              </TableCell>
              <TableCell className="text-right">{boleto.parcelas}x</TableCell>
              <TableCell className="text-right">
                {formatarMoeda(boleto.valorParcela)}
              </TableCell>
              <TableCell className="capitalize">{boleto.tipoPagamento}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}