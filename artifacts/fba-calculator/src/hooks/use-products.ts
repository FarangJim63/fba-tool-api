import { useState, useCallback } from "react";
import type { SavedProduct } from "@/lib/fba-utils";

const STORAGE_KEY = "farangjim_products";

function loadProducts(): SavedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedProduct[];
  } catch {
    return [];
  }
}

function saveProducts(products: SavedProduct[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function useProducts() {
  const [products, setProducts] = useState<SavedProduct[]>(() => loadProducts());

  const addProduct = useCallback((product: SavedProduct) => {
    setProducts((prev) => {
      const updated = [product, ...prev];
      saveProducts(updated);
      return updated;
    });
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveProducts(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { products, addProduct, removeProduct, clearAll };
}
