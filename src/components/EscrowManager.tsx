
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, AlertTriangle, Download, Bitcoin, Zap } from "lucide-react";

interface EscrowJob {
  id: string;
  projectTitle: string;
  amount: string;
  currency: string;
  status: "escrowed" | "delivered" | "accepted" | "dispute";
  freelancerName: string;
  clientName: string;
  createdAt: Date;
  deliveredAt?: Date;
  platformFee: string;
  freelancerAmount: string;
}

interface EscrowManagerProps {
  jobs: EscrowJob[];
  userType: "client" | "freelancer" | "admin";
  onStatusUpdate?: (jobId: string, newStatus: string) => void;
}

const EscrowManager = ({ jobs, userType, onStatusUpdate }: EscrowManagerProps) => {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<EscrowJob | null>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "escrowed": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-purple-100 text-purple-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "dispute": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAcceptWork = (job: EscrowJob) => {
    setSelectedJob(job);
    setShowReleaseModal(true);
  };

  const handleReleaseFunds = async () => {
    if (!selectedJob) return;

    try {
      // Simulate fund release process
      toast({
        title: "Releasing Funds...",
        description: "Processing payment to freelancer via NWC",
      });

      // Simulate NWC payout
      setTimeout(() => {
        onStatusUpdate?.(selectedJob.id, "accepted");
        toast({
          title: "Funds Released!",
          description: `${selectedJob.freelancerAmount} sats sent to freelancer. ${selectedJob.platformFee} sats platform fee retained.`,
        });
        setShowReleaseModal(false);
        setSelectedJob(null);
      }, 2000);

    } catch (error) {
      toast({
        title: "Release Failed",
        description: "Could not release funds. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkDelivered = (jobId: string) => {
    onStatusUpdate?.(jobId, "delivered");
    toast({
      title: "Work Submitted",
      description: "Client will be notified to review and accept the work.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bitcoin className="h-5 w-5 text-orange-500" />
          <span>Escrow Management</span>
        </CardTitle>
        <CardDescription>
          {userType === "client" && "Review and accept delivered work"}
          {userType === "freelancer" && "Track your escrowed projects"}
          {userType === "admin" && "Manage platform escrow"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No escrowed jobs found
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{job.projectTitle}</h3>
                    <p className="text-sm text-gray-500">
                      {userType === "client" ? `Freelancer: ${job.freelancerName}` : `Client: ${job.clientName}`}
                    </p>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status === "escrowed" && <Clock className="h-3 w-3 mr-1" />}
                    {job.status === "delivered" && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {job.status === "accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                    <span className="capitalize">{job.status}</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold">{job.amount} {job.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Freelancer Gets</p>
                    <p className="font-semibold text-green-600">{job.freelancerAmount} {job.currency}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {userType === "freelancer" && job.status === "escrowed" && (
                    <Button 
                      size="sm"
                      onClick={() => handleMarkDelivered(job.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Mark as Delivered
                    </Button>
                  )}
                  
                  {userType === "client" && job.status === "delivered" && (
                    <Button 
                      size="sm"
                      onClick={() => handleAcceptWork(job)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept & Release Funds
                    </Button>
                  )}

                  {(userType === "admin" || (userType === "client" && job.status === "delivered")) && (
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Fund Release Confirmation Modal */}
      <Dialog open={showReleaseModal} onOpenChange={setShowReleaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <span>Release Funds</span>
            </DialogTitle>
            <DialogDescription>
              Confirm release of escrowed funds to freelancer
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedJob.projectTitle}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Escrowed:</span>
                    <span className="font-medium">{selectedJob.amount} {selectedJob.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To Freelancer (95%):</span>
                    <span className="font-medium text-green-600">{selectedJob.freelancerAmount} {selectedJob.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (5%):</span>
                    <span className="font-medium text-orange-600">{selectedJob.platformFee} {selectedJob.currency}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Funds will be sent to the freelancer's wallet via NWC (Nostr Wallet Connect). This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleReleaseFunds}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Release Funds
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowReleaseModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EscrowManager;
