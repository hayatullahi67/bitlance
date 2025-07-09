
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Zap, Bitcoin } from "lucide-react";

interface InvoiceRequestProps {
  projectTitle?: string;
  onInvoiceGenerated?: (invoice: any) => void;
}

const InvoiceRequest = ({ projectTitle = "", onInvoiceGenerated }: InvoiceRequestProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectTitle: projectTitle,
    amount: "",
    currency: "BTC",
    note: ""
  });

  const handleGenerateInvoice = () => {
    if (!formData.amount || !formData.projectTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const invoice = {
      id: Date.now().toString(),
      projectTitle: formData.projectTitle,
      amount: formData.amount,
      currency: formData.currency,
      note: formData.note,
      status: "pending",
      createdAt: new Date(),
      bolt11: `lnbc${Math.floor(parseFloat(formData.amount) * 100000000)}n1...` // mock bolt11
    };

    onInvoiceGenerated?.(invoice);
    
    toast({
      title: "Invoice Generated!",
      description: `Payment request for ${formData.amount} ${formData.currency} has been sent to the client.`,
    });

    setIsOpen(false);
    setFormData({ projectTitle: "", amount: "", currency: "BTC", note: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Zap className="h-4 w-4 mr-2" />
          Request Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            <span>Request Payment</span>
          </DialogTitle>
          <DialogDescription>
            Generate a Bitcoin invoice for your client
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-title">Project/Milestone Title</Label>
            <Input
              id="project-title"
              value={formData.projectTitle}
              onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
              placeholder="E-commerce website development"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.05"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="BTC">BTC</option>
                <option value="sats">Sats</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Payment for milestone 1 completion..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerateInvoice}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            Generate Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceRequest;
