import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import riceFieldBg from '@/assets/rice-field-bg.jpg';
import { 
  Wheat, 
  ShoppingCart, 
  Users, 
  MapPin, 
  Shield, 
  Smartphone,
  ArrowRight 
} from 'lucide-react';

const Index = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && profile) {
      navigate('/dashboard');
    }
  }, [profile, loading, navigate]);

  const features = [
    {
      icon: ShoppingCart,
      title: t('pages.index.digitalManagement'),
      description: t('pages.index.digitalManagementDesc')
    },
    {
      icon: Smartphone,
      title: t('pages.index.mobileOtp'),
      description: t('pages.index.mobileOtpDesc')
    },
    {
      icon: MapPin,
      title: t('pages.index.findNearby'),
      description: t('pages.index.findNearbyDesc')
    },
    {
      icon: Users,
      title: t('pages.index.multipleCards'),
      description: t('pages.index.multipleCardsDesc')
    },
    {
      icon: Shield,
      title: t('pages.index.secureTransactions'),
      description: t('pages.index.secureTransactionsDesc')
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Wheat className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={riceFieldBg} 
            alt="Rice field background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6 gap-4">
              <Wheat className="h-16 w-16 text-primary" />
              <h1 className="text-5xl font-bold text-foreground">
                {t('home.title')}
              </h1>
              <LanguageSwitcher />
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('home.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  {t('common.login')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('common.register')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('pages.index.whyChoose')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pages.index.whyChooseDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('pages.index.availableServices')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('pages.index.availableServicesDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('pages.index.buyRationService')}</h3>
              <p className="text-sm text-muted-foreground">{t('pages.index.buyRationServiceDesc')}</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ArrowRight className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('pages.index.sellRiceService')}</h3>
              <p className="text-sm text-muted-foreground">{t('pages.index.sellRiceServiceDesc')}</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wheat className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('pages.index.convertItemsService')}</h3>
              <p className="text-sm text-muted-foreground">{t('pages.index.convertItemsServiceDesc')}</p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('pages.index.findShopsService')}</h3>
              <p className="text-sm text-muted-foreground">{t('pages.index.findShopsServiceDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('pages.index.readyToStart')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('pages.index.readyToStartDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  {t('pages.index.registerNow')}
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('pages.index.alreadyHaveAccountLogin')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Wheat className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-foreground font-semibold">{t('home.title')}</p>
              <p className="text-sm text-muted-foreground">{t('pages.index.footer')}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
