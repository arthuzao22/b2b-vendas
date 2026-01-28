"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, MapPin, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

interface HistoricoItem {
  id: string;
  status: string;
  observacao: string | null;
  criadoEm: string;
  criadoPor: string | null;
}

interface RastreioData {
  pedido: {
    id: string;
    numeroPedido: string;
    status: string;
    codigoRastreio: string | null;
    previsaoEntrega: string | null;
    dataEntrega: string | null;
    enderecoEntrega: string | null;
    cidadeEntrega: string | null;
    estadoEntrega: string | null;
    cepEntrega: string | null;
  };
  historico: HistoricoItem[];
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  processando: "Processando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  processando: "bg-purple-100 text-purple-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export default function RastreioPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RastreioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRastreio();
  }, [params.id]);

  const loadRastreio = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pedidos/${params.id}/rastreio`);
      
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao carregar rastreamento");
      }
    } catch (err) {
      console.error("Erro ao carregar rastreio:", err);
      setError("Erro ao carregar rastreamento");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando rastreamento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600">{error || "Dados não encontrados"}</p>
              <Link href="/pedidos">
                <Button className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Pedidos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { pedido, historico } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href={`/pedidos/${pedido.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Rastreamento do Pedido</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Pedido #{pedido.numeroPedido}
          </p>
        </div>
        <Badge className={statusColors[pedido.status] || "bg-gray-100 text-gray-800"}>
          {statusLabels[pedido.status] || pedido.status}
        </Badge>
      </div>

      {/* Delivery Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pedido.enderecoEntrega ? (
              <div className="space-y-1">
                <p className="text-sm">{pedido.enderecoEntrega}</p>
                <p className="text-sm">
                  {pedido.cidadeEntrega}, {pedido.estadoEntrega}
                </p>
                <p className="text-sm">CEP: {pedido.cepEntrega}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Endereço não informado
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações de Envio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pedido.codigoRastreio && (
                <div>
                  <p className="text-sm font-medium">Código de Rastreio:</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
                    {pedido.codigoRastreio}
                  </p>
                </div>
              )}
              {pedido.previsaoEntrega && (
                <div>
                  <p className="text-sm font-medium">Previsão de Entrega:</p>
                  <p className="text-sm text-gray-700">
                    {formatDateOnly(pedido.previsaoEntrega)}
                  </p>
                </div>
              )}
              {pedido.dataEntrega && (
                <div>
                  <p className="text-sm font-medium">Data de Entrega:</p>
                  <p className="text-sm text-green-600 font-medium">
                    {formatDateOnly(pedido.dataEntrega)}
                  </p>
                </div>
              )}
              {!pedido.codigoRastreio && !pedido.previsaoEntrega && (
                <p className="text-sm text-gray-500">
                  Informações de envio não disponíveis
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico do Pedido
          </CardTitle>
          <CardDescription>
            Acompanhe todas as mudanças de status do seu pedido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historico.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum histórico disponível
              </p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                {historico.map((item, index) => (
                  <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          index === 0 ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                statusColors[item.status] || "bg-gray-100 text-gray-800"
                              }
                            >
                              {statusLabels[item.status] || item.status}
                            </Badge>
                            {index === 0 && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          {item.observacao && (
                            <p className="text-sm text-gray-600 mt-2">
                              {item.observacao}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(item.criadoEm)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center">
        <Link href={`/pedidos/${pedido.id}`}>
          <Button size="lg">
            Ver Detalhes Completos do Pedido
          </Button>
        </Link>
      </div>
    </div>
  );
}
