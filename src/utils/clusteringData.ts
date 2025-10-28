import { Account } from "@/components/AccountCard";

// Mock data untuk akun Mobile Legends
export const mockAccounts: Account[] = [
  { id: "1", rank: "Mythic Glory", price: 2500000, heroes: 95, skins: 120, winRate: 68, cluster: 2 },
  { id: "2", rank: "Mythic", price: 1800000, heroes: 78, skins: 85, winRate: 62, cluster: 1 },
  { id: "3", rank: "Legend", price: 850000, heroes: 52, skins: 45, winRate: 58, cluster: 0 },
  { id: "4", rank: "Epic", price: 450000, heroes: 38, skins: 28, winRate: 54, cluster: 0 },
  { id: "5", rank: "Mythic Glory", price: 3200000, heroes: 102, skins: 145, winRate: 72, cluster: 2 },
  { id: "6", rank: "Mythic", price: 1650000, heroes: 72, skins: 78, winRate: 60, cluster: 1 },
  { id: "7", rank: "Legend", price: 920000, heroes: 58, skins: 52, winRate: 59, cluster: 0 },
  { id: "8", rank: "Mythic Glory", price: 2850000, heroes: 88, skins: 110, winRate: 70, cluster: 2 },
  { id: "9", rank: "Epic", price: 380000, heroes: 32, skins: 22, winRate: 52, cluster: 0 },
  { id: "10", rank: "Mythic", price: 1950000, heroes: 82, skins: 92, winRate: 64, cluster: 1 },
  { id: "11", rank: "Legend", price: 780000, heroes: 48, skins: 38, winRate: 56, cluster: 0 },
  { id: "12", rank: "Mythic Glory", price: 3500000, heroes: 108, skins: 160, winRate: 74, cluster: 2 },
];

// K-Means clustering simulation
export interface ClusterData {
  cluster: number;
  avgPrice: number;
  avgHeroes: number;
  avgSkins: number;
  avgWinRate: number;
  count: number;
  color: string;
}

export const calculateClusters = (accounts: Account[]): ClusterData[] => {
  const clusters: { [key: number]: Account[] } = {};
  
  accounts.forEach(account => {
    const cluster = account.cluster || 0;
    if (!clusters[cluster]) {
      clusters[cluster] = [];
    }
    clusters[cluster].push(account);
  });
  
  const colors = ['hsl(190, 95%, 55%)', 'hsl(263, 70%, 60%)', 'hsl(45, 93%, 58%)'];
  
  return Object.entries(clusters).map(([clusterNum, accs]) => {
    const cluster = parseInt(clusterNum);
    return {
      cluster,
      avgPrice: Math.round(accs.reduce((sum, a) => sum + a.price, 0) / accs.length),
      avgHeroes: Math.round(accs.reduce((sum, a) => sum + a.heroes, 0) / accs.length),
      avgSkins: Math.round(accs.reduce((sum, a) => sum + a.skins, 0) / accs.length),
      avgWinRate: Math.round(accs.reduce((sum, a) => sum + a.winRate, 0) / accs.length),
      count: accs.length,
      color: colors[cluster] || colors[0],
    };
  });
};

export const getRecommendations = (selectedAccount: Account, allAccounts: Account[]): Account[] => {
  return allAccounts
    .filter(acc => acc.id !== selectedAccount.id && acc.cluster === selectedAccount.cluster)
    .slice(0, 3);
};
