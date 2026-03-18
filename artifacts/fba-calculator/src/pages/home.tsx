import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookmarkPlus, Calculator, Package, Plane, Receipt, Tag } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsDisplay } from "@/components/results-display";
import { ProductList } from "@/components/product-list";
import { useProducts } from "@/hooks/use-products";
import { type Currency, calcMetrics } from "@/lib/fba-utils";

const calculatorSchema = z.object({
  productName: z.string().min(1, "Nom requis"),
  sellingPrice: z.coerce.number({ invalid_type_error: "Doit être un nombre" }).min(0, "Ne peut pas être négatif"),
  productCost: z.coerce.number({ invalid_type_error: "Doit être un nombre" }).min(0, "Ne peut pas être négatif"),
  amazonFees: z.coerce.number({ invalid_type_error: "Doit être un nombre" }).min(0, "Ne peut pas être négatif"),
  shippingCost: z.coerce.number({ invalid_type_error: "Doit être un nombre" }).min(0, "Ne peut pas être négatif"),
});

type CalculatorValues = z.infer<typeof calculatorSchema>;

export type { Currency };

export default function Home() {
  const [results, setResults] = useState<CalculatorValues | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");
  const { products, addProduct, removeProduct, clearAll } = useProducts();

  const form = useForm<CalculatorValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      productName: "",
      sellingPrice: 0,
      productCost: 0,
      amazonFees: 0,
      shippingCost: 0,
    },
  });

  const onSubmit = (data: CalculatorValues) => {
    setIsCalculating(true);
    setTimeout(() => {
      setResults(data);
      setIsCalculating(false);
    }, 400);
  };

  const FREE_LIMIT = 2;

  const handleSave = () => {
    if (!results) return;
    const name = form.getValues("productName");
    if (!name.trim()) {
      form.setError("productName", { message: "Nom requis pour sauvegarder" });
      return;
    }
    if (products.length >= FREE_LIMIT) {
      return;
    }
    const { profit, margin, roi, score } = calcMetrics(
      results.sellingPrice,
      results.productCost,
      results.amazonFees,
      results.shippingCost
    );
    addProduct({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      currency,
      sellingPrice: results.sellingPrice,
      productCost: results.productCost,
      amazonFees: results.amazonFees,
      shippingCost: results.shippingCost,
      profit,
      margin,
      roi,
      score,
      savedAt: Date.now(),
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const currencySymbol = currency === "USD" ? "$" : "€";

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <div
        className="absolute top-0 w-full h-[40vh] bg-cover bg-center bg-no-repeat opacity-90 border-b border-border/50 shadow-sm"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hero-bg.png)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-background" />
      </div>

      <main className="relative z-10 flex-grow pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto text-primary-foreground">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-4 shadow-lg shadow-black/5 ring-1 ring-white/20">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight mb-2 drop-shadow-sm">
            FBA Decision Tool
          </h1>
          <p className="text-base md:text-lg font-semibold tracking-wide text-primary-foreground/70 uppercase mb-1">
            Farang Jim
          </p>
          <p className="text-sm md:text-base text-primary-foreground/60">
            Smart decisions for Amazon sellers
          </p>
        </div>

        {/* Calculator + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
          {/* Form */}
          <div className="lg:col-span-5">
            <Card className="shadow-xl shadow-black/5 border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader className="pb-4 border-b border-border/50 bg-muted/10 rounded-t-xl">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="font-display text-xl flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Données produit
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Saisissez les coûts pour une unité.
                    </CardDescription>
                  </div>
                  {/* Currency toggle */}
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    {(["USD", "EUR"] as Currency[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                          currency === c
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c === "USD" ? "$ USD" : "€ EUR"}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Product Name */}
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <BookmarkPlus className="w-4 h-4 text-muted-foreground" />
                            Nom du produit
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Ceinture en cuir noir"
                              className="h-12 text-base rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Selling Price */}
                    <FormField
                      control={form.control}
                      name="sellingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            Prix de vente ({currency})
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                {currencySymbol}
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-8 h-12 text-base rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                {...field}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Product Cost */}
                    <FormField
                      control={form.control}
                      name="productCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            Coût du produit ({currency})
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                {currencySymbol}
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-8 h-12 text-base rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                {...field}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Amazon Fees */}
                    <FormField
                      control={form.control}
                      name="amazonFees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <Receipt className="w-4 h-4 text-muted-foreground" />
                            Frais Amazon FBA ({currency})
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                {currencySymbol}
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-8 h-12 text-base rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                {...field}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Shipping */}
                    <FormField
                      control={form.control}
                      name="shippingCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <Plane className="w-4 h-4 text-muted-foreground" />
                            Frais de livraison ({currency})
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                {currencySymbol}
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-8 h-12 text-base rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                {...field}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-col gap-2">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                        disabled={isCalculating}
                      >
                        {isCalculating ? "Calcul en cours..." : "Calculer le profit"}
                      </Button>

                      {results && (
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={handleSave}
                            disabled={products.length >= FREE_LIMIT}
                            className={`w-full h-12 text-base font-bold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                              savedFlash
                                ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                                : products.length >= FREE_LIMIT
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:-translate-y-0.5"
                            }`}
                          >
                            <BookmarkPlus className="w-4 h-4" />
                            {savedFlash ? "Produit sauvegardé ✓" : "Sauvegarder ce produit"}
                          </Button>
                          {products.length >= FREE_LIMIT && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center space-y-3">
                              <p className="text-xs text-amber-700 font-medium">
                                Limite atteinte — version gratuite (2 produits max)
                              </p>
                              <a
                                href="https://buy.stripe.com/9B6eVfgIwd2LelC123aR200"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                              >
                                🚀 Passer à la version premium
                              </a>
                              <p className="text-[11px] text-amber-600/80">
                                Accès illimité + comparaison avancée + scoring complet
                              </p>
                              <p className="text-[10px] text-amber-500/70 flex items-center justify-center gap-1">
                                🔒 Paiement sécurisé via Stripe
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-7">
            <ResultsDisplay data={results} currency={currency} />
          </div>
        </div>

        {/* Product comparison list */}
        <ProductList
          products={products}
          onRemove={removeProduct}
          onClearAll={clearAll}
        />
      </main>
    </div>
  );
}
