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
    <div className="bg-[#16221B] border border-[#1F8A5B]/30 rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[#1F8A5B]/20 hover:bg-transparent">
            <TableHead className="text-[#A0B5A8]">Order #</TableHead>
            <TableHead className="text-[#A0B5A8]">Customer Email</TableHead>
            <TableHead className="text-[#A0B5A8]">Items</TableHead>
            <TableHead className="text-[#A0B5A8]">Total</TableHead>
            <TableHead className="text-[#A0B5A8]">Payment</TableHead>
            <TableHead className="text-[#A0B5A8]">Status</TableHead>
            <TableHead className="text-[#A0B5A8]">Date</TableHead>
            <TableHead className="text-[#A0B5A8]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[#A0B5A8] py-8">
                No orders found.
              </TableCell>
            </TableRow>
          )}
          {orders.map((order) => (
            <TableRow key={order.id} className="border-[#1F8A5B]/20 hover:bg-[#1F8A5B]/10">
              <TableCell className="font-mono text-xs text-[#A0B5A8] max-w-[160px] truncate">
                {order.orderNumber}
              </TableCell>
              <TableCell className="text-[#A0B5A8]">{order.customerEmail}</TableCell>
              <TableCell className="text-[#A0B5A8]">
                {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
              </TableCell>
              <TableCell className="text-[#A0B5A8]">
                £{Number(order.totalAmount).toFixed(2)}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    order.paymentMethod === "STRIPE"
                      ? "bg-[#1F8A5B]/20 text-[#6ED3A3] border-[#1F8A5B]/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  }`}
                >
                  {order.paymentMethod === "STRIPE" ? "Stripe" : "PayPal F&F"}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-[#A0B5A8] text-xs whitespace-nowrap">
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
