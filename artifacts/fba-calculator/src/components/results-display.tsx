import { motion } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowRightLeft,
  DollarSign,
  MinusCircle,
  Percent,
  PieChart,
  Gauge,
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
import {
  type Currency,
  calcMetrics,
  formatCurrency,
  getProfitabilityLevel,
  getScoreLabel,
  profitabilityConfig,
} from "@/lib/fba-utils";

interface ResultsDisplayProps {
  data: {
    sellingPrice: number;
    productCost: number;
    amazonFees: number;
    shippingCost: number;
  } | null;
  currency: Currency;
}

export function ResultsDisplay({ data, currency }: ResultsDisplayProps) {
  if (!data) {
    return (
      <Card className="h-full border-dashed bg-muted/30 shadow-none flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <PieChart className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold font-display mb-2 text-foreground">En attente de données</h3>
        <p className="text-muted-foreground max-w-sm">
          Saisissez vos coûts et votre prix de vente, puis cliquez sur "Calculer le profit" pour voir
          l'analyse complète.
        </p>
      </Card>
    );
  }

  const { sellingPrice, productCost, amazonFees, shippingCost } = data;
  const { totalCosts, profit, margin, roi, breakEven, recommendedPrice, score } = calcMetrics(
    sellingPrice,
    productCost,
    amazonFees,
    shippingCost
  );

  const level = getProfitabilityLevel(margin);
  const cfg = profitabilityConfig[level];
  const scoreInfo = getScoreLabel(score);

  const chartData = [
    { name: "Revenu", value: sellingPrice, type: "revenue" },
    { name: "Coûts", value: totalCosts, type: "cost" },
    { name: "Profit", value: Math.max(0, profit), type: "profit" },
  ];

  const currencyPrefix = currency === "USD" ? "$" : "€";

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
              {formatCurrency(profit, currency)}
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              {profit >= 0 ? (
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
              {margin.toFixed(1)}%
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
            <h2
              className={`text-2xl sm:text-3xl font-display font-bold tracking-tight ${
                roi >= 0 ? "text-violet-600" : "text-red-600"
              }`}
            >
              {roi.toFixed(1)}%
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5">Profit ÷ Coût total</p>
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
              {formatCurrency(breakEven, currency)}
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5">Prix min. pour ne pas perdre</p>
          </CardContent>
        </Card>
      </div>

      {/* Score Card */}
      <Card className="shadow-md border-border/50 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${scoreInfo.bg}`}>
                <Gauge className={`w-5 h-5 ${scoreInfo.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Score produit</p>
                <p className="text-xs text-muted-foreground">Basé sur la marge (50%) et le ROI (50%)</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-extrabold font-display ${scoreInfo.color}`}>{score}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreInfo.bg} ${scoreInfo.color}`}>
                {scoreInfo.label}
              </span>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-orange-400" : "bg-red-500"
              }`}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">0</span>
            <span className="text-[10px] text-muted-foreground font-semibold">50 — Correct</span>
            <span className="text-[10px] text-muted-foreground font-semibold">80 — Excellent</span>
            <span className="text-[10px] text-muted-foreground">100</span>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Price */}
      <Card className="shadow-md border-border/50 overflow-hidden">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 flex-shrink-0">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Prix recommandé pour 30% de marge</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Basé sur vos coûts totaux ({formatCurrency(totalCosts, currency)})
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-display font-extrabold text-amber-600">
              {formatCurrency(recommendedPrice, currency)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Chart */}
      <Card className="shadow-md border-border/50">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="font-display text-lg">Détail des coûts</CardTitle>
          <CardDescription>Analyse visuelle de vos marges</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-[200px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 12, right: 0, left: 0, bottom: 0 }}>
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
                  tickFormatter={(val) => `${currencyPrefix}${val}`}
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
                            {formatCurrency(payload[0].value as number, currency)}
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
              <span className="font-semibold text-sm">{formatCurrency(sellingPrice, currency)}</span>
            </div>
            <Separator />
            <div className="space-y-2.5 pl-4 border-l-2 border-muted">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Coût du produit</span>
                <span className="text-foreground font-medium">-{formatCurrency(productCost, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Frais Amazon FBA</span>
                <span className="text-foreground font-medium">-{formatCurrency(amazonFees, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Frais de livraison</span>
                <span className="text-foreground font-medium">-{formatCurrency(shippingCost, currency)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-1.5">
              <span className="text-foreground font-bold text-sm">Total des coûts</span>
              <span className="font-bold text-sm text-red-500">-{formatCurrency(totalCosts, currency)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="flex items-center gap-1.5 font-bold text-sm">
                <MinusCircle className="w-4 h-4 text-muted-foreground" />
                Profit net
              </span>
              <span className={`font-bold text-sm ${cfg.color}`}>{formatCurrency(profit, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
