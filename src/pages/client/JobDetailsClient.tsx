import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ClientHeader from "@/components/layout/ClientHeader";
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  MapPin, 
  Tag, 
  Users, 
  Eye, 
  Calendar,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  MessageSquare,
  Star,
  ExternalLink
} from "lucide-react";
import { handleLogout } from "@/lib/authUtils";
import { getJob, updateJobStatus, deleteJob, JobData, updateProposalStatus, ProposalData } from "@/lib/jobManagement";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseClient";
import { createNotification } from "@/lib/notifications";

const JobDetailsClient = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProposalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [freelancerProfiles, setFreelancerProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  useEffect(() => {
    // Fetch freelancer profiles for all proposals
    const fetchFreelancerProfiles = async () => {
      if (!proposals || proposals.length === 0) return;
      const uniqueIds = Array.from(new Set(proposals.map(p => p.freelancerId)));
      const profiles: Record<string, any> = {};
      await Promise.all(uniqueIds.map(async (id) => {
        try {
          const docSnap = await getDoc(doc(db, "freelancers", id));
          if (docSnap.exists()) {
            profiles[id] = docSnap.data();
          }
        } catch (e) {
          // ignore
        }
      }));
      setFreelancerProfiles(profiles);
    };
    fetchFreelancerProfiles();
  }, [proposals]);

  const loadJob = async () => {
    if (!jobId) return;
    
      setLoading(true);
    try {
      const jobData = await getJob(jobId);
      if (jobData) {
        // Fix any proposals that might be missing IDs (for backward compatibility)
        let proposals = jobData.proposals || [];
        let needsUpdate = false;
        
        proposals = proposals.map((proposal: any, index: number) => {
          if (!proposal.id) {
            console.log(`Fixing proposal without ID at index ${index}`);
            needsUpdate = true;
            return {
              ...proposal,
              id: `proposal_fixed_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
            };
          }
          return proposal;
        });
        
        // Update the job in Firebase if we fixed any proposals
        if (needsUpdate) {
          const jobRef = doc(db, "jobs", jobId);
          await updateDoc(jobRef, { proposals });
          jobData.proposals = proposals;
        }
        
        setJob(jobData);
        // Load proposals from the job data since they're embedded
        setProposals(proposals);
      } else {
        toast({
          title: "Job not found",
          description: "The job you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/client-dashboard");
      }
    } catch (error) {
      console.error("Error loading job:", error);
      toast({
        title: "Error",
        description: "Failed to load job details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async (jobId: string) => {
    setLoadingProposals(true);
    try {
      // Since proposals are now embedded in the job, we get them from the job data
      if (job) {
        let proposals = job.proposals || [];
        
        // Fix any proposals that might be missing IDs (for backward compatibility)
        proposals = proposals.map((proposal: any, index: number) => {
          if (!proposal.id) {
            console.log(`Fixing proposal without ID at index ${index}`);
            return {
              ...proposal,
              id: `proposal_fixed_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
            };
          }
          return proposal;
        });
        
        setProposals(proposals);
      }
    } catch (error) {
      console.error("Error loading proposals:", error);
      toast({
        title: "Error",
        description: "Failed to load proposals.",
        variant: "destructive",
      });
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleStatusUpdate = async (newStatus: JobData['status']) => {
    if (!jobId || !job) return;

    setUpdating(true);
    try {
      await updateJobStatus(jobId, newStatus);
      setJob({ ...job, status: newStatus });
      toast({
        title: "Status updated",
        description: `Job status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobId) return;

    setUpdating(true);
    try {
      await deleteJob(jobId);
      toast({
        title: "Job deleted",
        description: "The job has been deleted successfully.",
      });
      navigate("/client-dashboard");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
      setShowDeleteDialog(false);
    }
  };

  // Helper to count accepted proposals
  const acceptedProposalsCount = proposals.filter(p => p.status === 'accepted').length;
  const canAcceptMore = job && acceptedProposalsCount < job.numberOfFreelancers;

  const handleProposalAction = async (proposalId: string, action: 'accept' | 'reject') => {
    if (!jobId) return;
    // Prevent accepting more than allowed
    if (action === 'accept' && job && acceptedProposalsCount >= job.numberOfFreelancers) {
      toast({
        title: 'Limit reached',
        description: `You have already accepted the maximum number of freelancers for this job.`,
        variant: 'destructive',
      });
      return;
    }
    
    setUpdating(true);
    try {
      const status = action === 'accept' ? 'accepted' : 'rejected';
      console.log(`Processing ${action} for proposal ${proposalId}`);
      
      // Find the proposal and update its status and history
      const jobRef = doc(db, "jobs", jobId);
      const jobSnap = await getDoc(jobRef);
      let proposals = [];
      if (jobSnap.exists() && Array.isArray(jobSnap.data().proposals)) {
        proposals = jobSnap.data().proposals;
      }
      
      console.log(`Found ${proposals.length} proposals, looking for ID: ${proposalId}`);
      console.log('Proposal IDs:', proposals.map(p => p.id));
      
      const proposalFound = proposals.find(p => p.id === proposalId);
      if (!proposalFound) {
        console.error(`Proposal with ID ${proposalId} not found!`);
        toast({
          title: "Error",
          description: `Proposal not found. This might be due to a missing ID.`,
          variant: "destructive",
        });
        return;
      }
      
      proposals = proposals.map((p: any) => {
        if (p.id === proposalId) {
          console.log(`Updating proposal ${p.id} from ${p.status} to ${status}`);
          return {
            ...p,
            status,
            history: Array.isArray(p.history) ? [...p.history, { status, at: new Date().toISOString() }] : [{ status, at: new Date().toISOString() }]
          };
        }
        return p;
      });
      
      await updateDoc(jobRef, { proposals });
      await loadJob();
      
      // Create notification for freelancer
      const currentUser = auth.currentUser;
      if (currentUser && proposalFound) {
        try {
          // Get client and freelancer data for notification
          const clientDoc = await getDoc(doc(db, "users", currentUser.uid));
          const freelancerDoc = await getDoc(doc(db, "users", proposalFound.freelancerId));
          
          const clientData = clientDoc.exists() ? clientDoc.data() : { firstName: "Client", lastName: "" };
          const freelancerData = freelancerDoc.exists() ? freelancerDoc.data() : { firstName: "Freelancer", lastName: "" };

          console.log("Creating proposal action notification:", {
            action,
            senderUuid: currentUser.uid,
            receiverUuid: proposalFound.freelancerId,
            senderName: `${clientData.firstName} ${clientData.lastName}`,
            receiverName: `${freelancerData.firstName} ${freelancerData.lastName}`,
            message: action === 'accept' 
              ? `Your proposal for "${job?.title}" was accepted!` 
              : `Your proposal for "${job?.title}" was not selected.`
          });

          await createNotification({
            senderUuid: currentUser.uid,
            receiverUuid: proposalFound.freelancerId,
            senderName: `${clientData.firstName} ${clientData.lastName}`,
            receiverName: `${freelancerData.firstName} ${freelancerData.lastName}`,
            type: action === 'accept' ? "proposal_accepted" : "proposal_rejected",
            message: action === 'accept' 
              ? `Your proposal for "${job?.title}" was accepted!` 
              : `Your proposal for "${job?.title}" was not selected.`,
            link: action === 'accept' ? `/freelancer/job/${jobId}` : "/freelancer-dashboard",
          });
          
          console.log("Proposal action notification created successfully");
        } catch (error) {
          console.error("Error creating notification:", error);
        }
      }
      
      toast({
        title: `Proposal ${action}ed`,
        description: `The proposal has been ${action}ed successfully.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing proposal:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} proposal.`,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-purple-100 text-purple-800";
      case "expired": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <CheckCircle className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "expired": return <AlertCircle className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatBudget = (budget: JobData['budget']) => {
    if (budget.type === "fixed") {
      return `${budget.min} - ${budget.max} sats`;
    } else {
              return `${budget.hourly} sats/hour`;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (loading) {
    return (
      <>
      <ClientHeader />
      <div className="w-full flex justify-center py-8">
        <div className="w-4/5 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading job details...</p>
            </div>
          </div>
        </div>
      </div> </>
    );
  }

  if (!job) {
    return (<>
      <ClientHeader />
      <div className="w-full flex justify-center py-8">
        <div className="w-4/5 max-w-7xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/client-dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div></>
    );
  }

  return (
    <>
      <ClientHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/client-dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Posted {formatDate(job.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {job.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {proposals.length} proposals
                  </span>
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 mt-4 sm:mt-0">
                <Badge className={`${getStatusColor(job.status)} flex items-center gap-1`}>
                  {getStatusIcon(job.status)}
                  {job.status.replace('_', ' ')}
                </Badge>
                <Dialog>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Job Actions</DialogTitle>
                      <DialogDescription>
                        Manage your job posting
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      {job.status === "open" && (
                        <>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => navigate(`/edit-job/${jobId}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job
                          </Button>
                          
                        </>
                      )}
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Job
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Main Content Responsive Grid */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="proposals" className="text-xs sm:text-sm">Proposals ({proposals.length})</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
            </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Job Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Required Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Budget:</span>
                      <span>{formatBudget(job.budget)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Category:</span>
                      <span>{job.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Duration:</span>
                      <span>{job.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Location:</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Experience:</span>
                      <span>{job.experience}</span>
                    </div>
                    {job.numberOfFreelancers && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">Hiring:</span>
                        <span>{job.numberOfFreelancers} freelancer{job.numberOfFreelancers > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
              </div>
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:p-0">
                {selectedProposal && (
                  <div className="flex flex-col max-h-[80vh] w-full">
                    <DialogHeader className="p-6 border-b">
                      <DialogTitle className="text-2xl font-bold mb-1">Proposal Details</DialogTitle>
                      <DialogDescription className="text-base text-gray-500">
                        Full details for proposal from <span className="font-semibold text-orange-600">{selectedProposal.freelancerName}</span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Status</div>
                          <Badge className={`text-base px-3 py-1 rounded-full ${selectedProposal.status === 'accepted' ? 'bg-green-100 text-green-800' : selectedProposal.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedProposal.status}</Badge>
                        </div>
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Proposal Amount</div>
                          <span className="font-medium text-orange-600 text-lg">{selectedProposal.budget ? `${selectedProposal.budget} sats` : 'N/A'}</span>
                        </div>
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Submitted</div>
                          <span className="font-medium text-gray-900">{selectedProposal.createdAt && selectedProposal.createdAt.toDate ? selectedProposal.createdAt.toDate().toLocaleString() : '-'}</span>
                        </div>
                        {selectedProposal.freelancerLocation && (
                          <div>
                            <div className="mb-2 text-sm text-gray-500">Location</div>
                            <span className="font-medium text-gray-900">{selectedProposal.freelancerLocation}</span>
                          </div>
                        )}
                        {selectedProposal.freelancerRating && (
                          <div>
                            <div className="mb-2 text-sm text-gray-500">Rating</div>
                            <span className="font-medium text-yellow-600 flex items-center"><Star className="h-4 w-4 mr-1" />{selectedProposal.freelancerRating}</span>
                          </div>
                        )}
                      </div>
                      <hr className="my-4 border-gray-200" />
                      <div>
                        <div className="mb-2 text-sm text-gray-500">Cover Letter</div>
                        <div className="whitespace-pre-line bg-gray-50 rounded p-4 border text-gray-800 text-base shadow-sm max-h-60 overflow-y-auto">
                          {selectedProposal.message}
                        </div>
                      </div>
                      {selectedProposal.portfolio && selectedProposal.portfolio.length > 0 && (
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Portfolio Links</div>
                          <ul className="list-disc ml-6 mt-1">
                            {selectedProposal.portfolio.map((link: string, idx: number) => (
                              <li key={idx}><a href={link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{link}</a></li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedProposal.file && (
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Attachment</div>
                          <a href={selectedProposal.file.data} download={selectedProposal.file.name} className="underline text-blue-600">{selectedProposal.file.name}</a>
                        </div>
                      )}
                      {selectedProposal.history && Array.isArray(selectedProposal.history) && selectedProposal.history.length > 0 && (
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Status History</div>
                          <ul className="list-disc ml-6 mt-1 text-xs text-gray-700">
                            {selectedProposal.history.map((h, idx) => (
                              <li key={idx}>{h.status} at {new Date(h.at).toLocaleString()}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* {Array.isArray(selectedProposal.skills) && selectedProposal.skills.length > 0 && (
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedProposal.skills.map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs px-2 py-1">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )} */}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 p-4 border-t bg-gray-50">
                      {selectedProposal.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { handleProposalAction(selectedProposal.id!, 'accept'); setModalOpen(false); }}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Accept
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { handleProposalAction(selectedProposal.id!, 'reject'); setModalOpen(false); }}>
                            <AlertCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => navigate(`/freelancer/public-profile/${selectedProposal.freelancerId}`)}>
                        <ExternalLink className="h-4 w-4 mr-1" /> View Profile
                      </Button>
                      <DialogClose asChild>
                        <Button size="sm" variant="ghost">Close</Button>
                      </DialogClose>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            {loadingProposals ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading proposals...</p>
                </CardContent>
              </Card>
            ) : proposals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                  <p className="text-gray-600">When freelancers submit proposals, they'll appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <Card key={proposal.id} className="hover:shadow-md transition-shadow cursor-pointer max-h-56 overflow-hidden" onClick={() => { setSelectedProposal(proposal); setModalOpen(true); }}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={freelancerProfiles[proposal.freelancerId]?.avatar || proposal.freelancerAvatar} />
                            <AvatarFallback>
                              {freelancerProfiles[proposal.freelancerId]?.firstName || proposal.freelancerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {freelancerProfiles[proposal.freelancerId]
                                ? `${freelancerProfiles[proposal.freelancerId].lastName || ''} ${freelancerProfiles[proposal.freelancerId].firstName || ''}`.trim()
                                : proposal.freelancerName}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {proposal.freelancerRating && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  {proposal.freelancerRating}
                                </span>
                              )}
                              {proposal.freelancerLocation && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {proposal.freelancerLocation}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-orange-600">
                            {proposal.budget ?  `${proposal.budget} sats` : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {proposal.createdAt && proposal.createdAt.toDate
                              ? formatDistanceToNow(proposal.createdAt.toDate(), { addSuffix: true })
                              : 'N/A'}
                          </div>
                          <Badge className={`mt-2 ${
                            proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {proposal.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 truncate" style={{ maxHeight: '3.5em', overflow: 'hidden' }}>{proposal.message}</p>
                      <div className="flex gap-2">
                        {proposal.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={e => { e.stopPropagation(); handleProposalAction(proposal.id!, 'accept'); }}
                              disabled={updating || !canAcceptMore}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            {!canAcceptMore && (
                              <span className="text-xs text-red-500 ml-2">Limit reached</span>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="flex-1"
                              onClick={e => { e.stopPropagation(); handleProposalAction(proposal.id!, 'reject'); }}
                              disabled={updating}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" className="flex-1" onClick={e => { e.stopPropagation(); navigate(`/freelancer/public-profile/${proposal.freelancerId}`); }}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Status</CardTitle>
                <CardDescription>
                  Update the status of your job posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Current Status:</span>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {job.status === "open" && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Change status to:</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusUpdate("in_progress")}
                        disabled={updating}
                      >
                        In Progress
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusUpdate("completed")}
                        disabled={updating}
                      >
                        Completed
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusUpdate("cancelled")}
                        disabled={updating}
                      >
                        Cancelled
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Job</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this job? This action cannot be undone and will also delete all associated proposals.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteJob}
                disabled={updating}
              >
                {updating ? "Deleting..." : "Delete Job"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        
      </div>
    </>
  );
};

export default JobDetailsClient; 