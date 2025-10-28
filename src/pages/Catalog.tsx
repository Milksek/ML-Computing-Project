import { useState } from "react";
import Navbar from "@/components/Navbar";
import AccountCard from "@/components/AccountCard";
import { mockAccounts } from "@/utils/clusteringData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const Catalog = () => {
  const [rankFilter, setRankFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 4000000]);

  const filteredAccounts = mockAccounts.filter(account => {
    const matchesRank = rankFilter === "all" || account.rank === rankFilter;
    const matchesPrice = account.price >= priceRange[0] && account.price <= priceRange[1];
    return matchesRank && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Account Catalog</h1>
          <p className="text-muted-foreground">Temukan akun Mobile Legends terbaik untuk Anda</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Filter</h3>
              </div>
              
              <div className="space-y-2">
                <Label>Rank</Label>
                <Select value={rankFilter} onValueChange={setRankFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Rank</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Legend">Legend</SelectItem>
                    <SelectItem value="Mythic">Mythic</SelectItem>
                    <SelectItem value="Mythic Glory">Mythic Glory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Price Range</Label>
                <Slider
                  min={0}
                  max={4000000}
                  step={100000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Rp {priceRange[0].toLocaleString('id-ID')}</span>
                  <span>Rp {priceRange[1].toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Accounts Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 text-sm text-muted-foreground">
              Menampilkan {filteredAccounts.length} akun
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAccounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
