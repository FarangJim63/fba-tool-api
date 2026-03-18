import { motion } from "framer-motion";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Percent, PieChart, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ResultsDisplayProps {
  data: {
    sellingPrice: number;
    productCost: number;
    amazonFees: number;
    shippingCost: number;
  } | null;
}

export function ResultsDisplay({ data }: ResultsDisplayProps) {
  if (!data) {
    return (
      <Card className="h-full border-dashed bg-muted/30 shadow-none flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <PieChart className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold font-display mb-2 text-foreground">Waiting for input</h3>
        <p className="text-muted-foreground max-w-sm">
          Enter your product costs and selling price on the left, then click calculate to see your FBA profit breakdown.
        </p>
      </Card>
    );
  }

  const { sellingPrice, productCost, amazonFees, shippingCost } = data;
  
  const totalCosts = productCost + amazonFees + shippingCost;
  const netProfit = sellingPrice - totalCosts;
  const profitMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
  
  const isProfitable = netProfit >= 0;

  const chartData = [
    { name: "Revenue", value: sellingPrice, type: "revenue" },
    { name: "Costs", value: totalCosts, type: "cost" },
    { name: "Profit", value: Math.max(0, netProfit), type: "profit" }
  ];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-md border-border/50 overflow-hidden relative group">
          <div className={`absolute top-0 left-0 w-1 h-full ${isProfitable ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Net Profit</p>
              <div className={`p-2 rounded-lg ${isProfitable ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className={`text-4xl font-display font-bold tracking-tight ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              {isProfitable ? (
                <><ArrowUpIcon className="w-4 h-4 text-emerald-500" /> You are making money</>
              ) : (
                <><ArrowDownIcon className="w-4 h-4 text-red-500" /> You are losing money</>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50 overflow-hidden relative group">
           <div className={`absolute top-0 left-0 w-1 h-full ${isProfitable ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Net Margin</p>
              <div className={`p-2 rounded-lg ${isProfitable ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className={`text-4xl font-display font-bold tracking-tight ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                {profitMargin.toFixed(2)}%
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Based on selling price
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-border/50">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="font-display text-xl">Profit Breakdown</CardTitle>
          <CardDescription>Visual analysis of your product unit economics</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          
          <div className="h-[250px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border shadow-lg rounded-xl p-3">
                          <p className="font-semibold">{payload[0].payload.name}</p>
                          <p className="text-lg font-bold font-display">{formatCurrency(payload[0].value as number)}</p>
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
                        entry.type === 'revenue' ? 'hsl(var(--primary))' : 
                        entry.type === 'cost' ? 'hsl(var(--chart-2))' : 
                        isProfitable ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Cost Details</h4>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-foreground font-medium">Selling Price</span>
              <span className="font-semibold">{formatCurrency(sellingPrice)}</span>
            </div>
            
            <Separator />
            
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Product Cost</span>
                <span className="text-foreground font-medium">-{formatCurrency(productCost)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amazon FBA Fees</span>
                <span className="text-foreground font-medium">-{formatCurrency(amazonFees)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Shipping Cost</span>
                <span className="text-foreground font-medium">-{formatCurrency(shippingCost)}</span>
              </div>
            </div>

            <Separator />
            
            <div className="flex justify-between items-center py-2">
              <span className="text-foreground font-bold">Total Costs</span>
              <span className="font-bold text-red-500">-{formatCurrency(totalCosts)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
