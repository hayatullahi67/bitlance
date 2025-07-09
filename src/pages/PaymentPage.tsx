import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PaymentRequest from "@/components/PaymentRequest";
import EscrowManager from "@/components/EscrowManager";
import BTCPayIntegration from "@/components/BTCPayIntegration";

// Accept all header/layout props
const PaymentPage = (props) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"payment" | "escrow" | "btcpay">("payment");

  // Mock invoice data for demo
  const mockInvoice = {
    id: "inv_123456",
    projectTitle: "Build Modern E-commerce Platform",
    amount: "0.05",
    currency: "BTC",
    status: "pending" as const,
    createdAt: new Date(),
    note: "Payment for milestone 1: Frontend development completed",
    bolt11: "lnbc50000n1..."
  };

  // Mock escrow jobs for demo
  const mockEscrowJobs = [
    {
      id: "job_1",
      projectTitle: "E-commerce Platform Development",
      amount: "0.08",
      currency: "BTC",
      status: "delivered" as const,
      freelancerName: "Alice Developer",
      clientName: "TechCorp Inc.",
      createdAt: new Date(),
      deliveredAt: new Date(),
      platformFee: "0.004",
      freelancerAmount: "0.076"
    },
    {
      id: "job_2", 
      projectTitle: "Mobile App UI Design",
      amount: "0.03",
      currency: "BTC",
      status: "escrowed" as const,
      freelancerName: "Bob Designer",
      clientName: "StartupCo",
      createdAt: new Date(),
      platformFee: "0.0015",
      freelancerAmount: "0.0285"
    }
  ];

  const handlePayment = (invoiceId: string) => {
    console.log("Payment processed for invoice:", invoiceId);
  };

  const handleStatusUpdate = (jobId: string, newStatus: string) => {
    console.log("Job status updated:", jobId, newStatus);
  };

  const handleInvoiceCreated = (invoice: any) => {
    console.log("BTCPay invoice created:", invoice);
  };

  return (
    <Layout 
      {...props}
      title="Payment Center"
      onPostJob={() => navigate("../post-job")}
      onLogout={() => navigate("/login")}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>
              Manage payments, escrow, and BTCPay Server integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <Button
                variant={selectedTab === "payment" ? "default" : "outline"}
                onClick={() => setSelectedTab("payment")}
                className={selectedTab === "payment" ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                Payment Request
              </Button>
              <Button
                variant={selectedTab === "escrow" ? "default" : "outline"}
                onClick={() => setSelectedTab("escrow")}
                className={selectedTab === "escrow" ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                Escrow Manager
              </Button>
              <Button
                variant={selectedTab === "btcpay" ? "default" : "outline"}
                onClick={() => setSelectedTab("btcpay")}
                className={selectedTab === "btcpay" ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                BTCPay Integration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content based on selected tab */}
        {selectedTab === "payment" && (
          <PaymentRequest
            invoice={mockInvoice}
            onPayment={handlePayment}
          />
        )}

        {selectedTab === "escrow" && (
          <EscrowManager
            jobs={mockEscrowJobs}
            userType="client"
            onStatusUpdate={handleStatusUpdate}
          />
        )}

        {selectedTab === "btcpay" && (
          <BTCPayIntegration
            onInvoiceCreated={handleInvoiceCreated}
          />
        )}
      </div>
    </Layout>
  );
};

export default PaymentPage;
