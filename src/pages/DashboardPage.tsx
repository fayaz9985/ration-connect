import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingCart, 
  ArrowUpCircle, 
  RefreshCw, 
  Package, 
  MapPin, 
  User,
  Settings,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import pdsBanner from '@/assets/pds-banner.jpg';

export const DashboardPage = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();

  const quickActions = [
    {
      title: t('pages.dashboard.actions.buy.title'),
      description: t('pages.dashboard.actions.buy.desc'),
      icon: ShoppingCart,
      path: '/buy',
      color: 'bg-primary/10 hover:bg-primary/20 border-primary/20'
    },
    {
      title: t('pages.dashboard.actions.sell.title'),
      description: t('pages.dashboard.actions.sell.desc'),
      icon: ArrowUpCircle,
      path: '/sell',
      color: 'bg-primary/10 hover:bg-primary/20 border-primary/20'
    },
    {
      title: t('pages.dashboard.actions.getRice.title'),
      description: t('pages.dashboard.actions.getRice.desc'),
      icon: Package,
      path: '/get-rice',
      color: 'bg-primary/20 hover:bg-primary/30 border-primary/30'
    },
    {
      title: t('pages.dashboard.actions.convert.title'),
      description: t('pages.dashboard.actions.convert.desc'),
      icon: RefreshCw,
      path: '/convert',
      color: 'bg-accent hover:bg-accent/80 border-border'
    },
    {
      title: t('pages.dashboard.actions.checkStock.title'),
      description: t('pages.dashboard.actions.checkStock.desc'),
      icon: Package,
      path: '/stock',
      color: 'bg-accent hover:bg-accent/80 border-border'
    },
    {
      title: t('pages.dashboard.actions.nearbyShops.title'),
      description: t('pages.dashboard.actions.nearbyShops.desc'),
      icon: MapPin,
      path: '/nearby',
      color: 'bg-accent hover:bg-accent/80 border-border'
    },
    {
      title: t('pages.dashboard.actions.profile.title'),
      description: t('pages.dashboard.actions.profile.desc'),
      icon: User,
      path: '/profile',
      color: 'bg-accent hover:bg-accent/80 border-border'
    },
    {
      title: t('pages.dashboard.actions.admin.title'),
      description: t('pages.dashboard.actions.admin.desc'),
      icon: Settings,
      path: '/admin',
      color: 'bg-muted hover:bg-muted/80 border-border'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-80 mb-6 overflow-hidden">
        <img 
          src={pdsBanner} 
          alt={t('pages.dashboard.alt.banner')} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white space-y-2">
            <h1 className="text-5xl font-bold">{t('pages.dashboard.hero.title')}</h1>
            <p className="text-xl">{t('pages.dashboard.hero.subtitle')}</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            {t('pages.dashboard.welcome', { name: profile?.name ?? '' })}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('pages.dashboard.manageDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="bg-accent px-3 py-1 rounded-full">
              {t('pages.dashboard.labels.cardType')}: <span className="font-medium capitalize text-primary">{profile?.card_type}</span>
            </span>
            <span className="bg-accent px-3 py-1 rounded-full">
              {t('pages.dashboard.labels.cardNumber')}: <span className="font-medium text-primary">{profile?.ration_card_no}</span>
            </span>
            <span className="bg-accent px-3 py-1 rounded-full">
              {t('pages.dashboard.labels.familyMembers')}: <span className="font-medium text-primary">{profile?.family_members}</span>
            </span>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card key={action.path} className={`hover:shadow-lg transition-all border ${action.color}`}>
              <CardHeader>
                <div className="flex items-center">
                  <action.icon className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to={action.path}>
                  <Button className="w-full">
                    {t('pages.dashboard.button.goTo', { title: action.title })}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('pages.dashboard.recent.title')}
              </CardTitle>
              <CardDescription>{t('pages.dashboard.recent.desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                {t('pages.dashboard.recent.empty')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};