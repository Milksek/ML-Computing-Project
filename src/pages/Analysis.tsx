import Navbar from "@/components/Navbar";
import { mockAccounts, calculateClusters } from "@/utils/clusteringData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, Legend } from "recharts";

const Analysis = () => {
  const clusterData = calculateClusters(mockAccounts);

  const scatterData = mockAccounts.map(account => ({
    price: account.price / 1000000, // Convert to millions for better visualization
    heroes: account.heroes,
    cluster: account.cluster,
    rank: account.rank,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">K-Means Clustering Analysis</h1>
          <p className="text-muted-foreground">Analisis pengelompokan akun berdasarkan karakteristik</p>
        </div>

        {/* Cluster Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {clusterData.map((cluster) => (
            <Card key={cluster.cluster} className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: cluster.color }}
                  />
                  Cluster {cluster.cluster}
                </CardTitle>
                <CardDescription>{cluster.count} akun dalam cluster ini</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Price</span>
                  <span className="font-semibold">Rp {cluster.avgPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Heroes</span>
                  <span className="font-semibold">{cluster.avgHeroes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Skins</span>
                  <span className="font-semibold">{cluster.avgSkins}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Win Rate</span>
                  <span className="font-semibold text-accent">{cluster.avgWinRate}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Visualizations */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scatter Plot */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Price vs Heroes Distribution</CardTitle>
              <CardDescription>Distribusi akun berdasarkan harga dan jumlah heroes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    dataKey="price" 
                    name="Price (Juta)"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="heroes" 
                    name="Heroes"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Scatter name="Accounts" data={scatterData}>
                    {scatterData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={clusterData[entry.cluster || 0]?.color || 'hsl(var(--primary))'}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Cluster Comparison</CardTitle>
              <CardDescription>Perbandingan rata-rata karakteristik tiap cluster</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={clusterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="cluster" 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `Cluster ${value}`}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avgHeroes" fill="hsl(var(--primary))" name="Avg Heroes" />
                  <Bar dataKey="avgSkins" fill="hsl(var(--accent))" name="Avg Skins" />
                  <Bar dataKey="avgWinRate" fill="hsl(190, 95%, 55%)" name="Avg Win Rate" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="mt-8 border-border bg-card/50">
          <CardHeader>
            <CardTitle>Tentang K-Means Clustering</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Sistem ini menggunakan algoritma K-Means untuk mengelompokkan akun Mobile Legends berdasarkan karakteristik seperti harga, jumlah heroes, skins, dan win rate.
            </p>
            <p>
              Setiap cluster mewakili segmen pasar yang berbeda, memungkinkan sistem untuk memberikan rekomendasi akun yang relevan berdasarkan preferensi pengguna.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;
