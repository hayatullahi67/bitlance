import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { 
  Zap, 
  Plus, 
  Briefcase, 
  Users, 
  Clock, 
  Wallet, 
  Search, 
  Filter,
  MessageSquare,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Calendar,
  DollarSign,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, collection } from "firebase/firestore";
import { doc, getDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { handleLogout } from "@/lib/authUtils";
import { sendFirstMessage, createOrGetConversation } from "@/lib/conversation";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [userName, setUserName] = useState("");
  const [jobsPosted, setJobsPosted] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [loadingActiveProjects, setLoadingActiveProjects] = useState(true);

  useEffect(() => {
    // Fetch user name and jobs from Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user's full name from users collection
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(`${userData.firstName} ${userData.lastName}`);
          } else {
            setUserName("Client");
          }
          
          // Load jobs for this client
          await loadClientJobs(user.uid);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("Client");
          setError("Failed to load user data. Please try again.");
        }
      } else {
        setLoadingJobs(false);
        setError("Please log in to view your dashboard.");
      }
    });

    // Real-time listener for active projects
    let unsubscribeJobs: any;
    const currentUser = auth.currentUser;
    if (currentUser) {
      setLoadingActiveProjects(true);
      unsubscribeJobs = onSnapshot(collection(db, "jobs"), async (snapshot) => {
        const myActiveProjects: any[] = [];
        
        // Process each job
        for (const docSnap of snapshot.docs) {
          const job = docSnap.data();
          if (job.clientId === currentUser.uid && Array.isArray(job.proposals)) {
            // Check if any proposal is accepted
            const acceptedProposal = job.proposals.find((proposal: any) => proposal.status === "accepted");
            if (acceptedProposal) {
              // Fetch freelancer's full name from users collection
              let freelancerName = acceptedProposal.freelancerName;
              let freelancerAvatar = acceptedProposal.freelancerAvatar;
              
              try {
                const freelancerDoc = await getDoc(doc(db, "users", acceptedProposal.freelancerId));
                if (freelancerDoc.exists()) {
                  const freelancerData = freelancerDoc.data();
                  freelancerName = `${freelancerData.firstName} ${freelancerData.lastName}`;
                  freelancerAvatar = freelancerData.avatar || freelancerAvatar;
                }
              } catch (error) {
                console.error("Error fetching freelancer data:", error);
              }
              
              myActiveProjects.push({
                ...job,
                id: docSnap.id,
                acceptedProposal,
                freelancer: {
                  name: freelancerName,
                  avatar: freelancerAvatar,
                  rating: acceptedProposal.freelancerRating,
                  location: acceptedProposal.freelancerLocation,
                  id: acceptedProposal.freelancerId
                }
              });
            }
          }
        }
        
        setActiveProjects(myActiveProjects);
        setLoadingActiveProjects(false);
      }, (error) => {
        console.error("Error listening to jobs:", error);
        setLoadingActiveProjects(false);
      });
    }

    return () => {
      unsubscribeAuth();
      if (unsubscribeJobs) unsubscribeJobs();
    };
  }, []);

  const loadClientJobs = async (clientId: string) => {
      setLoadingJobs(true);
    setError(null);
    
    try {
      console.log("Loading jobs for client:", clientId);
      
      // Query jobs where clientId matches the authenticated user
      // Removed orderBy to avoid composite index requirement
      const jobsQuery = query(
        collection(db, "jobs"),
        where("clientId", "==", clientId)
      );
      
      const querySnapshot = await getDocs(jobsQuery);
      console.log("Query result:", querySnapshot.docs.length, "jobs found");
      
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort jobs by createdAt in JavaScript instead of Firestore
      jobs.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });
      
      console.log("Processed jobs:", jobs);
      setJobsPosted(jobs);
    } catch (error) {
      console.error("Error loading client jobs:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // More specific error messages based on error type
      let errorMessage = "Failed to load your jobs. Please try again.";
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check your authentication.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      } else if (error.code === 'not-found') {
        errorMessage = "Jobs collection not found. Please contact support.";
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleRetry = async () => {
    if (auth.currentUser) {
      await loadClientJobs(auth.currentUser.uid);
    }
  };

  const activeJobs = activeProjects; // Use real-time data instead of hardcoded array

  const recentProposals = [
    {
      id: 1,
      jobTitle: "React Dashboard Development",
      freelancer: {
        name: "Alex Thompson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        rating: 4.7,
        location: "London, UK"
      },
      proposal: "0.04 BTC",
      submitted: "2 hours ago",
      status: "New"
    },
    {
      id: 2,
      jobTitle: "Content Writing for Blog",
      freelancer: {
        name: "Lisa Wang",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
        rating: 4.9,
        location: "Toronto, CA"
      },
      proposal: "0.008 BTC",
      submitted: "4 hours ago",
      status: "New"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Paused": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress": return <Clock className="h-4 w-4" />;
      case "Under Review": return <AlertCircle className="h-4 w-4" />;
      case "Completed": return <CheckCircle className="h-4 w-4" />;
      case "Paused": return <MoreHorizontal className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleMessageFreelancer = async (job: any) => {
    if (!auth.currentUser) {
      alert("Please log in first");
      return;
    }

    try {
      // Get client info (current user)
      const clientUuid = auth.currentUser.uid;
      
      // Fetch client data from users collection
      let clientName = "Client";
      let clientAvatar = "";
      try {
        const clientDoc = await getDoc(doc(db, "users", clientUuid));
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          clientName = `${clientData.firstName} ${clientData.lastName}`;
          clientAvatar = clientData.avatar || "";
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
      }
      
      // Get freelancer info from the job
      const freelancerUuid = job.freelancer?.id || job.acceptedProposal?.freelancerId;
      const freelancerName = job.freelancer?.name || "Freelancer";
      const freelancerAvatar = job.freelancer?.avatar || "";
      
      if (!freelancerUuid) {
        throw new Error("Freelancer ID not found");
      }

      // Create or get existing conversation for this job
      const conversationId = await createOrGetConversation(
        job.id,
        clientUuid,
        clientName,
        clientAvatar,
        freelancerUuid,
        freelancerName,
        freelancerAvatar
      );

      // Navigate to messages page with the conversation
      navigate(`/messages?conversation=${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to open chat. Please try again.");
    }
  };


  return (
    <Layout 
      userType="client"
      userName={userName || "..."}
      userAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
      onPostJob={() => navigate("/post-job")}
      onLogout={handleLogout}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName || "..."}!</h2>
              <p className="text-gray-600">Here's what's happening with your projects today.</p>
            </div>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate("/post-job")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Post a Job
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingActiveProjects ? "—" : activeProjects.length}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                {loadingActiveProjects ? "Loading..." : "Active projects"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingJobs ? "—" : jobsPosted.filter((job: any) => job.status === "open").length}
              </div>
              <p className="text-xs text-muted-foreground">Jobs accepting proposals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingJobs ? "—" : jobsPosted.filter((job: any) => job.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Successfully completed projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingJobs ? "—" : jobsPosted.length}
              </div>
              <p className="text-xs text-muted-foreground">All jobs you've posted</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Active Projects</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Jobs Posted Section - List of Jobs Posted */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Jobs Posted</h3>
              {loadingJobs ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Jobs</h3>
                    <p className="text-gray-600 mb-4">
                      {error === "Please log in to view your dashboard." 
                        ? "Please log in to view your posted jobs."
                        : "There was an error loading your jobs. This might be due to a network issue or temporary service problem."
                      }
                    </p>
                    <div className="flex gap-3 justify-center">
                      {error !== "Please log in to view your dashboard." && (
                        <Button 
                          onClick={handleRetry} 
                          className="bg-orange-500 hover:bg-orange-600"
                          disabled={loadingJobs}
                        >
                          {loadingJobs ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            "Try Again"
                          )}
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/post-job")}
                      >
                        Post New Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : jobsPosted.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-600 mb-4">Start by posting your first job to find talented freelancers.</p>
                    <Button onClick={() => navigate("/post-job")} className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-6">
                  {jobsPosted.map((job: any) => {
                    const isExpanded = expandedJobId === job.id;
                    const desc = job.description || "";
                    const paragraphs = desc.split(/\n+/).filter(Boolean);
                    const shouldTruncate = paragraphs.length > 4;
                    const displayDesc = isExpanded || !shouldTruncate
                      ? paragraphs.join("\n\n")
                      : paragraphs.slice(0, 4).join("\n\n") + "...";
                    
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
                        return date.toLocaleDateString();
                      } catch (error) {
                        return "Invalid date";
                      }
                    };

                    const getStatusBadgeColor = (status: string) => {
                      switch (status) {
                        case "open": return "bg-green-100 text-green-700";
                        case "in_progress": return "bg-blue-100 text-blue-700";
                        case "completed": return "bg-purple-100 text-purple-700";
                        case "expired": return "bg-gray-100 text-gray-700";
                        case "cancelled": return "bg-red-100 text-red-700";
                        default: return "bg-gray-100 text-gray-700";
                      }
                    };

                    return (
                      <Card
                        key={job.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/client/job/${job.id}`)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-xl">{job.title}</CardTitle>
                                <Badge className={getStatusBadgeColor(job.status)}>
                                  {job.status?.replace('_', ' ') || 'Unknown'}
                                </Badge>
                </div>
                              
                              <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-500 text-sm mb-3">
                                <span><span className="font-medium">Budget:</span> {formatBudget(job.budget)}</span>
                                <span><span className="font-medium">Category:</span> {job.category || 'N/A'}</span>
                                <span><span className="font-medium">Posted:</span> {formatDate(job.createdAt)}</span>
                                <span><span className="font-medium">Views:</span> {job.views || 0}</span>
                                <span><span className="font-medium">Proposals:</span> {job.proposals?.length || 0}</span>
                          </div>
                              
                              {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.skills.map((skill: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                                    </Badge>
                            ))}
                          </div>
                        )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/client/job/${job.id}`);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="text-gray-700 text-sm">
                            {displayDesc}
                              {shouldTruncate && (
                                <button
                                className="text-orange-500 hover:text-orange-600 ml-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedJobId(isExpanded ? null : job.id);
                                }}
                              >
                                {isExpanded ? "Show less" : "Show more"}
                                </button>
                          )}
                        </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                        </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search projects..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Projects List */}
            <div className="space-y-4">
              {loadingActiveProjects ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading active projects...</p>
                </div>
              ) : activeJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active projects</h3>
                  <p className="text-gray-600">When you accept proposals, they'll appear here as active projects.</p>
                </div>
              ) : (
                activeJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            <Badge variant="outline">{job.budget?.type === "fixed" ? "Fixed Price" : "Hourly"}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={job.freelancer?.avatar} />
                                <AvatarFallback>{job.freelancer?.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{job.freelancer?.name}</p>
                                <p className="text-sm text-gray-500">{job.freelancer?.location}</p>
                              </div>
                            </div>
                            {job.freelancer?.rating && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="ml-1">{job.freelancer.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-orange-600 mb-2">
                            {job.budget?.type === "fixed" ? `${job.budget.min}-${job.budget.max} BTC` : `${job.budget?.hourly} BTC/hour`}
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>In Progress</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium">{job.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="font-medium">{job.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Experience</p>
                          <p className="font-medium">{job.experience}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm" onClick={() => navigate(`/client/job/${job.id}`)}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleMessageFreelancer(job)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Recent Proposals</h3>
              <Button variant="outline">View All Proposals</Button>
            </div>
            
            <div className="space-y-4">
              {recentProposals.map((proposal) => (
                <Card key={proposal.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{proposal.jobTitle}</CardTitle>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={proposal.freelancer.avatar} />
                            <AvatarFallback>{proposal.freelancer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{proposal.freelancer.name}</p>
                            <p className="text-sm text-gray-500">{proposal.freelancer.location}</p>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1">{proposal.freelancer.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-orange-600 mb-2">{proposal.proposal}</div>
                        <Badge className="bg-green-100 text-green-800">{proposal.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">Submitted {proposal.submitted}</p>
                      <div className="flex space-x-2">
                        <Button size="sm">View Proposal</Button>
                        <Button size="sm" variant="outline">Message</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Activity Timeline</h3>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Payment completed to Sarah Johnson</p>
                      <p className="text-sm text-gray-600">0.025 BTC sent for E-commerce Website Development</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Work submitted by Mike Chen</p>
                      <p className="text-sm text-gray-600">Final logo designs for Startup project</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">New message from Emily Rodriguez</p>
                      <p className="text-sm text-gray-600">Project update for Mobile App Development</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">New proposal received</p>
                      <p className="text-sm text-gray-600">Alex Thompson submitted proposal for React Dashboard</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClientDashboard;
