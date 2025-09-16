import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  ShoppingCart, 
  ArrowUpCircle, 
  RefreshCw, 
  Package, 
  MapPin, 
  User, 
  Settings,
  LogOut 
} from 'lucide-react';

export const Navbar = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/buy', label: 'Buy', icon: ShoppingCart },
    { path: '/sell', label: 'Sell', icon: ArrowUpCircle },
    { path: '/get-rice', label: 'Get Rice', icon: Package },
    { path: '/convert', label: 'Convert', icon: RefreshCw },
    { path: '/stock', label: 'Stock', icon: Package },
    { path: '/nearby', label: 'Nearby', icon: MapPin },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  if (!profile) return null;

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-primary">
              E-Ration Portal
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
            
            <Link
              to="/admin"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/admin'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Link>

            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu would go here */}
        </div>
      </div>
    </nav>
  );
};