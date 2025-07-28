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
import FreelancerHeader from "@/components/layout/FreelancerHeader";
import { 
  Zap, 
  Search, 
  Briefcase, 
  Star, 
  TrendingUp, 
  Wallet, 
  Filter,
  MessageSquare,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  ArrowRight,
  MoreHorizontal,
  Eye,
  CheckCircle,
  AlertCircle,
  MapPin,
  Users,
  Award,
  X
} from "lucide-react";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, collection } from "firebase/firestore";
import { doc, getDoc, getDocs } from "firebase/firestore";
import { handleLogout } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { sendFirstMessage } from "@/lib/conversation";
import { createOrGetConversation } from "@/lib/conversation";

const FreelancerDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [userName, setUserName] = useState("");
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [loadingActiveProjects, setLoadingActiveProjects] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Fetch user name from Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(`${userData.firstName} ${userData.lastName}`);
      }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("User");
        }
      }
    });

    // Real-time listener for jobs and proposals
    let unsubscribeJobs: any;
    const currentUser = auth.currentUser;
    if (currentUser) {
      setLoadingProposals(true);
      setLoadingActiveProjects(true);
      unsubscribeJobs = onSnapshot(collection(db, "jobs"), async (snapshot) => {
        const myProposals: any[] = [];
        const myActiveProjects: any[] = [];
        
        // Helper function to fetch client data from users collection
        const fetchClientData = async (clientId: string) => {
          if (!clientId) return { name: 'Client', avatar: `https://ui-avatars.com/api/?name=Client` };
          
          try {
            const clientDoc = await getDoc(doc(db, "users", clientId));
            if (clientDoc.exists()) {
              const clientData = clientDoc.data();
              const clientName = `${clientData.firstName} ${clientData.lastName}`;
              const clientAvatar = clientData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}`;
              return { name: clientName, avatar: clientAvatar };
            }
          } catch (error) {
            console.error("Error fetching client data:", error);
          }
          return { name: 'Client', avatar: `https://ui-avatars.com/api/?name=Client` };
        };
        
        // Use for...of loop to handle async operations
        for (const docSnap of snapshot.docs) {
          const job = docSnap.data();
          if (Array.isArray(job.proposals)) {
            for (const proposal of job.proposals) {
              if (proposal.freelancerId === currentUser.uid) {
                // Fetch client data for all proposals
                const clientData = await fetchClientData(job.clientId);
                
                const proposalWithJob = {
                  ...proposal,
                  jobId: docSnap.id,
                  jobTitle: job.title,
                  jobBudget: job.budget,
                  jobType: job.budget?.type === "fixed" ? "Fixed Price" : "Hourly",
                  duration: job.deliveryTime || '',
                  deadline: job.deadline || '',
                  category: job.category || '',
                  type: job.type || '',
                  client: {
                    name: clientData.name,
                    location: job.client?.location || 'Remote',
                    rating: job.client?.rating || 'N/A',
                    avatar: clientData.avatar
                  },
                };
                myProposals.push(proposalWithJob);
                
                if (proposal.status === "accepted") {
                  myActiveProjects.push({
                    ...job,
                    id: docSnap.id,
                    title: job.title || '',
                    budget: job.budget || {},
                    duration: proposal.deliveryTime || job.deliveryTime || '',
                    deadline: proposal.deadline || job.deadline || '',
                    category: job.category || '',
                    type: job.type || '',
                    status: job.status || 'in_progress',
                    progress: job.progress || 0,
                    timeSpent: job.timeSpent || '',
                    lastActivity: job.lastActivity || '',
                    // Store proposal data for deadline calculation
                    proposalAcceptedAt: proposal.acceptedAt || proposal.createdAt,
                    proposalDeliveryTime: proposal.deliveryTime,
                    client: {
                      name: clientData.name,
                      location: job.client?.location || 'Remote',
                      rating: job.client?.rating || 'N/A',
                      avatar: clientData.avatar
                    },
                  });
                }
              }
            }
          }
        }
        
        setProposals(myProposals);
        setActiveProjects(myActiveProjects);
        setLoadingProposals(false);
        setLoadingActiveProjects(false);
      }, (error) => {
        setLoadingProposals(false);
        setLoadingActiveProjects(false);
      });
    }
    return () => {
      unsubscribeAuth();
      if (unsubscribeJobs) unsubscribeJobs();
    };
  }, []);

  const submittedProposals = [
    {
      id: 1,
      jobTitle: "Mobile App UI/UX Design",
      client: {
        name: "FinTech Startup",
        rating: 4.9,
        location: "Remote"
      },
      proposalAmount: "0.035 BTC",
      submittedDate: "Dec 5, 2024",
      status: "Under Review",
      jobBudget: "0.02-0.04 BTC",
      jobType: "Fixed Price",
      daysAgo: "3 days ago",
      coverLetter: "I have extensive experience in mobile app design with a focus on fintech applications. My portfolio includes similar projects for payment apps and financial dashboards.",
      skills: ["UI/UX", "Figma", "Mobile Design", "Prototyping"]
    },
    {
      id: 2,
      jobTitle: "WordPress Theme Customization",
      client: {
        name: "E-commerce Store",
        rating: 4.6,
        location: "Remote"
      },
      proposalAmount: "0.02 BTC",
      submittedDate: "Dec 3, 2024",
      status: "Viewed",
      jobBudget: "0.015-0.025 BTC",
      jobType: "Fixed Price",
      daysAgo: "5 days ago",
      coverLetter: "I've customized over 50 WordPress themes for e-commerce sites. I specialize in WooCommerce integration and responsive design.",
      skills: ["WordPress", "PHP", "CSS", "Theme Development"]
    },
    {
      id: 3,
      jobTitle: "Content Writing for Crypto Blog",
      client: {
        name: "CryptoNews",
        rating: 4.8,
        location: "Remote"
      },
      proposalAmount: "0.008 BTC",
      submittedDate: "Dec 1, 2024",
      status: "Shortlisted",
      jobBudget: "0.005-0.01 BTC",
      jobType: "Per Article",
      daysAgo: "7 days ago",
      coverLetter: "I'm a crypto enthusiast with 3 years of experience writing about blockchain technology. I can deliver engaging, SEO-optimized content.",
      skills: ["Content Writing", "SEO", "Crypto Knowledge", "Research"]
    },
    {
      id: 4,
      jobTitle: "React Native App Development",
      client: {
        name: "HealthTech Solutions",
        rating: 4.7,
        location: "Remote"
      },
      proposalAmount: "0.06 BTC",
      submittedDate: "Nov 28, 2024",
      status: "Rejected",
      jobBudget: "0.04-0.08 BTC",
      jobType: "Fixed Price",
      daysAgo: "10 days ago",
      coverLetter: "I've developed several healthcare apps with React Native. I understand HIPAA compliance and can implement secure data handling.",
      skills: ["React Native", "JavaScript", "Healthcare", "API Integration"]
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

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Viewed": return "bg-blue-100 text-blue-800";
      case "Shortlisted": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Accepted": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProposalStatusIcon = (status: string) => {
    switch (status) {
      case "Under Review": return <Clock className="h-4 w-4" />;
      case "Viewed": return <Eye className="h-4 w-4" />;
      case "Shortlisted": return <CheckCircle className="h-4 w-4" />;
      case "Rejected": return <X className="h-4 w-4" />;
      case "Accepted": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Add a helper function for formatting budget
  const formatBudget = (budget) => {
    if (!budget || typeof budget !== 'object') return 'N/A';
    if (budget.type === 'fixed') {
      return `${budget.min ?? '?'} - ${budget.max ?? '?'} BTC`;
    } else if (budget.type === 'hourly') {
      return `${budget.hourly ?? '?'} BTC/hour`;
    }
    return 'N/A';
  };

  // Calculate deadline based on when proposal was accepted and delivery time
  const calculateDeadline = (acceptedAt, deliveryTime) => {
    if (!acceptedAt || !deliveryTime) return 'Not set';
    
    try {
      const startDate = new Date(acceptedAt.seconds ? acceptedAt.seconds * 1000 : acceptedAt);
      const deadlineDate = new Date(startDate);
      deadlineDate.setDate(startDate.getDate() + parseInt(deliveryTime));
      return deadlineDate.toLocaleDateString();
    } catch (error) {
      console.error('Error calculating deadline:', error);
      return 'Not set';
    }
  };

  // Helper function to get random items from array
  const getRandomItems = (array, count) => {
    if (!array || array.length === 0) return [];
    if (array.length <= count) return array;
    
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleMessageClient = async (project: any) => {
    if (!auth.currentUser) {
      alert("Please log in first");
      return;
    }

    try {
      // Get client info from the project
      const clientUuid = project.clientId;
      const clientName = project.client?.name || "Client";
      const clientAvatar = project.client?.avatar || "";
      
      if (!clientUuid) {
        throw new Error("Client ID not found");
      }
      
      // Get freelancer info (current user)
      const freelancerUuid = auth.currentUser.uid;
      
      // Fetch freelancer data from users collection
      let freelancerName = "Freelancer";
      let freelancerAvatar = "";
      try {
        const freelancerDoc = await getDoc(doc(db, "users", freelancerUuid));
        if (freelancerDoc.exists()) {
          const freelancerData = freelancerDoc.data();
          freelancerName = `${freelancerData.firstName} ${freelancerData.lastName}`;
          freelancerAvatar = freelancerData.avatar || "";
        }
      } catch (error) {
        console.error("Error fetching freelancer data:", error);
      }

      // Create or get existing conversation for this job
      const conversationId = await createOrGetConversation(
        project.id,
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
    <>
      <FreelancerHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName || "..."}!</h2>
              <p className="text-gray-600">Track your projects and find new opportunities.</p>
            </div>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate("/browse-jobs")}
            >
              <Search className="mr-2 h-4 w-4" />
              Find Work
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
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                On track
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <Wallet className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.25 BTC</div>
              <p className="text-xs text-muted-foreground">~$11,250 USD</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proposals Sent</CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposals.length}</div>
              <p className="text-xs text-muted-foreground">Total proposals submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                4.9
                <Star className="h-4 w-4 text-yellow-400 ml-1 fill-current" />
              </div>
              <p className="text-xs text-muted-foreground">Based on 15 reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full max-w-2xl mb-8 overflow-x-auto flex-nowrap whitespace-nowrap pl-[120px] gap-2   sm:grid sm:grid-cols-4">
            <TabsTrigger value="overview" className="min-w-[110px] text-sm  px-2 py-1">Overview</TabsTrigger>
            <TabsTrigger value="projects" className="min-w-[110px] text-sm px-2 py-1">My Projects</TabsTrigger>
            <TabsTrigger value="opportunities" className="min-w-[110px] text-sm px-2 py-1">Opportunities</TabsTrigger>
            <TabsTrigger value="earnings" className="min-w-[110px] text-sm px-2 py-1">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Active Projects Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Active Projects</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("projects")}>View All</Button>
                </div>
                {loadingActiveProjects ? (
                  <div className="text-center py-8 text-gray-500">Loading active projects...</div>
                ) : activeProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No active projects yet.</div>
                ) : (
                <div className="space-y-4">
                  {getRandomItems(activeProjects, 2).map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{project.title || project.jobTitle}</CardTitle>
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="h-6 w-6">
                                  <AvatarImage src={project.client?.avatar} />
                                  <AvatarFallback>{project.client?.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                                <span className="text-sm font-medium">{project.client?.name}</span>
                              </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Budget:</span>
                              <span className="font-medium">{formatBudget(project.budget)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{project.duration}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium">{project.category}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" onClick={() => navigate(`/freelancer/job/${project.id}`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleMessageClient(project)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Client
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                )}
              </div>

              {/* Recommended Opportunities */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Recommended Opportunities</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("opportunities")}>View All</Button>
                </div>
                <div className="space-y-4">
                  {getRandomItems(proposals, 2).map((proposal) => (
                    <Card key={proposal.jobId + proposal.createdAt} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{proposal.jobTitle}</CardTitle>
                            <CardDescription className="mb-2">{proposal.client?.name || 'Client'}</CardDescription>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="ml-1">{proposal.client?.rating || 'N/A'}</span>
                              </div>
                              <span>•</span>
                              <span>{proposal.client?.location || 'Remote'}</span>
                              <span>•</span>
                              <span>{proposal.createdAt ? new Date(proposal.createdAt.seconds ? proposal.createdAt.seconds * 1000 : proposal.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                          <Badge className={getProposalStatusColor(proposal.status)}>
                            {getProposalStatusIcon(proposal.status)}
                            <span className="ml-1">{proposal.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {/* <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Proposal Amount:</span>
                            <span className="font-medium">{typeof proposal.budget === 'object' ? formatBudget(proposal.budget) : (proposal.budget || 'N/A')}</span>
                          </div> */}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Submitted:</span>
                            <span className="font-medium">{proposal.createdAt ? new Date(proposal.createdAt.seconds ? proposal.createdAt.seconds * 1000 : proposal.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Job Budget:</span>
                            <span className="font-medium">{typeof proposal.jobBudget === 'object' ? formatBudget(proposal.jobBudget) : proposal.jobBudget}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Job Type:</span>
                            <span className="font-medium">{proposal.jobType}</span>
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/freelancer/job/${proposal.jobId}`); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button> */}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
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
              {activeProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <Badge variant="outline">{typeof project.type === 'string' ? project.type : 'Project'}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={project.client?.avatar} />
                              <AvatarFallback>{project.client?.name ? project.client.name.split(' ').map(n => n[0]).join('') : 'C'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{project.client?.name || 'Client'}</p>
                              <p className="text-sm text-gray-500">{project.client?.location || 'Remote'}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1">{project.client?.rating || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-orange-600 mb-2">
                          {formatBudget(project.budget)}
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1">{project.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Deadline</p>
                        <p className="font-medium">{calculateDeadline(project.proposalAcceptedAt, project.proposalDeliveryTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Activity</p>
                        <p className="font-medium">{project.lastActivity || 'Not available'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{typeof project.progress === 'number' ? project.progress : 0}%</span>
                      </div>
                      <Progress value={typeof project.progress === 'number' ? project.progress : 0} className="h-2" />
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" onClick={() => handleMessageClient(project)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Client
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {/* <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:p-0">
                {selectedProposal && (
                  <div className="flex flex-col max-h-[80vh] w-full">
                    <DialogHeader className="p-6 border-b">
                      <DialogTitle className="text-2xl font-bold mb-1">Proposal Details</DialogTitle>
                      <DialogDescription className="text-base text-gray-500">
                        Full details for your proposal to <span className="font-semibold text-orange-600">{selectedProposal.jobTitle}</span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Status</div>
                          <Badge className={getProposalStatusColor(selectedProposal.status) + " text-base px-3 py-1 rounded-full"}>{selectedProposal.status}</Badge>
                        </div>
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Job Type</div>
                          <span className="font-medium text-gray-900">{selectedProposal.jobType}</span>
                        </div>
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Job Budget</div>
                          <span className="font-medium text-gray-900">{typeof selectedProposal.jobBudget === 'object' ? formatBudget(selectedProposal.jobBudget) : selectedProposal.jobBudget}</span>
                        </div>
                        {/* <div>
                          <div className="mb-2 text-sm text-gray-500">Proposal Amount</div>
                          <span className="font-medium text-orange-600 text-lg">{selectedProposal.budget || selectedProposal.proposalAmount}</span>
                        </div> */}
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Submitted</div>
                          <span className="font-medium text-gray-900">{selectedProposal.createdAt ? new Date(selectedProposal.createdAt.seconds ? selectedProposal.createdAt.seconds * 1000 : selectedProposal.createdAt).toLocaleString() : "-"}</span>
                        </div>
                        {selectedProposal.deliveryTime && (
                          <div>
                            <div className="mb-2 text-sm text-gray-500">Delivery Time</div>
                            <span className="font-medium text-gray-900">{selectedProposal.deliveryTime}</span>
                          </div>
                        )}
                        {selectedProposal.file && (
                          <div>
                            <div className="mb-2 text-sm text-gray-500">Attached File</div>
                            <span className="font-medium text-blue-600 underline cursor-pointer">{selectedProposal.file.name}</span>
                          </div>
                        )}
                        {selectedProposal && Array.isArray(selectedProposal.history) && selectedProposal.history.length > 0 && (
                          <div>
                            <div className="mb-2 text-sm text-gray-500">Status History</div>
                            <ul className="list-disc ml-6 mt-1 text-xs text-gray-700">
                              {selectedProposal.history.map((h: any, idx: number) => (
                                <li key={idx}>{h.status} at {new Date(h.at).toLocaleString()}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <hr className="my-4 border-gray-200" />
                      <div>
                        <div className="mb-2 text-sm text-gray-500">Cover Letter</div>
                        <div className="whitespace-pre-line bg-gray-50 rounded p-4 border text-gray-800 text-base shadow-sm">
                          {selectedProposal.message}
                        </div>
                      </div>
                      {selectedProposal.skills && selectedProposal.skills.length > 0 && (
                        <div>
                          <div className="mb-2 text-sm text-gray-500">Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedProposal.skills.map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs px-2 py-1">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/freelancer/job/${selectedProposal.jobId}`)}>
                        <Eye className="h-4 w-4 mr-1" /> View Job
                      </Button>
                      <DialogClose asChild>
                        <Button size="sm" variant="ghost">Close</Button>
                      </DialogClose>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Submitted Proposals</h3>
              <Button variant="outline" onClick={() => navigate("/browse-jobs")}>Browse New Jobs</Button>
            </div>
            {loadingProposals ? (
              <div className="text-center py-8 text-gray-500">Loading proposals...</div>
            ) : (
            <div className="space-y-4">
                {proposals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No proposals submitted yet.</div>
                ) : (
                  proposals.map((proposal) => (
                    <Card key={proposal.jobId + proposal.createdAt} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedProposal(proposal); setModalOpen(true); }}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                          <CardTitle className="text-lg whitespace-normal break-words">{proposal.jobTitle}</CardTitle>
                          <Badge className={getProposalStatusColor(proposal.status)}>
                            {/* {getProposalStatusIcon(proposal.status)} */}
                            <span className="ml-1">{proposal.status}</span>
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center space-x-2 text-xs text-gray-500 mb-2">
                          <span className="font-medium whitespace-normal break-words">{proposal.client?.name || "Client"}</span>
                              {proposal.client?.rating && <><span>•</span><div className="flex items-center"><Star className="h-3 w-3 text-yellow-400 fill-current" /><span className="ml-1">{proposal.client.rating}</span></div></>}
                              {proposal.client?.location && <><span>•</span><span>{proposal.client.location}</span></>}
                              {proposal.createdAt && <><span>•</span><span>{new Date(proposal.createdAt.seconds ? proposal.createdAt.seconds * 1000 : proposal.createdAt).toLocaleDateString()}</span></>}
                        </div>
                        <div className="mb-2">
                          <p className="text-xs text-gray-600 whitespace-normal break-words">
                                {proposal.message && proposal.message.length > 120 ? `${proposal.message.slice(0, 120)}...` : proposal.message}
                          </p>
                        </div>
                            {proposal.skills && proposal.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {proposal.skills.slice(0, 3).map((skill: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                          {proposal.skills.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">+{proposal.skills.length - 3} more</Badge>
                          )}
                              </div>
                            )}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2">
                          <div className="text-xs text-gray-500"><span className="font-semibold text-gray-700">Job Type:</span> <span className="font-medium text-gray-900 whitespace-normal break-words">{proposal.jobType}</span></div>
                          <div className="text-xs text-gray-500"><span className="font-semibold text-gray-700">Job Budget:</span> <span className="font-medium text-gray-900 whitespace-normal break-words">{typeof proposal.jobBudget === 'object' ? formatBudget(proposal.jobBudget) : proposal.jobBudget}</span></div>
                        </div>
                      </div>
                      <div className="text-right mt-2 sm:mt-0 w-full sm:w-auto">
                        <div className="text-lg font-semibold text-orange-600 mb-2 whitespace-normal break-words">{typeof proposal.jobBudget === 'object' ? formatBudget(proposal.jobBudget) : (proposal.jobBudget || proposal.proposalAmount)}</div>
                        <Badge variant="outline">{proposal.jobType}</Badge>
                        <div className="text-xs text-gray-500 mt-1 whitespace-normal break-words">Job Budget: {typeof proposal.jobBudget === 'object' ? formatBudget(proposal.jobBudget) : proposal.jobBudget}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2 sm:mb-0">
                            {proposal.createdAt && <span>Submitted {new Date(proposal.createdAt.seconds ? proposal.createdAt.seconds * 1000 : proposal.createdAt).toLocaleDateString()}</span>}
                        <span>•</span>
                        <span>Job Budget: {typeof proposal.jobBudget === 'object' ? formatBudget(proposal.jobBudget) : proposal.jobBudget}</span>
                      </div>
                      <div className="flex space-x-2 mt-2 sm:mt-0">
                            <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); navigate(`/freelancer/job/${proposal.jobId}`); }}>
                          <Eye className="h-4 w-4" />
                              View Job
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  ))
                )}
            </div>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Earnings Overview */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Earnings Overview</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">This Month</p>
                          <p className="text-2xl font-bold">0.08 BTC</p>
                          <p className="text-sm text-gray-500">~$3,600 USD</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Last Month</p>
                          <p className="text-lg font-semibold">0.12 BTC</p>
                          <p className="text-sm text-red-500">-33%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Pending Payments</span>
                          <span className="font-medium">0.025 BTC</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Available for Withdrawal</span>
                          <span className="font-medium text-green-600">0.055 BTC</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Platform Fees</span>
                          <span className="font-medium text-orange-600">0.004 BTC</span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        Withdraw Funds
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">E-commerce Website</p>
                            <p className="text-sm text-gray-500">TechCorp Inc.</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+0.025 BTC</p>
                          <p className="text-sm text-gray-500">2 days ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Logo Design</p>
                            <p className="text-sm text-gray-500">StartupXYZ</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600">Pending</p>
                          <p className="text-sm text-gray-500">Under review</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">React Dashboard</p>
                            <p className="text-sm text-gray-500">FinanceFlow</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+0.03 BTC</p>
                          <p className="text-sm text-gray-500">1 week ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default FreelancerDashboard;
