
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Zap, Copy, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface LightningPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    amount: string;
    currency: string;
    bolt11: string;
  };
  onPaymentComplete?: (success: boolean) => void;
}

const LightningPaymentModal = ({ isOpen, onClose, invoice, onPaymentComplete }: LightningPaymentModalProps) => {
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<"waiting" | "success" | "failed">("waiting");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (isOpen && paymentStatus === "waiting") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPaymentStatus("failed");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, paymentStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyInvoice = () => {
    navigator.clipboard.writeText(invoice.bolt11);
    toast({
      title: "Copied!",
      description: "Lightning invoice copied to clipboard",
    });
  };

  const openInWallet = () => {
    const nwcUrl = `lightning:${invoice.bolt11}`;
    window.open(nwcUrl, '_blank');
    
    toast({
      title: "Opening Wallet",
      description: "Complete the payment in your Lightning wallet",
    });
  };

  const simulatePayment = () => {
    // Simulate payment for demo
    setTimeout(() => {
      setPaymentStatus("success");
      onPaymentComplete?.(true);
    }, 2000);
  };

  if (paymentStatus === "success") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Payment Successful!</span>
            </DialogTitle>
            <DialogDescription>
              Your Lightning payment has been confirmed
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="p-6 bg-green-50 rounded-lg">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-green-800">
                Payment Confirmed
              </p>
              <p className="text-sm text-green-600 mt-2">
                Transaction ID: abc123...def456
              </p>
            </div>
            
            <Button 
              onClick={onClose}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Payment Failed</span>
            </DialogTitle>
            <DialogDescription>
              The payment could not be completed
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="p-6 bg-red-50 rounded-lg">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-red-800">
                Payment Timeout
              </p>
              <p className="text-sm text-red-600 mt-2">
                The invoice has expired or payment failed
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => setPaymentStatus("waiting")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Retry Payment
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Use On-chain BTC
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span>Lightning Payment</span>
          </DialogTitle>
          <DialogDescription>
            Scan QR code or open in your Lightning wallet
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-lg font-semibold text-orange-800">
              {invoice.amount} {invoice.currency}
            </p>
            <p className="text-sm text-orange-600">
              ≈ $2,850 USD
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">QR Code</p>
              <p className="text-xs text-gray-400">Lightning Invoice</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input 
                value={invoice.bolt11}
                readOnly
                className="text-xs"
              />
              <Button 
                onClick={copyInvoice}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={openInWallet}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Open in Wallet
            </Button>

            {/* Demo button for testing */}
            <Button 
              onClick={simulatePayment}
              variant="outline"
              className="w-full text-xs"
            >
              Simulate Payment (Demo)
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Expires in {formatTime(timeLeft)}</span>
          </div>

          <div className="flex items-center justify-center space-x-2 text-yellow-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <span className="text-sm">Waiting for payment...</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LightningPaymentModal;
