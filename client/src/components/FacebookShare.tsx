import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Share2, Mail, MessageCircle } from "lucide-react";

interface FacebookShareProps {
  listingId: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export default function FacebookShare({ listingId, title, description, imageUrl }: FacebookShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const currentUrl = `${window.location.origin}/listing/${listingId}`;
  
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(`${title} - ${description}`)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    
    toast({
      title: "Facebook share opened",
      description: "Complete the sharing process in the new window.",
    });
  };

  const shareToWhatsApp = () => {
    const message = `Check out this item: ${title} - ${description}\n\n${currentUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp share opened",
      description: "Share with your contacts via WhatsApp.",
    });
  };

  const shareToEmail = () => {
    const subject = `Check out: ${title}`;
    const body = `Hi!\n\nI thought you might be interested in this item:\n\n${title}\n${description}\n\nView it here: ${currentUrl}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
    
    toast({
      title: "Email client opened",
      description: "Share via your default email app.",
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Link copied!",
        description: "Share this link anywhere you want.",
      });
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link copied!",
        description: "Share this link anywhere you want.",
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h3 className="font-semibold text-gray-900">Share this listing</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={shareToFacebook}
          variant="outline"
          className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </Button>
        
        <Button 
          onClick={shareToWhatsApp}
          variant="outline"
          className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>
        
        <Button 
          onClick={shareToEmail}
          variant="outline"
          className="flex items-center gap-2 text-gray-600 border-gray-200 hover:bg-gray-50"
        >
          <Mail className="w-4 h-4" />
          Email
        </Button>
        
        <Button 
          onClick={copyLink}
          variant="outline"
          className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          <Share2 className="w-4 h-4" />
          Copy Link
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
        <strong>Direct link:</strong> 
        <br />
        <code className="text-xs break-all">{currentUrl}</code>
      </div>
    </div>
  );
}