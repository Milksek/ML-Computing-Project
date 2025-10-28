import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Home, ShoppingBag } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ML Account Market
            </span>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/catalog" className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Catalog</span>
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/analysis" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analysis</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
