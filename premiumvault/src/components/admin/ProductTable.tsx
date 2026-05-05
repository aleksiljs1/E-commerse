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
      <ChevronUp className="w-3 h-3 inline ml-1 text-indigo-400" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1 text-indigo-400" />
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 w-12">Logo</TableHead>
            <TableHead
              className="text-zinc-400 cursor-pointer select-none"
              onClick={() => toggleSort("title")}
            >
              Title <SortIcon col="title" />
            </TableHead>
            <TableHead className="text-zinc-400">Service</TableHead>
            <TableHead
              className="text-zinc-400 cursor-pointer select-none"
              onClick={() => toggleSort("price")}
            >
              Price <SortIcon col="price" />
            </TableHead>
            <TableHead
              className="text-zinc-400 cursor-pointer select-none"
              onClick={() => toggleSort("stock")}
            >
              Stock <SortIcon col="stock" />
            </TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400">Orders</TableHead>
            <TableHead className="text-zinc-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                No products found.
              </TableCell>
            </TableRow>
          )}
          {sorted.map((product) => (
            <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-800/50">
              <TableCell>
                <ServiceIcon
                  serviceType={product.serviceType}
                  logoUrl={product.logoUrl}
                  size="sm"
                />
              </TableCell>
              <TableCell className="font-medium text-white">{product.title}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-700 text-zinc-300 capitalize">
                  {product.serviceType}
                </span>
              </TableCell>
              <TableCell className="text-zinc-300">£{Number(product.price).toFixed(2)}</TableCell>
              <TableCell className="text-zinc-300">{product.stock}</TableCell>
              <TableCell>
                {product.active ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    Inactive
                  </span>
                )}
              </TableCell>
              <TableCell className="text-zinc-400">
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
