import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FacebookShareProps {
  listingId: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export default function FacebookShare({ listingId, title, description, imageUrl }: FacebookShareProps) {
  const { toast } = useToast();

  const shareToFacebook = () => {
    const shareUrl = `${window.location.origin}/listing/${listingId}`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`${title} - ${description}`)}`;
    
    // Open Facebook share dialog
    window.open(
      facebookShareUrl,
      'facebook-share-dialog',
      'width=626,height=436,resizable=yes,scrollbars=yes'
    );

    toast({
      title: "Facebook Share",
      description: "Opening Facebook share dialog...",
    });
  };

  const shareViaNativeAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: `${window.location.origin}/listing/${listingId}`,
        });
        
        toast({
          title: "Shared Successfully",
          description: "Your listing has been shared!",
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log('Sharing cancelled or failed:', error);
      }
    } else {
      // Fallback to Facebook share
      shareToFacebook();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={shareViaNativeAPI}
      className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
}