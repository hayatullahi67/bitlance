
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bitcoin, Copy, Clock, AlertTriangle } from "lucide-react";

interface OnChainPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    amount: string;
    currency: string;
  };
  onPaymentComplete?: (success: boolean) => void;
}

const OnChainPaymentModal = ({ isOpen, onClose, invoice, onPaymentComplete }: OnChainPaymentModalProps) => {
  const { toast } = useToast();
  const [confirmationsSent, setConfirmationsSent] = useState(false);
  
  // Mock Bitcoin address
  const bitcoinAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

  const copyAddress = () => {
    navigator.clipboard.writeText(bitcoinAddress);
    toast({
      title: "Address Copied!",
      description: "Bitcoin address copied to clipboard",
    });
  };

  const confirmPayment = () => {
    setConfirmationsSent(true);
    toast({
      title: "Payment Confirmation Sent",
      description: "We'll notify you once the transaction is confirmed on the blockchain.",
    });
    
    // Simulate confirmation after some time
    setTimeout(() => {
      onPaymentComplete?.(true);
      onClose();
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            <span>Bitcoin On-Chain Payment</span>
          </DialogTitle>
          <DialogDescription>
            Send Bitcoin to the address below
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg text-center">
            <p className="text-lg font-semibold text-orange-800">
              {invoice.amount} {invoice.currency}
            </p>
            <p className="text-sm text-orange-600">
              ≈ 2,850,000 sats
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Bitcoin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">QR Code</p>
              <p className="text-xs text-gray-400">Bitcoin Address</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bitcoin Address:</label>
              <div className="flex space-x-2">
                <Input 
                  value={bitcoinAddress}
                  readOnly
                  className="text-xs"
                />
                <Button 
                  onClick={copyAddress}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Important Notes:</p>
                  <ul className="text-yellow-700 mt-1 space-y-1 text-xs">
                    <li>• Send exactly {invoice.amount} {invoice.currency}</li>
                    <li>• Confirmations may take 10-60 minutes</li>
                    <li>• Network fees apply</li>
                  </ul>
                </div>
              </div>
            </div>

            {!confirmationsSent ? (
              <Button 
                onClick={confirmPayment}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                I've Sent the Payment
              </Button>
            ) : (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-800">
                  Waiting for Blockchain Confirmation
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This may take 10-60 minutes
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnChainPaymentModal;
