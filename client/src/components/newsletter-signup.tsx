import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Mail, Zap, TrendingUp, BookOpen, Bell, CheckCircle, Users, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewsletterFormData {
  email: string;
  firstName: string;
  interests: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
}

const interestOptions = [
  { id: 'price-analysis', label: 'Price Analysis & Market Insights', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'education', label: 'Bitcoin Education & Learning', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'news', label: 'Breaking News & Updates', icon: <Bell className="h-4 w-4" /> },
  { id: 'technology', label: 'Technology & Development', icon: <Zap className="h-4 w-4" /> }
];

export default function NewsletterSignup() {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: '',
    firstName: '',
    interests: [],
    frequency: 'weekly'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interestId]
        : prev.interests.filter(id => id !== interestId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.firstName) {
      toast({
        title: "Please fill in required fields",
        description: "Email and first name are required to join our community.",
        variant: "destructive",
      });
      return;
    }

    if (formData.interests.length === 0) {
      toast({
        title: "Select your interests",
        description: "Please choose at least one topic you'd like to receive updates about.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate newsletter signup API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      toast({
        title: "Welcome to the Bitcoin Revolution!",
        description: `Thanks ${formData.firstName}! Check your email for a confirmation link.`,
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section id="newsletter" className="py-16 bg-gradient-to-b from-dark-bg to-surface">
        <div className="container mx-auto px-6">
          <Card className="cyberpunk-card max-w-2xl mx-auto bg-gradient-to-br from-green-400/10 to-bitcoin/10 border-green-400/30">
            <CardContent className="text-center py-12">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400 mb-2">
                  🎉 Welcome to the Revolution!
                </h2>
                <p className="text-gray-300 text-lg">
                  Thanks {formData.firstName}! You've successfully joined 1,000+ Bitcoin enthusiasts.
                </p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center text-green-400">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>Confirmation email sent to {formData.email}</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Please check your inbox and click the confirmation link to complete your subscription.
                </p>
              </div>

              <div className="bg-dark-bg/50 rounded-lg p-6 border border-bitcoin/20">
                <h3 className="text-bitcoin font-bold mb-4">What happens next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-bitcoin rounded-full flex items-center justify-center text-black text-sm font-bold mr-3">1</span>
                    <span className="text-gray-300">Confirm your email address</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-electric rounded-full flex items-center justify-center text-black text-sm font-bold mr-3">2</span>
                    <span className="text-gray-300">Receive your first Bitcoin insights within 24 hours</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3">3</span>
                    <span className="text-gray-300">Join our exclusive Bitcoin community discussions</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => window.location.href = '/learn'}
                className="cyberpunk-btn mt-6 text-black font-bold hover:scale-105 transition-all duration-300"
              >
                Explore Bitcoin Learning Hub
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="newsletter" className="py-16 bg-gradient-to-b from-dark-bg to-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="tech-heading text-3xl md:text-4xl text-bitcoin mb-4">
            🚀 Join the Bitcoin Revolution
          </h2>
          <p className="cyber-text text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Join 1,000+ Bitcoin enthusiasts who receive expert insights, market analysis, and educational content 
            delivered directly to their inbox.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-bitcoin/20 text-bitcoin border-bitcoin/30 px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              1,000+ Subscribers
            </Badge>
            <Badge className="bg-green-400/20 text-green-400 border-green-400/30 px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              No Spam Guarantee
            </Badge>
            <Badge className="bg-electric/20 text-electric border-electric/30 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Exclusive Content
            </Badge>
          </div>
        </div>

        <Card className="cyberpunk-card max-w-2xl mx-auto border-bitcoin/30">
          <CardHeader>
            <CardTitle className="flex items-center text-bitcoin text-xl">
              <Mail className="h-6 w-6 mr-3" />
              GET EXCLUSIVE BITCOIN INSIGHTS
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-electric">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Your first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="bg-dark-bg border-bitcoin/30 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-electric">Email Address *</Label>
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
              </div>

              <div>
                <Label className="text-electric mb-3 block">What interests you most? *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {interestOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border border-bitcoin/20 hover:border-bitcoin/50 transition-colors">
                      <Checkbox
                        id={option.id}
                        checked={formData.interests.includes(option.id)}
                        onCheckedChange={(checked) => handleInterestChange(option.id, checked as boolean)}
                        className="border-bitcoin/30 data-[state=checked]:bg-bitcoin data-[state=checked]:border-bitcoin"
                      />
                      <Label htmlFor={option.id} className="flex items-center text-gray-300 cursor-pointer flex-1">
                        {option.icon}
                        <span className="ml-2 text-sm">{option.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-electric mb-3 block">Email Frequency</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['weekly', 'monthly'] as const).map((freq) => (
                    <div key={freq} className="flex items-center space-x-2 p-3 rounded-lg border border-bitcoin/20 hover:border-bitcoin/50 transition-colors">
                      <Checkbox
                        id={freq}
                        checked={formData.frequency === freq}
                        onCheckedChange={() => setFormData(prev => ({ ...prev, frequency: freq }))}
                        className="border-bitcoin/30 data-[state=checked]:bg-bitcoin data-[state=checked]:border-bitcoin"
                      />
                      <Label htmlFor={freq} className="text-gray-300 cursor-pointer capitalize text-sm">
                        {freq}
                      </Label>
                    </div>
                  ))}
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
                    Joining the Revolution...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Join 1,000+ Bitcoin Enthusiasts
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-400 text-center">
                By subscribing, you agree to receive Bitcoin insights and market analysis. 
                Unsubscribe anytime with one click.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Value Proposition */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-bitcoin/10 to-electric/10 rounded-lg p-8 border border-bitcoin/30 max-w-4xl mx-auto">
            <h3 className="text-bitcoin font-bold text-xl mb-6">What Our Subscribers Get</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-bitcoin mx-auto mb-3" />
                <h4 className="text-electric font-semibold mb-2">Market Analysis</h4>
                <p className="text-gray-300 text-sm">
                  Expert price predictions and technical analysis
                </p>
              </div>
              <div className="text-center">
                <BookOpen className="h-8 w-8 text-bitcoin mx-auto mb-3" />
                <h4 className="text-electric font-semibold mb-2">Education</h4>
                <p className="text-gray-300 text-sm">
                  Learn Bitcoin fundamentals and sound money principles
                </p>
              </div>
              <div className="text-center">
                <Bell className="h-8 w-8 text-bitcoin mx-auto mb-3" />
                <h4 className="text-electric font-semibold mb-2">Breaking News</h4>
                <p className="text-gray-300 text-sm">
                  First to know about major Bitcoin developments
                </p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-bitcoin mx-auto mb-3" />
                <h4 className="text-electric font-semibold mb-2">Community</h4>
                <p className="text-gray-300 text-sm">
                  Connect with like-minded Bitcoin enthusiasts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}