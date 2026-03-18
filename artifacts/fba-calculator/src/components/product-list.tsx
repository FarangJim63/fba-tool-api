import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Lock, Star, Trash2, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  type SavedProduct,
  type SortKey,
  formatCurrency,
  getProfitabilityLevel,
  getScoreLabel,
  profitabilityConfig,
} from "@/lib/fba-utils";

const FREE_LIMIT = 2;

interface ProductListProps {
  products: SavedProduct[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "roi", label: "ROI" },
  { key: "margin", label: "Marge" },
  { key: "profit", label: "Profit" },
];

export function ProductList({ products, onRemove, onClearAll }: ProductListProps) {
  const [sortBy, setSortBy] = useState<SortKey>("roi");

  if (products.length === 0) return null;

  const sorted = [...products].sort((a, b) => b[sortBy] - a[sortBy]);
  const bestId = sorted[0]?.id;

  return (
    <Card className="shadow-xl shadow-black/5 border-border/50 bg-card/95">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/10 rounded-t-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Mes produits ({products.length})
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Comparez et identifiez les meilleures opportunités.
            </CardDescription>
          </div>
          <button
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Tout effacer
          </button>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Trier par :
          </span>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  sortBy === opt.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Free tier banner */}
        {products.length < FREE_LIMIT ? (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              Version gratuite — limitée à {FREE_LIMIT} produits
              <span className="text-amber-500 ml-1">({products.length}/{FREE_LIMIT})</span>
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center space-y-3">
            <p className="text-xs text-amber-700 font-medium flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Limite atteinte — {FREE_LIMIT}/{FREE_LIMIT} produits sauvegardés
            </p>
            <a
              href="#premium"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              🚀 Passer à la version premium
            </a>
            <p className="text-[11px] text-amber-600/80">
              Accès illimité + comparaison avancée + scoring complet
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <AnimatePresence initial={false}>
          {sorted.map((product, index) => {
            const level = getProfitabilityLevel(product.margin);
            const cfg = profitabilityConfig[level];
            const scoreInfo = getScoreLabel(product.score);
            const isBest = product.id === bestId;

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className={`relative rounded-xl border p-4 transition-all ${
                    isBest
                      ? "border-amber-400/60 bg-amber-50/50 dark:bg-amber-950/20"
                      : "border-border/50 bg-card"
                  }`}
                >
                  {/* Best badge */}
                  {isBest && (
                    <div className="absolute -top-2.5 left-4 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5 fill-white" /> Meilleur ROI
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Name + rank */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                        <h3 className="font-bold text-sm text-foreground truncate">{product.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.status}
                        </span>
                      </div>

                      {/* Metrics row */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Profit</p>
                          <p className={`text-sm font-bold ${cfg.color}`}>
                            {formatCurrency(product.profit, product.currency)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Marge</p>
                          <p className={`text-sm font-bold ${cfg.color}`}>
                            {product.margin.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">ROI</p>
                          <p className={`text-sm font-bold ${product.roi >= 0 ? "text-violet-600" : "text-red-600"}`}>
                            {product.roi.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${product.score}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              product.score >= 80
                                ? "bg-emerald-500"
                                : product.score >= 50
                                ? "bg-orange-400"
                                : "bg-red-500"
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-bold min-w-[28px] text-right ${scoreInfo.color}`}>
                          {product.score}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${scoreInfo.bg} ${scoreInfo.color}`}>
                          {scoreInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onRemove(product.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
