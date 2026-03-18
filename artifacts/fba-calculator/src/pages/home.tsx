import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Package, Plane, Receipt, Tag } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsDisplay } from "@/components/results-display";

export type Currency = "USD" | "EUR";

const calculatorSchema = z.object({
  sellingPrice: z.coerce.number({ invalid_type_error: "Doit être un nombre" }).min(0, "Ne peut pas être négatif"),
  productCost: z.coerce.number({ invalid_type_error: "Doit être un nombre" }).min(0, "Ne peut pas être négatif"),
  amazonFees: z.coerce.number({ invalid_type_error: "Doit être un nombre" }).min(0, "Ne peut pas être négatif"),
  shippingCost: z.coerce.number({ invalid_type_error: "Doit être un nombre" }).min(0, "Ne peut pas être négatif"),
});

type CalculatorValues = z.infer<typeof calculatorSchema>;

export default function Home() {
  const [results, setResults] = useState<CalculatorValues | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");

  const form = useForm<CalculatorValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
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

  const currencySymbol = currency === "USD" ? "$" : "€";

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <div
        className="absolute top-0 w-full h-[40vh] bg-cover bg-center bg-no-repeat opacity-90 border-b border-border/50 shadow-sm"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hero-bg.png)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-background"></div>
      </div>

      <main className="relative z-10 flex-grow pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setCurrency("USD")}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                        currency === "USD"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      $ USD
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency("EUR")}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                        currency === "EUR"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      € EUR
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

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
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{currencySymbol}</span>
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
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{currencySymbol}</span>
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
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{currencySymbol}</span>
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
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{currencySymbol}</span>
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

                    <div className="pt-2">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-13 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                        disabled={isCalculating}
                      >
                        {isCalculating ? "Calcul en cours..." : "Calculer le profit"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <ResultsDisplay data={results} currency={currency} />
          </div>
        </div>
      </main>
    </div>
  );
}
