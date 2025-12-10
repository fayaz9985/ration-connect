import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { 
  Home, 
  ShoppingCart, 
  RefreshCw, 
  Package, 
  MapPin, 
  User, 
  Settings,
  LogOut,
  History,
  Truck,
  Wheat,
  Menu
} from 'lucide-react';

export const Navbar = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = profile?.phone_number === '9985913379';

  const allNavItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home, adminOnly: false, userOnly: true },
    { path: '/buy', label: t('nav.buy'), icon: ShoppingCart, adminOnly: false, userOnly: true },
    { path: '/get-rice', label: t('nav.getRice'), icon: Package, adminOnly: false, userOnly: true },
    { path: '/sell-convert', label: t('nav.sellConvert'), icon: RefreshCw, adminOnly: false, userOnly: true },
    { path: '/track-delivery', label: t('nav.tracking'), icon: Truck, adminOnly: false, userOnly: true },
    { path: '/stock', label: t('nav.stock'), icon: Package, adminOnly: false, userOnly: false },
    { path: '/nearby', label: t('nav.nearbyShops'), icon: MapPin, adminOnly: false, userOnly: false },
    { path: '/profile', label: t('nav.profile'), icon: User, adminOnly: false, userOnly: true },
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
            <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-primary">
              <Wheat className="h-6 w-6" />
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
                <span>{t('nav.admin')}</span>
              </Link>
            )}

            <LanguageSwitcher />
            <ThemeToggle />

            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('common.logout')}
            </Button>
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        location.pathname === path
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  ))}
                  
                  {profile?.phone_number === '9985913379' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        location.pathname === '/admin'
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Settings className="h-5 w-5" />
                      <span>{t('nav.admin')}</span>
                    </Link>
                  )}

                  <div className="border-t border-border pt-4 mt-2">
                    <LanguageSwitcher />
                  </div>

                  <Button 
                    variant="ghost" 
                    className="justify-start px-4" 
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {t('common.logout')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};