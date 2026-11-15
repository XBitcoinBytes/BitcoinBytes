import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Copy, 
  Mail, 
  MessageCircle,
  Download,
  QrCode
} from 'lucide-react';

interface SocialSharingProps {
  title?: string;
  description?: string;
  url?: string;
  price?: string;
  className?: string;
}

const SocialSharing: React.FC<SocialSharingProps> = ({
  title = "Bitcoin Bytes - Real-Time Bitcoin Analytics",
  description = "Professional Bitcoin price tracking, market intelligence, and sound money education. Get accurate $107K+ Bitcoin prices across all exchanges.",
  url = typeof window !== 'undefined' ? window.location.href : '',
  price = "$107K+",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const { toast } = useToast();

  const shareData = {
    title,
    description,
    url,
    hashtags: ['Bitcoin', 'SoundMoney', 'Cryptocurrency', 'BitcoinBytes'].join(',')
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "Share link ready to paste",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  const shareToTwitter = () => {
    const text = `🚀 Just checked Bitcoin prices on Bitcoin Bytes! 

₿ Current: ${price}
📊 Real-time analytics across all exchanges
🎓 Learn about sound money principles

Check it out: ${url}

#Bitcoin #SoundMoney #Cryptocurrency`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${title} - ${description}`)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out Bitcoin Bytes - Bitcoin at ${price}!`);
    const body = encodeURIComponent(`Hi!

I wanted to share this amazing Bitcoin analytics platform with you:

${title}

Current Bitcoin Price: ${price}
${description}

Check it out: ${url}

Best regards!`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`🚀 Bitcoin Bytes - Professional Bitcoin Analytics

₿ Current Price: ${price}
📈 Real-time data across all exchanges
🎓 Learn about Bitcoin as sound money

${url}`);
    
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      // Using a QR code API service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      
      // Create a temporary link to download the QR code
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = 'bitcoin-bytes-qr.png';
      link.click();
      
      toast({
        title: "QR Code generated!",
        description: "QR code download started",
      });
    } catch (error) {
      toast({
        title: "QR generation failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className={`border-orange-500/50 text-orange-400 hover:bg-orange-500/10 transition-all ${className}`}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    );
  }

  return (
    <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm w-80">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Share2 className="h-4 w-4 text-orange-400" />
            Share Bitcoin Bytes
          </h3>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            ×
          </Button>
        </div>

        <div className="space-y-3">
          {/* Current Bitcoin Price Display */}
          <div className="text-center p-3 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-lg border border-orange-500/30">
            <div className="text-lg font-bold text-white">Bitcoin Price</div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
              {price}
            </div>
            <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10 mt-1">
              Live Data
            </Badge>
          </div>

          {/* Social Media Platforms */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={shareToTwitter}
              variant="outline"
              size="sm"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            
            <Button
              onClick={shareToFacebook}
              variant="outline"
              size="sm"
              className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            
            <Button
              onClick={shareToLinkedIn}
              variant="outline"
              size="sm"
              className="border-blue-700/50 text-blue-300 hover:bg-blue-700/10"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
            
            <Button
              onClick={shareViaWhatsApp}
              variant="outline"
              size="sm"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
            <Button
              onClick={shareViaEmail}
              variant="outline"
              size="sm"
              className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            
            <Button
              onClick={generateQRCode}
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              disabled={isGeneratingQR}
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
          </div>

          {/* Copy Link */}
          <Button
            onClick={() => copyToClipboard(url)}
            variant="outline"
            className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Share Bitcoin education and sound money principles
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialSharing;