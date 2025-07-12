import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, DollarSign, Star, Briefcase, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import LandingHeader from "@/components/layout/LandingHeader";

interface Freelancer {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  photoURL: string;
  skills: string[];
  hourlyRate: number;
  location: string;
  bio: string;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  isAvailable: boolean;
  portfolio: string[];
  experience: string;
}

const FindTalent = () => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    fetchFreelancers();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterFreelancers();
  }, [freelancers, searchTerm]);

  const fetchFreelancers = async () => {
    try {
      const freelancersRef = collection(db, "freelancers");
      const querySnapshot = await getDocs(freelancersRef);
      
      const freelancersData: Freelancer[] = [];
      for (const doc of querySnapshot.docs) {
        const freelancerData = doc.data();
        freelancersData.push({
          id: doc.id,
          ...freelancerData,
        } as Freelancer);
      }
      
      setFreelancers(freelancersData);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFreelancers = () => {
    let filtered = freelancers;

    if (searchTerm) {
      filtered = filtered.filter(freelancer => {
        const fullName = getFullName(freelancer.firstName, freelancer.lastName);
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          freelancer.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          freelancer.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }

    setFilteredFreelancers(filtered);
  };

  const handleMessageClick = (freelancerId: string) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login', { state: { from: `/find-talent/${freelancerId}` } });
      return;
    }
    
    // If user is authenticated, navigate to freelancer profile or start conversation
    navigate(`/freelancer-profile/${freelancerId}`);
  };

  const getFullName = (firstName: string, lastName: string) => {
    const first = firstName || '';
    const last = lastName || '';
    return `${first} ${last}`.trim();
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName || '';
    const last = lastName || '';
    const initials = `${first}${last}`.slice(0, 2).toUpperCase();
    return initials || 'U';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mt-2"></div>
                  </div>
                </div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Top Talent</h1>
        <p className="text-gray-600">Connect with skilled freelancers for your projects</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search freelancers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredFreelancers.length} of {freelancers.length} freelancers
        </p>
      </div>

      {/* Freelancers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.map((freelancer) => (
          <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={freelancer.photoURL} alt={getFullName(freelancer.firstName, freelancer.lastName)} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials(freelancer.firstName, freelancer.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {getFullName(freelancer.firstName, freelancer.lastName)}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {freelancer.location}
                  </div>
                </div>
                <Badge variant={freelancer.isAvailable ? "default" : "secondary"}>
                  {freelancer.isAvailable ? "Available" : "Busy"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {freelancer.bio}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {freelancer.skills?.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {freelancer.skills && freelancer.skills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{freelancer.skills.length - 4} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${freelancer.hourlyRate || 0}/hr
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {freelancer.completedJobs || 0} jobs
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {freelancer.rating?.toFixed(1) || "N/A"}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({freelancer.totalReviews || 0} reviews)
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {freelancer.experience}
                </div>
              </div>

              <Button 
                onClick={() => handleMessageClick(freelancer.id)}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFreelancers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
      </div>
    </>
  );
};

export default FindTalent; 