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
  Wheat,
  Home
} from 'lucide-react';

export const DashboardPage = () => {
  const { profile } = useAuth();

  const quickActions = [
    {
      title: 'Buy Ration',
      description: 'Purchase ration items with your card',
      icon: ShoppingCart,
      path: '/buy',
      color: 'text-green-600',
    },
    {
      title: 'Sell Rice',
      description: 'Sell unwanted rice back to government',
      icon: ArrowUpCircle,
      path: '/sell',
      color: 'text-blue-600',
    },
    {
      title: 'Convert Items',
      description: 'Convert rice into other grocery items',
      icon: RefreshCw,
      path: '/convert',
      color: 'text-purple-600',
    },
    {
      title: 'View Stock',
      description: 'Check available ration stock',
      icon: Package,
      path: '/stock',
      color: 'text-orange-600',
    },
    {
      title: 'Nearby Shops',
      description: 'Find ration shops near you',
      icon: MapPin,
      path: '/nearby',
      color: 'text-red-600',
    },
    {
      title: 'My Profile',
      description: 'View and edit your profile',
      icon: User,
      path: '/profile',
      color: 'text-gray-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Home className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome, {profile?.name}!
              </h1>
              <p className="text-muted-foreground">
                Card Type: {profile?.card_type?.toUpperCase()} | Card No: {profile?.ration_card_no}
              </p>
            </div>
          </div>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wheat className="h-12 w-12 text-primary mr-4" />
                <div>
                  <h2 className="text-xl font-semibold text-primary">E-Ration Portal</h2>
                  <p className="text-muted-foreground">
                    Manage your ration services digitally. Buy, sell, convert items and find nearby shops.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card key={action.path} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center">
                  <action.icon className={`h-8 w-8 ${action.color} mr-3`} />
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to={action.path}>
                  <Button className="w-full">
                    Go to {action.title}
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
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent ration transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No recent transactions found. Start by buying some ration items!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};