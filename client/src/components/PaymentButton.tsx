import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PaymentButtonProps {
  listingId: string;
  amount: number;
  title: string;
}

export default function PaymentButton({ listingId, amount, title }: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Create payment intent
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount,
        listingId,
        description: `Payment for ${title}`,
      });
      
      const { clientSecret } = await response.json();
      
      // For now, simulate payment success
      // In real implementation, this would redirect to Stripe checkout
      setTimeout(() => {
        toast({
          title: "Payment Successful!",
          description: "Your purchase has been completed.",
        });
        setIsProcessing(false);
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please check your payment details and try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment}
      disabled={isProcessing}
      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Buy Now - ${amount}
        </>
      )}
    </Button>
  );
}