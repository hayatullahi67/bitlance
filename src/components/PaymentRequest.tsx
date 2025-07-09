
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Bitcoin, Clock, AlertCircle, CheckCircle, Zap } from "lucide-react";
import LightningPaymentModal from "./LightningPaymentModal";
import OnChainPaymentModal from "./OnChainPaymentModal";

interface PaymentRequestProps {
  invoice: {
    id: string;
    projectTitle: string;
    amount: string;
    currency: string;
    note?: string;
    status: "pending" | "paid" | "failed" | "escrowed" | "delivered" | "accepted";
    createdAt: Date;
    bolt11?: string;
  };
  onPayment?: (invoiceId: string) => void;
}

const PaymentRequest = ({ invoice, onPayment }: PaymentRequestProps) => {
  const { toast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLightningModal, setShowLightningModal] = useState(false);
  const [showOnChainModal, setShowOnChainModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"lightning" | "onchain" | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": 
      case "escrowed": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-purple-100 text-purple-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "failed": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "escrowed": return "Funds in Escrow";
      case "delivered": return "Work Delivered";
      case "accepted": return "Completed";
      default: return status;
    }
  };

  const handlePayInvoice = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = (method: "lightning" | "onchain") => {
    setPaymentMethod(method);
    setShowPaymentModal(false);
    
    if (method === "lightning") {
      setShowLightningModal(true);
    } else {
      setShowOnChainModal(true);
    }
  };

  const handlePaymentComplete = (success: boolean) => {
    if (success) {
      onPayment?.(invoice.id);
      toast({
        title: "Payment Successful!",
        description: "Funds have been placed in escrow. Work can now begin.",
      });
    }
    setShowLightningModal(false);
    setShowOnChainModal(false);
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{invoice.projectTitle}</CardTitle>
              <CardDescription>
                Invoice #{invoice.id.slice(-6)} • {invoice.createdAt.toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(invoice.status)}>
              {getStatusIcon(invoice.status)}
              <span className="ml-1 capitalize">{getStatusText(invoice.status)}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {invoice.amount} {invoice.currency}
              </p>
              {invoice.currency === "BTC" && (
                <p className="text-sm text-gray-500">
                  ≈ {(parseFloat(invoice.amount) * 100000000).toLocaleString()} sats
                </p>
              )}
            </div>
            {invoice.status === "pending" && (
              <Button 
                onClick={handlePayInvoice}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Bitcoin className="h-4 w-4 mr-2" />
                Pay & Escrow
              </Button>
            )}
          </div>
          
          {invoice.note && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{invoice.note}</p>
            </div>
          )}

          {invoice.status === "escrowed" && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 font-medium">
                ✓ Payment secured in escrow. Work can now begin.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Selection Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              <span>Choose Payment Method</span>
            </DialogTitle>
            <DialogDescription>
              Select how you'd like to pay for this project
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
              <p className="text-xs text-orange-500 mt-1">
                Funds will be held in escrow until work is completed
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => handlePaymentMethodSelect("lightning")}
              >
                <Zap className="h-4 w-4 mr-2" />
                Pay with Lightning (Instant)
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handlePaymentMethodSelect("onchain")}
              >
                <Bitcoin className="h-4 w-4 mr-2" />
                Pay with Bitcoin (On-chain)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightning Payment Modal */}
      {showLightningModal && (
        <LightningPaymentModal
          isOpen={showLightningModal}
          onClose={() => setShowLightningModal(false)}
          invoice={{
            amount: invoice.amount,
            currency: invoice.currency,
            bolt11: invoice.bolt11 || `lnbc${Math.floor(parseFloat(invoice.amount) * 100000000)}n1...`
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* On-chain Payment Modal */}
      {showOnChainModal && (
        <OnChainPaymentModal
          isOpen={showOnChainModal}
          onClose={() => setShowOnChainModal(false)}
          invoice={{
            amount: invoice.amount,
            currency: invoice.currency
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};

export default PaymentRequest;
