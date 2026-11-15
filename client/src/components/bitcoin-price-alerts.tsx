import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, TrendingUp, TrendingDown, Target, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PriceAlert {
  id: string;
  targetPrice: number;
  direction: 'above' | 'below';
  email: string;
  isActive: boolean;
  createdAt: Date;
}

interface AlertFormData {
  targetPrice: string;
  direction: 'above' | 'below';
  email: string;
}

export default function BitcoinPriceAlerts() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [formData, setFormData] = useState<AlertFormData>({
    targetPrice: '',
    direction: 'above',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Simulated current Bitcoin price - in production would come from real API
  const currentPrice = 114308;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.targetPrice || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const targetPrice = parseFloat(formData.targetPrice);
    if (isNaN(targetPrice) || targetPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price amount.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - in production would make real request
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAlert: PriceAlert = {
        id: Date.now().toString(),
        targetPrice,
        direction: formData.direction,
        email: formData.email,
        isActive: true,
        createdAt: new Date()
      };

      setAlerts(prev => [...prev, newAlert]);
      
      toast({
        title: "Alert Created Successfully!",
        description: `You'll be notified when Bitcoin goes ${formData.direction} $${targetPrice.toLocaleString()}`,
        duration: 5000,
      });

      // Reset form
      setFormData({
        targetPrice: '',
        direction: 'above',
        email: ''
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error Creating Alert",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast({
      title: "Alert Removed",
      description: "Price alert has been deleted.",
    });
  };

  const getAlertStatus = (alert: PriceAlert) => {
    const { targetPrice, direction } = alert;
    const triggered = (direction === 'above' && currentPrice >= targetPrice) || 
                     (direction === 'below' && currentPrice <= targetPrice);
    
    return {
      triggered,
      message: triggered 
        ? `Alert triggered! Bitcoin is ${direction} $${targetPrice.toLocaleString()}`
        : `Monitoring for Bitcoin to go ${direction} $${targetPrice.toLocaleString()}`
    };
  };

  return (
    <section className="py-16 bg-gradient-to-b from-dark-bg to-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="tech-heading text-3xl md:text-4xl text-bitcoin mb-4">
            🔔 Smart Price Alerts
          </h2>
          <p className="cyber-text text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Never miss important Bitcoin price movements. Set custom alerts and get notified instantly when your target prices are reached.
          </p>
          
          <div className="mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-bitcoin/20 to-electric/20 rounded-full px-6 py-3 border border-bitcoin/30">
              <TrendingUp className="h-5 w-5 text-bitcoin mr-3" />
              <span className="text-white font-bold">Current Bitcoin Price: </span>
              <span className="text-bitcoin font-bold ml-2">${currentPrice.toLocaleString()}</span>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="cyberpunk-btn text-black font-bold hover:scale-105 transition-all duration-300">
                <Bell className="h-4 w-4 mr-2" />
                Create New Alert
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md cyberpunk-card border-bitcoin/30">
              <DialogHeader>
                <DialogTitle className="flex items-center tech-heading text-xl text-bitcoin">
                  <Target className="h-5 w-5 mr-2 text-bitcoin" />
                  SET PRICE ALERT
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-electric">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-dark-bg border-bitcoin/30 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="direction" className="text-electric">Alert Direction</Label>
                    <Select value={formData.direction} onValueChange={(value: 'above' | 'below') => 
                      setFormData(prev => ({ ...prev, direction: value }))}>
                      <SelectTrigger className="bg-dark-bg border-bitcoin/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-bg border-bitcoin/30">
                        <SelectItem value="above" className="text-white hover:bg-bitcoin/20">
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
                            Alert when price goes ABOVE
                          </div>
                        </SelectItem>
                        <SelectItem value="below" className="text-white hover:bg-bitcoin/20">
                          <div className="flex items-center">
                            <TrendingDown className="h-4 w-4 mr-2 text-red-400" />
                            Alert when price goes BELOW
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="targetPrice" className="text-electric">Target Price (USD)</Label>
                    <Input
                      id="targetPrice"
                      type="number"
                      placeholder="e.g., 120000"
                      value={formData.targetPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: e.target.value }))}
                      className="bg-dark-bg border-bitcoin/30 text-white placeholder-gray-400"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="cyberpunk-btn w-full text-black font-bold hover:scale-105 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-pulse" />
                      Creating Alert...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Create Price Alert
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-400 text-center">
                  You'll receive an email notification when your target price is reached
                </p>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Alerts Display */}
        {alerts.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-electric font-bold text-xl mb-6 text-center">Your Active Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => {
                const status = getAlertStatus(alert);
                return (
                  <Card key={alert.id} className={`cyberpunk-card ${
                    status.triggered 
                      ? 'border-green-400 bg-gradient-to-br from-green-400/10 to-bitcoin/5' 
                      : 'border-bitcoin/30'
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          {status.triggered ? (
                            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                          ) : (
                            <Bell className="h-5 w-5 text-bitcoin mr-2" />
                          )}
                          <span className={status.triggered ? 'text-green-400' : 'text-bitcoin'}>
                            ${alert.targetPrice.toLocaleString()}
                          </span>
                        </div>
                        <Button
                          onClick={() => removeAlert(alert.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          Remove
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          {alert.direction === 'above' ? (
                            <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-400 mr-2" />
                          )}
                          <span className="text-gray-300 text-sm capitalize">
                            Alert when {alert.direction} target
                          </span>
                        </div>
                        <p className={`text-sm ${status.triggered ? 'text-green-400' : 'text-gray-400'}`}>
                          {status.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {alert.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-bitcoin/10 to-electric/10 rounded-lg p-8 border border-bitcoin/30 max-w-4xl mx-auto">
            <h3 className="text-bitcoin font-bold text-xl mb-6">Why Use Bitcoin Price Alerts?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-electric mr-2" />
                  <h4 className="text-electric font-semibold">Instant Notifications</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Get real-time email alerts the moment Bitcoin hits your target price
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-electric mr-2" />
                  <h4 className="text-electric font-semibold">Strategic Trading</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Never miss buying opportunities or profit-taking moments
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-electric mr-2" />
                  <h4 className="text-electric font-semibold">Set & Forget</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Monitor Bitcoin 24/7 without constantly checking prices
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}