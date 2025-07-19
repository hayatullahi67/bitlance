import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  Star, 
  MessageSquare, 
  Send,
  Bookmark,
  Share2,
  Flag,
  CheckCircle,
  Award,
  Zap,
  AlertCircle,
  Loader2,
  Eye
} from "lucide-react";
import { handleLogout } from "@/lib/authUtils";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_SIZE_MB = 5;

const JobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalBudget, setProposalBudget] = useState("");
  const [proposalDelivery, setProposalDelivery] = useState("");
  const [proposalFile, setProposalFile] = useState<string | null>(null);
  const [proposalFileName, setProposalFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  useEffect(() => {
    // Fetch user name and job data from Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Set user name
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(`${userData.firstName} ${userData.lastName}`);
          } else {
            setUserName("Freelancer");
          }
          
          // Load job data
          await loadJobData();
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("Freelancer");
          setError("Failed to load user data. Please try again.");
        }
      } else {
        setLoading(false);
        setError("Please log in to view job details.");
      }
    });

    return () => unsubscribe();
  }, [id]);

  const loadJobData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Loading job data for ID:", id);
      
      if (!id) {
        throw new Error("Job ID is required");
      }

      // Fetch job data
      const jobDoc = await getDoc(doc(db, "jobs", id));
      
      if (!jobDoc.exists()) {
        throw new Error("Job not found");
      }

      const jobData = {
        id: jobDoc.id,
        ...jobDoc.data()
      } as any;

      console.log("Job data loaded:", jobData);
      setJob(jobData);

      // Fetch client information if clientId exists
      if (jobData.clientId) {
        try {
          const clientDoc = await getDoc(doc(db, "clients", jobData.clientId));
          if (clientDoc.exists()) {
            setClientInfo(clientDoc.data());
          }
        } catch (clientError) {
          console.error("Error fetching client info:", clientError);
          // Don't fail the whole request if client info fails
        }
      }

      // Note: View tracking is now handled in BrowseJobs.tsx when clicking on a job
      // This prevents double-counting views when navigating from browse to details

    } catch (error) {
      console.error("Error loading job data:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = "Failed to load job details. Please try again.";
      if (error.message === "Job not found") {
        errorMessage = "This job does not exist or has been removed.";
      } else if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check your authentication.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    await loadJobData();
  };

  const handleApply = () => {
    navigate(`/freelancer/apply-job/${id}`, { state: { job } });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked 
        ? "Job removed from your bookmarks" 
        : "Job added to your bookmarks",
    });
  };

  const formatBudget = (budget: any) => {
    if (budget?.type === "fixed") {
      return `${budget.min} - ${budget.max} BTC`;
    } else if (budget?.type === "hourly") {
      return `${budget.hourly} BTC/hour`;
    }
    return "Budget not set";
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open": return "w-[fit-content] bg-green-100 text-green-700";
      case "in_progress": return "w-[fit-content] bg-blue-100 text-blue-700";
      case "completed": return " w-[fit-content] bg-purple-100 text-purple-700";
      case "expired": return " w-[fit-content] bg-gray-100 text-gray-700";
      case "cancelled": return "w-[fit-content] bg-red-100 text-red-700";
      default: return " w-[fit-content] bg-gray-100 text-gray-700";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProposalFile(reader.result as string);
      setProposalFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleProposalSubmit = async () => {
    if (!proposalMessage.trim()) return;
    setSubmittingProposal(true);
    try {
      // Build proposal object
      const proposal = {
        freelancerId: auth.currentUser?.uid,
        freelancerName: userName,
        message: proposalMessage,
        budget: proposalBudget,
        deliveryTime: proposalDelivery,
        file: proposalFile ? { name: proposalFileName, data: proposalFile } : null,
        createdAt: new Date(),
        status: "pending",
      };
      // Add to job's proposals array in Firebase
      await updateDoc(doc(db, "jobs", job.id), {
        [`proposals.${proposal.freelancerId}`]: proposal,
      });
      setProposalSubmitted(true);
      setShowProposalModal(false);
      setProposalMessage("");
      setProposalBudget("");
      setProposalDelivery("");
      setProposalFile(null);
      setProposalFileName("");
      toast({
        title: "Proposal Submitted",
        description: "Your proposal has been submitted successfully!",
        variant: "default",
      });
    } catch (err) {
      setFileError("Failed to submit proposal. Please try again.");
    } finally {
      setSubmittingProposal(false);
    }
  };

  if (loading) {
    return (
      <Layout 
        userType="freelancer"
        userName={userName || "..."}
        userAvatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
        onFindWork={() => navigate("/freelancer/browse-jobs")}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout 
        userType="freelancer"
        userName={userName || "..."}
        userAvatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
        onFindWork={() => navigate("/freelancer/browse-jobs")}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Job</h2>
            <p className="text-gray-600 mb-4">{error || "Job not found"}</p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={handleRetry} 
                className="bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Try Again"
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/freelancer/browse-jobs")}
              >
                Browse Jobs
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const user = auth.currentUser;
  const alreadyApplied = job?.proposals?.some((p: any) => p.freelancerId === user?.uid);

  return (
    <Layout 
      userType="freelancer"
      userName={userName || "..."}
      userAvatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
      onFindWork={() => navigate("/freelancer/browse-jobs")}
      onLogout={handleLogout}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Job Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm w-[fit-content]">{job.category}</Badge>
                  <Badge className={getStatusBadgeColor(job.status)} >{job.status?.replace('_', ' ') || 'Unknown'}</Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">{job.title}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{job.proposals?.length || 0} proposals</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{job.views || 0} views</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 sm:mt-0">
                {/* <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleBookmark}>
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Flag className="h-4 w-4" />
                </Button> */}
              </div>
            </div>

            {/* Client Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={clientInfo?.avatar || "https://ui-avatars.com/api/?name=Client"} />
                    <AvatarFallback>
                      {clientInfo?.name ? clientInfo.name.split(' ').map((n: string) => n[0]).join('') : 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900">{clientInfo?.name || "Client"}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{clientInfo?.rating || 'N/A'}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>{clientInfo?.totalSpent ? `${clientInfo.totalSpent} spent` : 'No spend data'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{clientInfo?.location || 'Unknown location'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Job Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-line text-gray-700">{job.description}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">Budget</p>
                          <p className="font-semibold text-gray-900">
                            {formatBudget(job.budget)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">{job.duration || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Experience</p>
                          <p className="font-semibold text-gray-900">{job.experience || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Project Type</p>
                          <p className="font-semibold text-gray-900">
                            {job.budget?.type === "hourly" ? 'Hourly' : 'Fixed Price'}
                          </p>
                        </div>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Skills Required</p>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatBudget(job.budget)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {job.budget?.type === "hourly" ? 'Hourly' : 'Fixed Price'}
                    </p>
                  </div>
                  {!alreadyApplied && (
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => navigate(`/freelancer/job/${job.id}/submit-proposal`)}>
                      Apply Now
                    </Button>
                  )}
                  {alreadyApplied && (
                    <Button variant="outline" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Proposal Submitted
                    </Button>
                  )}
                  {/* <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Client
                  </Button> */}
                </CardContent>
              </Card>

              {/* Job Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proposals</span>
                    <span className="font-semibold">{job.proposals?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-semibold">{job.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold">{formatBudget(job.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold">{job.duration || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-semibold">{job.experience || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-semibold">{job.location || 'Remote'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-semibold">{job.category || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Proposal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Cover letter/message"
              value={proposalMessage}
              onChange={e => setProposalMessage(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Proposed budget (BTC)"
              value={proposalBudget}
              onChange={e => setProposalBudget(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Delivery time (e.g., 2 weeks)"
              value={proposalDelivery}
              onChange={e => setProposalDelivery(e.target.value)}
            />
            <div>
              <label className="block mb-1">Attachment (optional, max {MAX_FILE_SIZE_MB}MB):</label>
              <Input type="file" accept="*" onChange={handleFileChange} />
              {proposalFileName && <div className="text-xs mt-1">Selected: {proposalFileName}</div>}
              {fileError && <div className="text-xs text-red-500 mt-1">{fileError}</div>}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleProposalSubmit} disabled={submittingProposal || !!fileError}>
              {submittingProposal ? "Submitting..." : "Submit Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobDetails; 