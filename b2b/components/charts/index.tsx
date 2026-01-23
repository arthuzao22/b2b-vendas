"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface SalesChartProps {
  data: ChartData[];
}

export function SalesLineChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563EB"
          strokeWidth={2}
          name="Vendas"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function OrdersBarChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#2563EB" name="Pedidos" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface StatusPieChartProps {
  data: ChartData[];
}

const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#6B7280"];

export function StatusPieChart({ data }: StatusPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${((percent || 0) * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface RevenueChartProps {
  data: ChartData[];
}

export function RevenueAreaChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="receita"
          stroke="#10B981"
          strokeWidth={2}
          name="Receita"
        />
        <Line
          type="monotone"
          dataKey="pedidos"
          stroke="#3B82F6"
          strokeWidth={2}
          name="Pedidos"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
