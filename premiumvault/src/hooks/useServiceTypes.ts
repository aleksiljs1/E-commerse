"use client";

import { useState, useEffect } from "react";

export type ServiceTypeInfo = { id: string; slug: string; label: string; color: string };

let cache: ServiceTypeInfo[] | null = null;
let inflightPromise: Promise<ServiceTypeInfo[]> | null = null;

export function useServiceTypes(): ServiceTypeInfo[] {
  const [types, setTypes] = useState<ServiceTypeInfo[]>(cache ?? []);

  useEffect(() => {
    if (cache) { setTypes(cache); return; }
    if (!inflightPromise) {
      inflightPromise = fetch("/api/service-types")
        .then((r) => r.json())
        .then((d) => {
          cache = d.data ?? [];
          return cache!;
        })
        .catch(() => {
          inflightPromise = null;
          return [] as ServiceTypeInfo[];
        });
    }
    inflightPromise.then(setTypes);
  }, []);

  return types;
}
