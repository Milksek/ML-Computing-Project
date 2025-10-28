import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AccountCard from "@/components/AccountCard";
import { mockAccounts, getRecommendations } from "@/utils/clusteringData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Star, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";

const AccountDetail = () => {
  const { id } = useParams();
  const account = mockAccounts.find(acc => acc.id === id);

  if (!account) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <p>Account not found</p>
        </div>
      </div>
    );
  }

  const recommendations = getRecommendations(account, mockAccounts);

  const handlePurchase = () => {
    toast.success("Permintaan pembelian dikirim!", {
      description: "Tim kami akan segera menghubungi Anda."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-lg px-4 py-1">
                    {account.rank}
                  </Badge>
                  {account.cluster !== undefined && (
                    <Badge variant="outline">Cluster {account.cluster}</Badge>
                  )}
                </div>
                <CardTitle className="text-3xl">Premium Mobile Legends Account</CardTitle>
                <CardDescription>Account ID: {account.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden bg-gradient-primary">
                  <div className="flex h-full items-center justify-center">
                    <Trophy className="h-32 w-32 text-primary-foreground opacity-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{account.heroes}</div>
                    <div className="text-sm text-muted-foreground">Heroes</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <Star className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <div className="text-2xl font-bold">{account.skins}</div>
                    <div className="text-sm text-muted-foreground">Skins</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{account.winRate}%</div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <div className="text-2xl font-bold">{account.rank.split(' ')[0]}</div>
                    <div className="text-sm text-muted-foreground">Rank</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Deskripsi</h3>
                  <p className="text-muted-foreground">
                    Akun premium dengan koleksi heroes dan skins lengkap. Win rate tinggi menunjukkan performa konsisten. 
                    Cocok untuk pemain yang ingin langsung bermain di tier {account.rank} dengan koleksi hero yang komprehensif.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-primary shadow-glow-primary">
              <CardHeader>
                <CardTitle className="text-2xl">Harga</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-primary">
                  Rp {account.price.toLocaleString('id-ID')}
                </div>
                <Button 
                  className="w-full bg-gradient-primary hover:shadow-glow-primary" 
                  size="lg"
                  onClick={handlePurchase}
                >
                  Beli Sekarang
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  Transaksi aman dan terpercaya
                </div>
              </CardContent>
            </Card>

            {recommendations.length > 0 && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    Rekomendasi Serupa
                  </CardTitle>
                  <CardDescription>
                    Akun dari cluster yang sama
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="border border-border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline">{rec.rank}</Badge>
                        <span className="text-sm font-semibold text-primary">
                          Rp {(rec.price / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Heroes</div>
                          <div className="font-semibold">{rec.heroes}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Skins</div>
                          <div className="font-semibold">{rec.skins}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">WR</div>
                          <div className="font-semibold text-accent">{rec.winRate}%</div>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a href={`/account/${rec.id}`}>Lihat Detail</a>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
