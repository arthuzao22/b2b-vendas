// Status Badge component for displaying order/product statuses
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  // Order statuses
  pendente: { label: "Pendente", variant: "warning" as const, color: "bg-yellow-100 text-yellow-800" },
  confirmado: { label: "Confirmado", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
  processando: { label: "Processando", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
  enviado: { label: "Enviado", variant: "default" as const, color: "bg-indigo-100 text-indigo-800" },
  entregue: { label: "Entregue", variant: "success" as const, color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
  
  // Product/Stock statuses
  ativo: { label: "Ativo", variant: "success" as const, color: "bg-green-100 text-green-800" },
  inativo: { label: "Inativo", variant: "default" as const, color: "bg-gray-100 text-gray-800" },
  baixo: { label: "Estoque Baixo", variant: "warning" as const, color: "bg-yellow-100 text-yellow-800" },
  zerado: { label: "Sem Estoque", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: "default" as const,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge variant={config.variant} className={cn(config.color, className)}>
      {config.label}
    </Badge>
  );
}
