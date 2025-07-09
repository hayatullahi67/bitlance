import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
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
import { getJob, updateJobStatus, deleteJob, extendJobExpiration, JobData, updateProposalStatus, ProposalData } from "@/lib/jobManagement";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const JobDetailsClient = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    if (!jobId) return;
    
      setLoading(true);
    try {
      const jobData = await getJob(jobId);
      if (jobData) {
        setJob(jobData);
        // Load proposals from the job data since they're embedded
        setProposals(jobData.proposals || []);
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
        setProposals(job.proposals || []);
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

  const handleExtendJob = async () => {
    if (!jobId) return;

    setUpdating(true);
    try {
      await extendJobExpiration(jobId);
      await loadJob(); // Reload job to get updated expiration
      toast({
        title: "Job extended",
        description: "Job expiration has been extended by 30 days.",
      });
    } catch (error) {
      console.error("Error extending job:", error);
      toast({
        title: "Error",
        description: "Failed to extend job expiration.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
      setShowExtendDialog(false);
    }
  };

  const handleProposalAction = async (proposalId: string, action: 'accept' | 'reject') => {
    if (!jobId) return;
    
    setUpdating(true);
    try {
      const status = action === 'accept' ? 'accepted' : 'rejected';
      await updateProposalStatus(jobId, proposalId, status);
      
      // Reload job to get updated proposals and status
      await loadJob();
      
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
      return `${budget.min} - ${budget.max} BTC`;
    } else {
      return `${budget.hourly} BTC/hour`;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (loading) {
    return (
      <Layout 
        userType="client"
        userName="Loading..."
        userAvatar=""
        title="Job Details"
        onPostJob={() => navigate("/post-job")}
        onLogout={handleLogout}
      >
        <div className="w-full flex justify-center py-8">
          <div className="w-4/5 max-w-7xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading job details...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout 
        userType="client"
        userName="Error"
        userAvatar=""
        title="Job Not Found"
        onPostJob={() => navigate("/post-job")}
        onLogout={handleLogout}
      >
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      userType="client"
      userName="Client"
      userAvatar=""
      title={`Job: ${job.title}`}
      onPostJob={() => navigate("/post-job")}
      onLogout={handleLogout}
    >
      <div className="w-full flex justify-center py-8">
        <div className="w-4/5 max-w-7xl">
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
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
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
            
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(job.status)} flex items-center gap-1`}>
                {getStatusIcon(job.status)}
                {job.status.replace('_', ' ')}
              </Badge>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
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
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => setShowExtendDialog(true)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Extend Expiration
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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

              {/* Job Info Sidebar */}
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
                  </CardContent>
                </Card>

                {job.expiresAt && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Expiration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">
                        <p>Expires {formatDate(job.expiresAt)}</p>
                        {job.status === "open" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={() => setShowExtendDialog(true)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Extend
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
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
                  <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={proposal.freelancerAvatar} />
                            <AvatarFallback>
                              {proposal.freelancerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{proposal.freelancerName}</CardTitle>
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
                            {proposal.budget
                              ? `Freelancer's  ${proposal.budget} BTC`
                              : 'N/A'}
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
                      <p className="text-gray-700 mb-4">{proposal.message}</p>
                      <div className="flex gap-2">
                        {proposal.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleProposalAction(proposal.id!, 'accept')}
                              disabled={updating}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="flex-1"
                              onClick={() => handleProposalAction(proposal.id!, 'reject')}
                              disabled={updating}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/freelancer/public-profile/${proposal.freelancerId}`)}>
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Job</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this job? This action cannot be undone and will also delete all associated proposals.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
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
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extend Expiration Dialog */}
        <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Extend Job Expiration</DialogTitle>
              <DialogDescription>
                Extend the job expiration by 30 days to give more time for freelancers to apply.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleExtendJob}
                disabled={updating}
              >
                {updating ? "Extending..." : "Extend Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
      </Layout>
  );
};

export default JobDetailsClient; 