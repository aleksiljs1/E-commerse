"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";

type Props = {
  orders: any[];
};

export function OrdersTable({ orders }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400">Order #</TableHead>
            <TableHead className="text-zinc-400">Customer Email</TableHead>
            <TableHead className="text-zinc-400">Items</TableHead>
            <TableHead className="text-zinc-400">Total</TableHead>
            <TableHead className="text-zinc-400">Payment</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400">Date</TableHead>
            <TableHead className="text-zinc-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                No orders found.
              </TableCell>
            </TableRow>
          )}
          {orders.map((order) => (
            <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/50">
              <TableCell className="font-mono text-xs text-zinc-300 max-w-[160px] truncate">
                {order.orderNumber}
              </TableCell>
              <TableCell className="text-zinc-300">{order.customerEmail}</TableCell>
              <TableCell className="text-zinc-400">
                {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
              </TableCell>
              <TableCell className="text-zinc-300">
                £{Number(order.totalAmount).toFixed(2)}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    order.paymentMethod === "STRIPE"
                      ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  }`}
                >
                  {order.paymentMethod === "STRIPE" ? "Stripe" : "PayPal F&F"}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-zinc-400 text-xs whitespace-nowrap">
                {order.createdAt
                  ? format(new Date(order.createdAt), "dd MMM yyyy HH:mm")
                  : "—"}
              </TableCell>
              <TableCell>
                <Link href={`/admin/dashboard/orders/${order.id}`}>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
