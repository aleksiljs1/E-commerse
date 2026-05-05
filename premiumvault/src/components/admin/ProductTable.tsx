"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/store/ServiceIcon";
import { ChevronUp, ChevronDown } from "lucide-react";

type Props = {
  products: any[];
  onDeactivate: (id: string) => void;
};

type SortKey = "title" | "price" | "stock";
type SortDir = "asc" | "desc";

export function ProductTable({ products, onDeactivate }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...products].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === "price") {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-30 inline ml-1" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1 text-[#6ED3A3]" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1 text-[#6ED3A3]" />
    );
  }

  return (
    <div className="bg-[#16221B] border border-[#1F8A5B]/30 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[#1F8A5B]/20 hover:bg-transparent bg-[#0F1412]/60">
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium w-12">Logo</TableHead>
            <TableHead
              className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium cursor-pointer select-none"
              onClick={() => toggleSort("title")}
            >
              Title <SortIcon col="title" />
            </TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Service</TableHead>
            <TableHead
              className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium cursor-pointer select-none"
              onClick={() => toggleSort("price")}
            >
              Price <SortIcon col="price" />
            </TableHead>
            <TableHead
              className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium cursor-pointer select-none"
              onClick={() => toggleSort("stock")}
            >
              Stock <SortIcon col="stock" />
            </TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Status</TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Orders</TableHead>
            <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[#A0B5A8] py-8">
                No products found.
              </TableCell>
            </TableRow>
          )}
          {sorted.map((product) => (
            <TableRow key={product.id} className="border-[#1F8A5B]/20 hover:bg-[#1F8A5B]/10">
              <TableCell>
                <ServiceIcon
                  serviceType={product.serviceType}
                  logoUrl={product.logoUrl}
                  size="sm"
                />
              </TableCell>
              <TableCell className="font-medium text-[#E8F5EE]">{product.title}</TableCell>
              <TableCell>
                <span className="text-zinc-500 text-xs capitalize">
                  {product.serviceType}
                </span>
              </TableCell>
              <TableCell className="text-[#A0B5A8]">£{Number(product.price).toFixed(2)}</TableCell>
              <TableCell className="text-[#A0B5A8]">{product.stock}</TableCell>
              <TableCell>
                {product.active ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/10 text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/10 text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    Inactive
                  </span>
                )}
              </TableCell>
              <TableCell className="text-[#A0B5A8]">
                {product._count?.orderItems ?? 0}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/dashboard/products/${product.id}/edit`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                  {product.active && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Deactivate "${product.title}"? This will hide it from the store.`
                          )
                        ) {
                          onDeactivate(product.id);
                        }
                      }}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
