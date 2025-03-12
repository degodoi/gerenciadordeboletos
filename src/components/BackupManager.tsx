
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { exportData, importData } from "@/lib/localStorage";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface BackupManagerProps {
  onDataImported: (data: any[]) => void;
}

export function BackupManager({ onDataImported }: BackupManagerProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    try {
      exportData();
      toast.success("Backup exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar backup.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    try {
      const importedData = await importData(file);
      onDataImported(importedData);
      toast.success("Dados importados com sucesso!");
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao importar dados: Formato inválido ou arquivo corrompido.");
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Backup
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Backup</DialogTitle>
          <DialogDescription>
            Exporte seus dados para um arquivo ou importe de um backup anterior.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div>
            <Label>Exportar Dados</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Faça backup de todos os seus boletos e informações em um arquivo JSON.
            </p>
            <Button 
              onClick={handleExport} 
              className="gap-2 w-full"
              variant="secondary"
            >
              <Download className="h-4 w-4" />
              Exportar para Arquivo
            </Button>
          </div>
          
          <div>
            <Label>Importar Dados</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Restaure seus dados a partir de um arquivo de backup anterior.
            </p>
            <Button 
              onClick={handleImportClick} 
              className="gap-2 w-full"
              variant="outline"
              disabled={isImporting}
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Importando..." : "Importar de Arquivo"}
            </Button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Atenção: Importar dados substituirá todos os seus dados atuais.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
