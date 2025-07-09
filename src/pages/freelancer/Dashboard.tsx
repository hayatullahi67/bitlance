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
import { doc, getDoc } from "firebase/firestore";
import { handleLogout } from "@/lib/authUtils";

const FreelancerDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Fetch user name from Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

    return () => unsubscribe();
  }, []);

  const activeProjects = [
    {
      id: 1,
      title: "E-commerce Website Development",
      client: {
        name: "TechCorp Inc.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        rating: 4.8,
        location: "San Francisco, CA"
      },
      budget: "0.05 BTC",
      status: "In Progress",
      deadline: "Dec 15, 2024",
      progress: 60,
      timeSpent: "24h 30m",
      lastActivity: "2 hours ago",
      type: "Fixed Price",
      hourlyRate: "0.002 BTC/hour"
    },
    {
      id: 2,
      title: "React Dashboard Development",
      client: {
        name: "StartupXYZ",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
        rating: 4.9,
        location: "New York, NY"
      },
      budget: "0.03 BTC",
      status: "Under Review",
      deadline: "Dec 10, 2024",
      progress: 85,
      timeSpent: "18h 45m",
      lastActivity: "5 hours ago",
      type: "Fixed Price",
      hourlyRate: "0.002 BTC/hour"
    },
    {
      id: 3,
      title: "Mobile App UI/UX Design",
      client: {
        name: "FinanceFlow",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        rating: 4.7,
        location: "Austin, TX"
      },
      budget: "0.04 BTC",
      status: "In Progress",
      deadline: "Dec 18, 2024",
      progress: 40,
      timeSpent: "12h 20m",
      lastActivity: "1 day ago",
      type: "Hourly",
      hourlyRate: "0.0018 BTC/hour"
    }
  ];

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

  return (
    <Layout 
      userType="freelancer"
      userName={userName || "..."}
      userAvatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
      onFindWork={() => navigate("/marketplace")}
      onLogout={handleLogout}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName || "..."}!</h2>
              <p className="text-gray-600">Track your projects and find new opportunities.</p>
            </div>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate("/marketplace")}
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
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Award className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">15 completed projects</p>
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Active Projects Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Active Projects</h3>
                  <Button variant="outline" size="sm" onClick={() => navigate("/freelancer-dashboard")}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {activeProjects.slice(0, 2).map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={project.client.avatar} />
                                <AvatarFallback>{project.client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{project.client.name}</span>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs ml-1">{project.client.rating}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1">{project.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Budget:</span>
                            <span className="font-medium">{project.budget}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Deadline:</span>
                            <span className="font-medium">{project.deadline}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress:</span>
                              <span className="font-medium">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recommended Opportunities */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended Opportunities</h3>
                <div className="space-y-4">
                  {submittedProposals.slice(0, 2).map((proposal) => (
                    <Card key={proposal.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{proposal.jobTitle}</CardTitle>
                            <CardDescription className="mb-2">{proposal.client.name}</CardDescription>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="ml-1">{proposal.client.rating}</span>
                              </div>
                              <span>•</span>
                              <span>{proposal.client.location}</span>
                              <span>•</span>
                              <span>{proposal.daysAgo}</span>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {proposal.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Proposal Amount:</span>
                            <span className="font-medium">{proposal.proposalAmount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Submitted:</span>
                            <span className="font-medium">{proposal.submittedDate}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Job Budget:</span>
                            <span className="font-medium">{proposal.jobBudget}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Job Type:</span>
                            <span className="font-medium">{proposal.jobType}</span>
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
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
                          <Badge variant="outline">{project.type}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={project.client.avatar} />
                              <AvatarFallback>{project.client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{project.client.name}</p>
                              <p className="text-sm text-gray-500">{project.client.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1">{project.client.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-orange-600 mb-2">{project.budget}</div>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1">{project.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Deadline</p>
                        <p className="font-medium">{project.deadline}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time Spent</p>
                        <p className="font-medium">{project.timeSpent}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Activity</p>
                        <p className="font-medium">{project.lastActivity}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Client
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Submitted Proposals</h3>
              <Button variant="outline" onClick={() => navigate("/marketplace")}>
                Browse New Jobs
              </Button>
            </div>
            
            <div className="space-y-4">
              {submittedProposals.map((proposal) => (
                <Card key={proposal.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-lg">{proposal.jobTitle}</CardTitle>
                          <Badge className={getProposalStatusColor(proposal.status)}>
                            {getProposalStatusIcon(proposal.status)}
                            <span className="ml-1">{proposal.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                          <span className="font-medium">{proposal.client.name}</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="ml-1">{proposal.client.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{proposal.client.location}</span>
                          <span>•</span>
                          <span>{proposal.daysAgo}</span>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            {proposal.coverLetter && proposal.coverLetter.length > 120
                              ? `${proposal.coverLetter.slice(0, 120)}...`
                              : proposal.coverLetter}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {proposal.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {proposal.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{proposal.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-orange-600 mb-2">{proposal.proposalAmount}</div>
                        <Badge variant="outline">{proposal.jobType}</Badge>
                        <div className="text-xs text-gray-500 mt-1">Job Budget: {proposal.jobBudget}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Submitted {proposal.submittedDate}</span>
                        <span>•</span>
                        <span>Job Budget: {proposal.jobBudget}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
    </Layout>
  );
};

export default FreelancerDashboard;
