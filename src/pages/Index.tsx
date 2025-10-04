import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
      title: 'Digital Ration Management',
      description: 'Buy, sell, and convert ration items digitally without paperwork'
    },
    {
      icon: Smartphone,
      title: 'Mobile OTP Authentication',
      description: 'Secure login using mobile number verification'
    },
    {
      icon: MapPin,
      title: 'Find Nearby Shops',
      description: 'Locate ration shops near you with integrated maps'
    },
    {
      icon: Users,
      title: 'Multiple Card Types',
      description: 'Support for APL, BPL, AAY, and Priority households'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'All transactions are recorded and tracked securely'
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
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
            Why Choose E-Ration Portal?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of ration distribution with our comprehensive digital platform
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
              Available Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for ration management in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Buy Ration</h3>
              <p className="text-sm text-muted-foreground">Purchase rice, wheat, sugar, oil with your ration card</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ArrowRight className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Sell Rice</h3>
              <p className="text-sm text-muted-foreground">Sell unwanted rice back to the government</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wheat className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Convert Items</h3>
              <p className="text-sm text-muted-foreground">Convert rice into other grocery items</p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">Find Shops</h3>
              <p className="text-sm text-muted-foreground">Locate nearby ration shops with directions</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users already using our digital ration system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Register Now - It's Free!
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Already Have Account? Login
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
              <p className="text-foreground font-semibold">E-Ration Portal</p>
              <p className="text-sm text-muted-foreground">Digital Public Distribution System</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
