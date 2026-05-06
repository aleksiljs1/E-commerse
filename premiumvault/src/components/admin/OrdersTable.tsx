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
    <div className="bg-white/[0.04] border border-white/[0.1] rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.1] hover:bg-transparent bg-[#0e0c1a]/60">
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Order #</TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Customer Email</TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Items</TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Total</TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Payment</TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Status</TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Date</TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                No orders found.
              </TableCell>
            </TableRow>
          )}
          {orders.map((order) => (
            <TableRow key={order.id} className="border-white/[0.1] hover:bg-white/[0.05]">
              <TableCell className="font-mono text-xs text-gray-400 max-w-[160px] truncate">
                {order.orderNumber}
              </TableCell>
              <TableCell className="text-gray-400">{order.customerEmail}</TableCell>
              <TableCell className="text-gray-400">
                {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
              </TableCell>
              <TableCell className="text-gray-400">
                £{Number(order.totalAmount).toFixed(2)}
              </TableCell>
              <TableCell>
                <span
                  className={
                    order.paymentMethod === "STRIPE"
                      ? "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-violet-500/20 text-violet-400"
                      : "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/20 text-blue-400"
                  }
                >
                  {order.paymentMethod === "STRIPE" ? "Stripe" : "PayPal F&F"}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-gray-400 text-xs whitespace-nowrap">
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
