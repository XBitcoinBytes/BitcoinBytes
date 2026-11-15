import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, TrendingUp, BookOpen, Newspaper, BarChart3, Users } from "lucide-react";
import roadToBitcoinLogo from "@assets/BitcoinBytes Logo_1753672995152.jpg";

const navigationItems = [
  {
    name: "Prices",
    href: "/prices", 
    icon: TrendingUp,
    description: "Real-time Bitcoin price comparison across all exchanges"
  },
  {
    name: "Learn",
    href: "/learn",
    icon: BookOpen,
    description: "Bitcoin education and academy modules"
  },
  {
    name: "News", 
    href: "/news",
    icon: Newspaper,
    description: "Latest Bitcoin news and market updates"
  },
  {
    name: "Analytics",
    href: "/analytics", 
    icon: BarChart3,
    description: "Advanced trading tools and market analysis"
  },
  {
    name: "Community",
    href: "/community",
    icon: Users,
    description: "Forum, leaderboard, and social features"
  }
];

export default function NavigationHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyber-cyan/20 bg-dark-surface/95 backdrop-blur supports-[backdrop-filter]:bg-dark-surface/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-bitcoin-orange/30 hover:border-bitcoin-orange transition-colors">
              <img 
                src={roadToBitcoinLogo} 
                alt="Bitcoin Bytes" 
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-bitcoin-orange/20 to-cyber-cyan/20 rounded-full animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-bitcoin-orange to-cyber-cyan bg-clip-text text-transparent">
                Bitcoin Bytes
              </span>
              <div className="text-xs text-muted-foreground">
                Real-time Price Comparison
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive(item.href)
                      ? 'bg-bitcoin-orange/20 text-bitcoin-orange border border-bitcoin-orange/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-dark-surface border-cyber-cyan/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden border border-bitcoin-orange/30">
                      <img 
                        src={roadToBitcoinLogo} 
                        alt="Bitcoin Bytes" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-bold text-bitcoin-orange">Bitcoin Bytes</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                          isActive(item.href)
                            ? 'bg-bitcoin-orange/20 text-bitcoin-orange border border-bitcoin-orange/30'
                            : 'text-muted-foreground hover:text-foreground hover:bg-gray-800/50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t border-cyber-cyan/20">
                  <div className="text-xs text-muted-foreground mb-2">
                    Quick Access
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Homepage Overview
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}