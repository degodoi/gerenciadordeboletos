
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface BackButtonProps {
  to: string;
  label?: string;
}

export function BackButton({ to, label = "Voltar" }: BackButtonProps) {
  return (
    <Button variant="outline" className="print:hidden" asChild>
      <Link to={to} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}
