
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bitcoin, Zap, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";

interface BTCPayInvoice {
  id: string;
  amount: string;
  currency: string;
  status: "new" | "processing" | "settled" | "expired" | "invalid";
  checkoutLink: string;
  paymentMethods: Array<{
    type: "lightning" | "onchain";
    destination: string;
    amount: string;
  }>;
  createdAt: Date;
  expiresAt: Date;
}

interface BTCPayIntegrationProps {
  onInvoiceCreated?: (invoice: BTCPayInvoice) => void;
  onPaymentConfirmed?: (invoiceId: string) => void;
}

const BTCPayIntegration = ({ onInvoiceCreated, onPaymentConfirmed }: BTCPayIntegrationProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    amount: "",
    description: "",
    notificationUrl: ""
  });

  // Mock BTCPay Server configuration
  const btcpayConfig = {
    serverUrl: "https://btcpay.bitlance.com",
    storeId: "your-store-id",
    apiKey: "your-api-key" // In real app, this would be in environment variables
  };

  const createBTCPayInvoice = async () => {
    if (!invoiceData.amount || !invoiceData.description) {
      toast({
        title: "Invalid Input",
        description: "Please provide amount and description",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Simulate BTCPay Server API call
      const mockInvoice: BTCPayInvoice = {
        id: `btcpay_${Date.now()}`,
        amount: invoiceData.amount,
        currency: "BTC",
        status: "new",
        checkoutLink: `${btcpayConfig.serverUrl}/invoice/${Date.now()}`,
        paymentMethods: [
          {
            type: "lightning",
            destination: `lnbc${Math.floor(parseFloat(invoiceData.amount) * 100000000)}n1...`,
            amount: invoiceData.amount
          },
          {
            type: "onchain",
            destination: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            amount: invoiceData.amount
          }
        ],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      };

      onInvoiceCreated?.(mockInvoice);
      
      toast({
        title: "Invoice Created!",
        description: "BTCPay Server invoice generated successfully",
      });

      // Simulate payment confirmation after some time
      setTimeout(() => {
        onPaymentConfirmed?.(mockInvoice.id);
        toast({
          title: "Payment Confirmed!",
          description: "Funds received and held in escrow",
        });
      }, 5000);

    } catch (error) {
      toast({
        title: "Invoice Creation Failed",
        description: "Could not create BTCPay Server invoice",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "settled": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "expired": 
      case "invalid": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "settled": return <CheckCircle className="h-4 w-4" />;
      case "processing": return <Clock className="h-4 w-4" />;
      case "expired":
      case "invalid": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bitcoin className="h-5 w-5 text-orange-500" />
          <span>BTCPay Server Integration</span>
        </CardTitle>
        <CardDescription>
          Create secure Bitcoin invoices with escrow functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (BTC)</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              value={invoiceData.amount}
              onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
              placeholder="0.05"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={invoiceData.description}
              onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
              placeholder="E-commerce website development"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook">Webhook URL (Optional)</Label>
            <Input
              id="webhook"
              value={invoiceData.notificationUrl}
              onChange={(e) => setInvoiceData({ ...invoiceData, notificationUrl: e.target.value })}
              placeholder="https://your-app.com/webhook/btcpay"
            />
          </div>
        </div>

        <Button 
          onClick={createBTCPayInvoice}
          disabled={isCreating}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isCreating ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Creating Invoice...
            </>
          ) : (
            <>
              <Bitcoin className="h-4 w-4 mr-2" />
              Create BTCPay Invoice
            </>
          )}
        </Button>

        {/* BTCPay Server Configuration Display */}
        <div className="p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium text-sm mb-2">BTCPay Server Configuration</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>Server:</strong> {btcpayConfig.serverUrl}</p>
            <p><strong>Store ID:</strong> {btcpayConfig.storeId}</p>
            <p><strong>Status:</strong> <Badge variant="outline" className="text-xs">Connected</Badge></p>
          </div>
        </div>

        {/* Mock Payment Flow Steps */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-sm mb-2 text-blue-800">Payment Flow</h4>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Client pays 100% to BTCPay Server invoice</li>
            <li>2. Funds held in your controlled wallet (escrow)</li>
            <li>3. Work delivered & accepted by client</li>
            <li>4. Platform releases 95% to freelancer via NWC</li>
            <li>5. Platform retains 5% as service fee</li>
          </ol>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.open(btcpayConfig.serverUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open BTCPay Dashboard
        </Button>
      </CardContent>
    </Card>
  );
};

export default BTCPayIntegration;
