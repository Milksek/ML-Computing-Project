import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";

export interface Account {
  id: string;
  rank: string;
  price: number;
  heroes: number;
  skins: number;
  winRate: number;
  cluster?: number;
  image?: string;
}

interface AccountCardProps {
  account: Account;
}

const AccountCard = ({ account }: AccountCardProps) => {
  return (
    <Card className="group overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary hover:shadow-glow-primary">
      <div className="aspect-video overflow-hidden bg-gradient-primary">
        {account.image ? (
          <img 
            src={account.image} 
            alt={`${account.rank} account`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Trophy className="h-16 w-16 text-primary-foreground opacity-50" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {account.rank}
          </Badge>
          {account.cluster !== undefined && (
            <Badge variant="outline">Cluster {account.cluster}</Badge>
          )}
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" /> Heroes
            </span>
            <span className="font-semibold">{account.heroes}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Star className="h-4 w-4" /> Skins
            </span>
            <span className="font-semibold">{account.skins}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Win Rate</span>
            <span className="font-semibold text-accent">{account.winRate}%</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-2xl font-bold text-primary">
          Rp {account.price.toLocaleString('id-ID')}
        </div>
        <Button asChild size="sm" className="bg-gradient-primary hover:shadow-glow-primary">
          <Link to={`/account/${account.id}`}>Detail</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountCard;
