import { motion } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowRightLeft,
  DollarSign,
  MinusCircle,
  Percent,
  PieChart,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Currency } from "@/pages/home";

interface ResultsDisplayProps {
  data: {
    sellingPrice: number;
    productCost: number;
    amazonFees: number;
    shippingCost: number;
  } | null;
  currency: Currency;
}

type ProfitabilityLevel = "good" | "average" | "poor";

function getProfitabilityLevel(margin: number): ProfitabilityLevel {
  if (margin >= 30) return "good";
  if (margin >= 15) return "average";
  return "poor";
}

const profitabilityConfig: Record<
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

export function ResultsDisplay({ data, currency }: ResultsDisplayProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(currency === "USD" ? "en-US" : "fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  if (!data) {
    return (
      <Card className="h-full border-dashed bg-muted/30 shadow-none flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <PieChart className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold font-display mb-2 text-foreground">En attente de données</h3>
        <p className="text-muted-foreground max-w-sm">
          Saisissez vos coûts et votre prix de vente, puis cliquez sur "Calculer le profit" pour voir l'analyse complète.
        </p>
      </Card>
    );
  }

  const { sellingPrice, productCost, amazonFees, shippingCost } = data;

  const totalCosts = productCost + amazonFees + shippingCost;
  const netProfit = sellingPrice - totalCosts;
  const profitMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
  const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
  const breakEvenPrice = totalCosts;
  const recommendedPrice = totalCosts > 0 ? totalCosts / (1 - 0.3) : 0;

  const level = getProfitabilityLevel(profitMargin);
  const cfg = profitabilityConfig[level];

  const chartData = [
    { name: "Revenu", value: sellingPrice, type: "revenue" },
    { name: "Coûts", value: totalCosts, type: "cost" },
    { name: "Profit", value: Math.max(0, netProfit), type: "profit" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Decision Banner */}
      <Card className={`shadow-md border-0 overflow-hidden ${cfg.decisionBg}`}>
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <p className={`text-xl font-extrabold tracking-wide ${cfg.decisionColor}`}>
            {cfg.decision}
          </p>
          <div className={`text-right ${cfg.decisionColor}`}>
            <p className="text-sm font-bold opacity-90">{cfg.status}</p>
            <p className="text-xs opacity-70">{cfg.statusSub}</p>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Net Profit */}
        <Card className="shadow-md border-border/50 overflow-hidden relative">
          <div className={`absolute top-0 left-0 w-1 h-full ${cfg.border}`} />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Profit net
              </p>
              <div className={`p-1.5 rounded-lg ${cfg.bg}`}>
                <DollarSign className={`w-4 h-4 ${cfg.color}`} />
              </div>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-display font-bold tracking-tight ${cfg.color}`}>
              {formatCurrency(netProfit)}
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              {netProfit >= 0 ? (
                <><ArrowUpIcon className="w-3 h-3 text-emerald-500" /> Vous gagnez de l'argent</>
              ) : (
                <><ArrowDownIcon className="w-3 h-3 text-red-500" /> Vous perdez de l'argent</>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Margin */}
        <Card className="shadow-md border-border/50 overflow-hidden relative">
          <div className={`absolute top-0 left-0 w-1 h-full ${cfg.border}`} />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Marge
              </p>
              <div className={`p-1.5 rounded-lg ${cfg.bg}`}>
                <Percent className={`w-4 h-4 ${cfg.color}`} />
              </div>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-display font-bold tracking-tight ${cfg.color}`}>
              {profitMargin.toFixed(1)}%
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Du prix de vente
            </p>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card className="shadow-md border-border/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ROI
              </p>
              <div className="p-1.5 rounded-lg bg-violet-500/10">
                <TrendingUp className="w-4 h-4 text-violet-600" />
              </div>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-display font-bold tracking-tight ${roi >= 0 ? "text-violet-600" : "text-red-600"}`}>
              {roi.toFixed(1)}%
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5">
              Profit ÷ Coût total
            </p>
          </CardContent>
        </Card>

        {/* Break-even */}
        <Card className="shadow-md border-border/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Seuil de rentabilité
              </p>
              <div className="p-1.5 rounded-lg bg-sky-500/10">
                <ArrowRightLeft className="w-4 h-4 text-sky-600" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-sky-600">
              {formatCurrency(breakEvenPrice)}
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5">
              Prix min. pour ne pas perdre
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Price for 30% Margin */}
      <Card className="shadow-md border-border/50 overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-xl" />
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 flex-shrink-0">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Prix recommandé pour 30% de marge</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Basé sur vos coûts totaux ({formatCurrency(totalCosts)})
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-display font-extrabold text-amber-600">
              {formatCurrency(recommendedPrice)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Card */}
      <Card className="shadow-md border-border/50">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="font-display text-lg">Détail des coûts</CardTitle>
          <CardDescription>Analyse visuelle de vos marges</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-[220px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickFormatter={(val) => `${currency === "USD" ? "$" : "€"}${val}`}
                  width={55}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border shadow-lg rounded-xl p-3">
                          <p className="font-semibold text-sm">{payload[0].payload.name}</p>
                          <p className="text-lg font-bold font-display">
                            {formatCurrency(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.type === "revenue"
                          ? "hsl(var(--primary))"
                          : entry.type === "cost"
                          ? "hsl(var(--chart-2))"
                          : cfg.bar
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Récapitulatif
            </h4>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-foreground font-medium text-sm">Prix de vente</span>
              <span className="font-semibold text-sm">{formatCurrency(sellingPrice)}</span>
            </div>

            <Separator />

            <div className="space-y-2.5 pl-4 border-l-2 border-muted">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Coût du produit</span>
                <span className="text-foreground font-medium">-{formatCurrency(productCost)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Frais Amazon FBA</span>
                <span className="text-foreground font-medium">-{formatCurrency(amazonFees)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Frais de livraison</span>
                <span className="text-foreground font-medium">-{formatCurrency(shippingCost)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center py-1.5">
              <span className="text-foreground font-bold text-sm">Total des coûts</span>
              <span className="font-bold text-sm text-red-500">-{formatCurrency(totalCosts)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="flex items-center gap-1.5 font-bold text-sm">
                <MinusCircle className="w-4 h-4 text-muted-foreground" />
                Profit net
              </span>
              <span className={`font-bold text-sm ${cfg.color}`}>{formatCurrency(netProfit)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
