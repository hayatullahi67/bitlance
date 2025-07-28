import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import ClientHeader from "@/components/layout/ClientHeader";
import { Search, Star, MapPin, Plus, Filter, Loader2, Users } from "lucide-react";
import { handleLogout } from "@/lib/authUtils";
import { getFreelancers, searchFreelancers, FreelancerData, SearchFilters, SortOptions } from "@/lib/freelancerSearch";
import { useToast } from "@/hooks/use-toast";

const BrowseFreelancers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("");
  const [freelancers, setFreelancers] = useState<FreelancerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<SortOptions>({ field: 'newest', direction: 'desc' });
  const [selectedSort, setSelectedSort] = useState("newest");
  const [btcUsdRate, setBtcUsdRate] = useState<number>(0);

  // Load freelancers on component mount
  useEffect(() => {
    loadFreelancers();
  }, [filters, sortBy]);

  useEffect(() => {
    fetch('https://blockchain.info/ticker')
      .then(res => res.json())
      .then(data => setBtcUsdRate(data.USD.last))
      .catch(() => setBtcUsdRate(0));
  }, []);

  const loadFreelancers = async () => {
    setLoading(true);
    try {
      const data = await getFreelancers(filters, sortBy, 50);
      setFreelancers(data);
    } catch (error) {
      console.error("Error loading freelancers:", error);
      toast({
        title: "Error",
        description: "Failed to load freelancers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadFreelancers();
      return;
    }

    setSearching(true);
    try {
      const results = await searchFreelancers(searchTerm, 50);
      setFreelancers(results);
    } catch (error) {
      console.error("Error searching freelancers:", error);
      toast({
        title: "Error",
        description: "Failed to search freelancers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    const sortMap: { [key: string]: SortOptions } = {
      newest: { field: 'newest', direction: 'desc' },
      'rating-high': { field: 'rating', direction: 'desc' },
      'jobs-high': { field: 'jobs', direction: 'desc' },
      'rate-low': { field: 'rate-low', direction: 'asc' },
      'rate-high': { field: 'rate-high', direction: 'desc' }
    };
    setSortBy(sortMap[sort] || { field: 'newest', direction: 'desc' });
  };

  const formatHourlyRate = (rate: number | undefined) => {
    return `$${rate ?? 0}/hour`;
  };

  const formatBTCRate = (rate: number | undefined) => {
    if (!btcUsdRate || btcUsdRate === 0 || !rate) return "~0.0000 BTC/hour";
    const btcRate = (rate / btcUsdRate).toFixed(4);
    return `~${btcRate} BTC/hour`;
  };

  return (
    <>
      <ClientHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Freelancers</h2>
              <p className="text-gray-600">Find the perfect freelancer for your next project.</p>
            </div>
            {/* <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate("/post-job")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Post a Job
            </Button> */}
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for freelancers..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Available Freelancers ({freelancers.length})
            </h3>
            <Select value={selectedSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating-high">Highest Rating</SelectItem>
                <SelectItem value="jobs-high">Most Jobs Completed</SelectItem>
                <SelectItem value="rate-low">Lowest Rate</SelectItem>
                <SelectItem value="rate-high">Highest Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading freelancers...</p>
              </div>
            </div>
          ) : freelancers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search criteria." : "No freelancers are currently available."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {freelancers.map((freelancer) => {
                const name = [freelancer.firstName, freelancer.lastName].filter(Boolean).join(" ");
                return (
                  <Card key={freelancer.uid} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={freelancer.imageUrl} />
                            <AvatarFallback>{name ? name.split(' ').map(n => n[0]).join('') : "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xl">{name}</CardTitle>
                            <CardDescription>{freelancer.title}</CardDescription>
                            <div className="flex items-center space-x-2 text-gray-500 mt-1">
                              <MapPin className="h-4 w-4" />
                              <span>{freelancer.location}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-green-600 mt-1">
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                {freelancer.availability}
                              </Badge>
                              {freelancer.verified && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-orange-600 mb-2">
                            {formatHourlyRate(freelancer.hourlyRate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatBTCRate(freelancer.hourlyRate)}
                          </div>
                          <div className="flex items-center space-x-1 mt-2">
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(freelancer.skills ?? []).slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                        {(freelancer.skills?.length ?? 0) > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{freelancer.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/freelancer/public-profile/${freelancer.uid}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BrowseFreelancers; 