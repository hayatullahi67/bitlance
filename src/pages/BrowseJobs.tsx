import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, DollarSign, Clock, Briefcase, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import LandingHeader from "@/components/layout/LandingHeader";

interface Job {
  id: string;
  title: string;
  description: string;
  budget: {
    min: number;
    max: number;
  };
  skills: string[];
  location: string;
  type: string;
  duration: string;
  clientId: string;
  clientName: string;
  clientRating: number;
  postedDate: any;
  status: string;
}

const BrowseJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    fetchJobs();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm]);

  const fetchJobs = async () => {
    try {
      const jobsRef = collection(db, "jobs");
      const querySnapshot = await getDocs(jobsRef);
      
      const jobsData: Job[] = [];
      for (const doc of querySnapshot.docs) {
        const jobData = doc.data();
        jobsData.push({
          id: doc.id,
          ...jobData,
        } as Job);
      }
      
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredJobs(filtered);
  };

  const handleApplyClick = (jobId: string) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login', { state: { from: `/browse-jobs/${jobId}` } });
      return;
    }
    
    // If user is authenticated, navigate to job details
    navigate(`/job-details/${jobId}`);
  };

  const formatDate = (date: any) => {
    if (!date) return "Recently";
    const timestamp = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <LandingHeader />
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Available Jobs</h1>
        <p className="text-gray-600">Find the perfect project that matches your skills and interests</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                </div>
                <Badge variant={job.type === "full-time" ? "default" : "secondary"}>
                  {job.type}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {job.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills?.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills && job.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.skills.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${job.budget?.min?.toLocaleString() || 0} - ${job.budget?.max?.toLocaleString() || 0}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {job.duration}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                    <Briefcase className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.clientName}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {job.clientRating?.toFixed(1) || "N/A"}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyClick(job.id);
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Apply Now
                </Button>
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Posted {formatDate(job.postedDate)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
      </div>
    </>
  );
};

export default BrowseJobs; 