import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Edit, Save, History, Phone, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Transaction {
  id: string;
  item: string;
  quantity: number;
  type: string;
  created_at: string;
  shop_name: string;
}

export const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    address: profile?.address || '',
    card_type: profile?.card_type || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        address: profile.address || '',
        card_type: profile.card_type,
      });
      fetchTransactions();
    }
  }, [profile]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          item,
          quantity,
          type,
          created_at,
          shops (
            shop_name
          )
        `)
        .eq('profile_id', profile!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedTransactions = data.map(transaction => ({
        id: transaction.id,
        item: transaction.item,
        quantity: transaction.quantity,
        type: transaction.type,
        created_at: transaction.created_at,
        shop_name: transaction.shops?.shop_name || 'Unknown Shop',
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          address: formData.address,
          card_type: formData.card_type,
        })
        .eq('id', profile!.id);

      if (error) throw error;

      toast({
        title: t('profile.updateSuccess'),
        description: t('profile.updateSuccess'),
      });

      setEditing(false);
      
      // Update local storage
      const updatedProfile = { ...profile!, ...formData };
      localStorage.setItem('rationProfile', JSON.stringify(updatedProfile));
      
    } catch (error) {
      toast({
        title: t('profile.updateError'),
        description: t('profile.updateError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy': return '🛒';
      case 'sell': return '💰';
      case 'convert': return '🔄';
      default: return '📦';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-600';
      case 'sell': return 'text-blue-600';
      case 'convert': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCardTypeColor = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'apl': return 'bg-blue-100 text-blue-800';
      case 'bpl': return 'bg-green-100 text-green-800';
      case 'aay': return 'bg-purple-100 text-purple-800';
      case 'priority': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('profile.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <User className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('profile.title')}</h1>
            <p className="text-muted-foreground">{t('profile.manageProfile')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {t('profile.profileInfo')}
                </CardTitle>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('profile.edit')}
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? t('profile.saving') : t('profile.save')}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('profile.fullName')}</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{profile.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('common.phone')}</Label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="font-medium">{profile.phone_number}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('profile.rationCard')}</Label>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="font-medium">{profile.ration_card_no}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card_type">{t('profile.cardType')}</Label>
                  {editing ? (
                    <Select onValueChange={(value) => setFormData({ ...formData, card_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.cardType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apl">{t('profile.apl')}</SelectItem>
                        <SelectItem value="bpl">{t('profile.bpl')}</SelectItem>
                        <SelectItem value="aay">{t('profile.aay')}</SelectItem>
                        <SelectItem value="priority">{t('profile.priority')}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getCardTypeColor(profile.card_type)}>
                      {profile.card_type.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('common.address')}</Label>
                {editing ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={t('common.address')}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {profile.address || t('profile.noAddress')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                {t('profile.recentTransactions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('profile.loadingTransactions')}</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('profile.noTransactions')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getTransactionIcon(transaction.type)}
                        </span>
                        <div>
                          <p className="font-medium">{transaction.item}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.shop_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getTransactionColor(transaction.type)}`}>
                          {transaction.type.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {transactions.length >= 10 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        {t('profile.showingRecent')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};