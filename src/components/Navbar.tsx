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
  LogOut,
  History,
  Truck
} from 'lucide-react';

export const Navbar = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();

  const isAdmin = profile?.phone_number === '9985913379';

  const allNavItems = [
    { path: '/dashboard', label: 'Home', icon: Home, adminOnly: false, userOnly: true },
    { path: '/buy', label: 'Buy', icon: ShoppingCart, adminOnly: false, userOnly: true },
    { path: '/sell', label: 'Sell', icon: ArrowUpCircle, adminOnly: false, userOnly: true },
    { path: '/get-rice', label: 'Get Rice', icon: Package, adminOnly: false, userOnly: true },
    { path: '/convert', label: 'Convert', icon: RefreshCw, adminOnly: false, userOnly: true },
    { path: '/track-delivery', label: 'Track', icon: Truck, adminOnly: false, userOnly: true },
    { path: '/stock', label: 'Stock', icon: Package, adminOnly: false, userOnly: false },
    { path: '/nearby', label: 'Nearby', icon: MapPin, adminOnly: false, userOnly: false },
    { path: '/profile', label: 'Profile', icon: User, adminOnly: false, userOnly: true },
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => {
    if (isAdmin) {
      return !item.userOnly; // Admin sees only items that are NOT userOnly
    }
    return true; // Regular users see all items
  });

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
            
            {/* Only show Admin link for admin user */}
            {profile?.phone_number === '9985913379' && (
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
            )}

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