"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersBarChart, StatusPieChart } from "@/components/charts";
import { BarChart3, PieChart } from "lucide-react";

interface DashboardChartsProps {
  ordersByMonth: { name: string; value: number }[];
  ordersByStatus: { name: string; value: number }[];
}

export function DashboardCharts({ ordersByMonth, ordersByStatus }: DashboardChartsProps) {
  return (
    <>
      {/* Orders by Month Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Pedidos por Mês</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <OrdersBarChart data={ordersByMonth} />
        </CardContent>
      </Card>

      {/* Orders by Status Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            <CardTitle>Pedidos por Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <StatusPieChart data={ordersByStatus} />
        </CardContent>
      </Card>
    </>
  );
}
