import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import AccountCard from "@/components/AccountCard";
import { mockAccounts } from "@/utils/clusteringData";
import { Sparkles, TrendingUp, Shield } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const featuredAccounts = mockAccounts.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        
        <div className="container relative mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Premium Mobile Legends
              </span>
              <br />
              Account Marketplace
            </h1>
            <p className="text-xl text-muted-foreground">
              Sistem rekomendasi berbasis clustering K-Means untuk menemukan akun terbaik sesuai preferensi Anda
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow-primary">
                <Link to="/catalog">Jelajahi Akun</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary">
                <Link to="/analysis">Lihat Analisis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Recommendations</h3>
              <p className="text-muted-foreground">
                Algoritma K-Means mengelompokkan akun berdasarkan karakteristik serupa
              </p>
            </div>
            
            <div className="text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="h-12 w-12 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Data Analysis</h3>
              <p className="text-muted-foreground">
                Visualisasi clustering untuk memahami segmentasi pasar akun
              </p>
            </div>
            
            <div className="text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Verified Accounts</h3>
              <p className="text-muted-foreground">
                Semua akun telah diverifikasi untuk keamanan transaksi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Accounts */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Featured Accounts</h2>
            <p className="text-muted-foreground">Akun pilihan dengan performa terbaik</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/catalog">Lihat Semua Akun</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
