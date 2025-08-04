
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, AlertCircle, Download, Bitcoin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  projectTitle: string;
  amount: string;
  currency: string;
  status: "pending" | "paid" | "failed";
  createdAt: Date;
  paidAt?: Date;
}

interface InvoiceHistoryProps {
  invoices: Invoice[];
  userType: "client" | "freelancer";
}

const InvoiceHistory = ({ invoices, userType }: InvoiceHistoryProps) => {
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your invoice history is being prepared for download.",
    });
  };

  const totalPaid = invoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  const totalPending = invoices
    .filter(inv => inv.status === "pending")
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              <span>Invoice History</span>
            </CardTitle>
            <CardDescription>
              {userType === "freelancer" ? "Track your payment requests" : "Manage your payments"}
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Paid</p>
                <p className="text-xl font-bold text-green-800">{totalPaid.toLocaleString()} sats</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-xl font-bold text-yellow-800">{totalPending.toLocaleString()} sats</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Invoices</p>
                <p className="text-xl font-bold text-blue-800">{invoices.length}</p>
              </div>
              <Bitcoin className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.projectTitle}</p>
                        <p className="text-sm text-gray-500">#{invoice.id.slice(-6)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.amount} {invoice.currency}</p>
                        {invoice.currency === "sats" && (
                          <p className="text-xs text-gray-500">
                            ≈ {(parseFloat(invoice.amount) / 100000000).toFixed(8)} BTC (1 BTC = 100,000,000 sats)
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{invoice.createdAt.toLocaleDateString()}</p>
                        {invoice.paidAt && (
                          <p className="text-xs text-gray-500">
                            Paid: {invoice.paidAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceHistory;
