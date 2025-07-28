import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import FreelancerHeader from "@/components/layout/FreelancerHeader";
import { Search, MapPin, Star, Clock, Eye, MessageSquare, Filter, AlertCircle, Users } from "lucide-react";
import { handleLogout } from "@/lib/authUtils";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { trackJobView } from "@/lib/jobManagement";

const BrowseJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Fetch user name and jobs from Firebase
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
          
          // Load jobs
          await loadJobs();
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("Freelancer");
          setError("Failed to load user data. Please try again.");
        }
      } else {
        setLoading(false);
        setError("Please log in to browse jobs.");
      }
    });

    return () => unsubscribe();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Loading jobs from Firebase...");
      
      // Query jobs where status is "open"
      const jobsQuery = query(
        collection(db, "jobs"),
        where("status", "==", "open")
      );
      
      const querySnapshot = await getDocs(jobsQuery);
      console.log("Query result:", querySnapshot.docs.length, "jobs found");
      
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort jobs by createdAt in JavaScript
      jobsData.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });
      
      console.log("Processed jobs:", jobsData);
      setJobs(jobsData);
    } catch (error) {
      console.error("Error loading jobs:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = "Failed to load jobs. Please try again.";
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
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    await loadJobs();
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (selectedSort) {
      case "newest":
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      case "budget-high":
        const budgetA = a.budget?.type === "fixed" ? parseFloat(a.budget.max) : parseFloat(a.budget.hourly);
        const budgetB = b.budget?.type === "fixed" ? parseFloat(b.budget.max) : parseFloat(b.budget.hourly);
        return budgetB - budgetA;
      case "budget-low":
        const budgetALow = a.budget?.type === "fixed" ? parseFloat(a.budget.min) : parseFloat(a.budget.hourly);
        const budgetBLow = b.budget?.type === "fixed" ? parseFloat(b.budget.min) : parseFloat(b.budget.hourly);
        return budgetALow - budgetBLow;
      default:
        return 0;
    }
  });

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
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? '' : 's'} ago`;
      return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? '' : 's'} ago`;
    } catch (error) {
      return "Invalid date";
    }
  };

  const categories = [
    "Web Development",
    "Mobile Development", 
    "Design & Creative",
    "Writing & Translation",
    "Digital Marketing",
    "Data Science",
    "Blockchain & Crypto",
    "Other",
    "Bounty"
  ];

  const handleJobClick = async (jobId: string, jobData: any) => {
    // Track job view for freelancer (only if user is logged in and is not the job owner)
    const currentUser = auth.currentUser;
    if (currentUser && jobData.clientId !== currentUser.uid) {
      try {
        await trackJobView(jobId, currentUser.uid);
      } catch (viewError) {
        console.error("Error tracking job view:", viewError);
        // Don't prevent navigation if view tracking fails
      }
    }
    
    // Navigate to job details
    navigate(`/freelancer/job/${jobId}`);
  };

  return (
    <>
      <FreelancerHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
              Find Your Next Project
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for jobs..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Available Jobs ({sortedJobs.length})
            </h3>
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="budget-high">Highest Budget</SelectItem>
                <SelectItem value="budget-low">Lowest Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Jobs</h3>
                <p className="text-gray-600 mb-4">
                  {error === "Please log in to browse jobs." 
                    ? "Please log in to browse available jobs."
                    : "There was an error loading jobs. This might be due to a network issue or temporary service problem."
                  }
                </p>
                {error !== "Please log in to browse jobs." && (
                  <Button 
                    onClick={handleRetry} 
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Try Again"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : sortedJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Try adjusting your search criteria or filters."
                    : "No jobs are currently available. Check back later!"
                  }
                </p>
                {(searchTerm || selectedCategory !== "all") && (
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {sortedJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleJobClick(job.id, job)}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                          <CardTitle className="text-lg sm:text-xl break-words">{job.title}</CardTitle>
                          {job.verified && (
                            <Badge className="bg-green-100 text-green-800 text-xs mt-1 sm:mt-0">
                              Verified Client
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mb-3 text-sm sm:text-base">
                          {job.description && job.description.length > 120
                            ? <>
                                {job.description.slice(0, 120)}...
                                <span
                                  className="text-blue-600 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJobClick(job.id, job);
                                  }}
                                > See more</span>
                              </>
                            : job.description}
                        </CardDescription>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-500 mt-2">
                          <span>By {job.clientName || "Client"}</span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(job.createdAt)}
                          </span>
                          <span>{job.proposals?.length || 0} proposals</span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location || "Remote"}
                          </span>
                          {job.numberOfFreelancers && (
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              Hiring {job.numberOfFreelancers} freelancer{job.numberOfFreelancers > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right mt-2 sm:mt-0 min-w-[100px]">
                        <div className="text-base sm:text-lg font-semibold text-orange-600 mb-2 break-words">{formatBudget(job.budget)}</div>
                        <Badge variant="outline">{job.budget?.type === "fixed" ? "Fixed Price" : "Hourly"}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job.id, job);
                        }}
                      >
                        Submit Proposal
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job.id, job);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BrowseJobs; 