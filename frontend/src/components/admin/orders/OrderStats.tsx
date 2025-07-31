// components/admin/orders/OrderStats.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package,
  Clock,
  Truck,
  DollarSign
} from "lucide-react";

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
}

interface OrderStatsProps {
  orders: Order[];
}

export function OrderStats({ orders }: OrderStatsProps) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);

  const stats = [
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      label: 'Pending',
      value: pendingOrders,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      label: 'Processing',
      value: processingOrders,
      icon: Package,
      color: 'text-purple-600'
    },
    {
      label: 'Shipped',
      value: shippedOrders,
      icon: Truck,
      color: 'text-indigo-600'
    },
    {
      label: 'Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}