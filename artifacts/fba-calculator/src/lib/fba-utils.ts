export type Currency = "USD" | "EUR";

export interface SavedProduct {
  id: string;
  name: string;
  currency: Currency;
  sellingPrice: number;
  productCost: number;
  amazonFees: number;
  shippingCost: number;
  profit: number;
  margin: number;
  roi: number;
  score: number;
  savedAt: number;
}

export type ProfitabilityLevel = "good" | "average" | "poor";
export type SortKey = "roi" | "margin" | "profit";

export function calcMetrics(
  sellingPrice: number,
  productCost: number,
  amazonFees: number,
  shippingCost: number
) {
  const totalCosts = productCost + amazonFees + shippingCost;
  const profit = sellingPrice - totalCosts;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
  const breakEven = totalCosts;
  const recommendedPrice = totalCosts > 0 ? totalCosts / (1 - 0.3) : 0;
  const score = calcScore(margin, roi);
  return { totalCosts, profit, margin, roi, breakEven, recommendedPrice, score };
}

export function calcScore(margin: number, roi: number): number {
  const marginScore = Math.min(Math.max(margin, 0) / 40, 1) * 50;
  const roiScore = Math.min(Math.max(roi, 0) / 100, 1) * 50;
  return Math.round(marginScore + roiScore);
}

export function getProfitabilityLevel(margin: number): ProfitabilityLevel {
  if (margin >= 30) return "good";
  if (margin >= 15) return "average";
  return "poor";
}

export function getScoreLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-500/10" };
  if (score >= 50) return { label: "Correct", color: "text-orange-500", bg: "bg-orange-500/10" };
  return { label: "Faible", color: "text-red-600", bg: "bg-red-500/10" };
}

export const profitabilityConfig: Record<
  ProfitabilityLevel,
  {
    status: string;
    statusSub: string;
    decision: string;
    color: string;
    bg: string;
    border: string;
    bar: string;
    decisionBg: string;
    decisionColor: string;
  }
> = {
  good: {
    status: "Rentable",
    statusSub: "Marge > 30% — Excellent produit",
    decision: "GO - Bon produit",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    border: "bg-emerald-500",
    bar: "#10b981",
    decisionBg: "bg-emerald-500",
    decisionColor: "text-white",
  },
  average: {
    status: "Acceptable",
    statusSub: "Marge 15–30% — Peut être optimisé",
    decision: "À optimiser",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "bg-orange-500",
    bar: "#f97316",
    decisionBg: "bg-orange-500",
    decisionColor: "text-white",
  },
  poor: {
    status: "Non rentable",
    statusSub: "Marge < 15% — Trop risqué",
    decision: "STOP - Mauvais produit",
    color: "text-red-600",
    bg: "bg-red-500/10",
    border: "bg-red-500",
    bar: "#ef4444",
    decisionBg: "bg-red-500",
    decisionColor: "text-white",
  },
};

export function formatCurrency(value: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
